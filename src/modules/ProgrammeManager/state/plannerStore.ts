import { create } from 'zustand';
import { getProjects, getTasks, getLinks, seedDemoTasks, updateTaskPartial, updateTasksBatch } from '../data/adapter.constructbms';
import { Project, Task, TaskLink, TaskUpdate } from '../data/types';
import { networkManager, isOnline } from '../utils/net';

interface MutationQueue {
  taskId: string;
  patch: Partial<TaskUpdate>;
  timestamp: number;
}

interface OfflineQueue {
  taskId: string;
  patch: Partial<TaskUpdate>;
  timestamp: number;
}

interface PlannerState {
  // State
  currentProjectId: string | null;
  projects: Project[];
  tasks: Task[];
  links: TaskLink[];
  loading: boolean;
  error: string | null;
  
  // Optimistic updates
  pendingMutations: Map<string, MutationQueue>;
  mutationTimeouts: Map<string, NodeJS.Timeout>;
  
  // Offline queue
  offlineQueue: OfflineQueue[];
  syncPending: boolean;
  
  // Actions
  loadProjects: () => Promise<void>;
  selectProject: (id: string) => void;
  hydrate: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Task mutations
  mutateTask: (taskId: string, patch: Partial<TaskUpdate>) => Promise<boolean>;
  flushTaskMutations: (taskId: string) => Promise<void>;
  rollbackTask: (taskId: string) => void;
  
  // Offline queue management
  addToOfflineQueue: (taskId: string, patch: Partial<TaskUpdate>) => void;
  flushOfflineQueue: () => Promise<void>;
  clearOfflineQueue: () => void;
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  // Initial state
  currentProjectId: null,
  projects: [],
  tasks: [],
  links: [],
  loading: false,
  error: null,
  pendingMutations: new Map(),
  mutationTimeouts: new Map(),
  offlineQueue: [],
  syncPending: false,

  // Load all projects from ConstructBMS
  loadProjects: async () => {
    set({ loading: true, error: null });
    
    try {
      const result = await getProjects();
      
      if (result.error) {
        set({ error: result.error, loading: false });
        return;
      }

      set({ 
        projects: result.data,
        loading: false 
      });

      // Auto-select the most recent project if available
      if (result.data.length > 0 && !get().currentProjectId) {
        const mostRecent = result.data[0]; // Assuming sorted by created_at desc
        get().selectProject(mostRecent.id);
        await get().hydrate(mostRecent.id);
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load projects',
        loading: false 
      });
    }
  },

  // Select a project (doesn't load data yet)
  selectProject: (id: string) => {
    set({ currentProjectId: id });
  },

  // Hydrate planner with project data
  hydrate: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      // Load tasks
      const tasksResult = await getTasks(id);
      if (tasksResult.error) {
        set({ error: tasksResult.error, loading: false });
        return;
      }

      // Load links
      const linksResult = await getLinks(id);
      if (linksResult.error) {
        set({ error: linksResult.error, loading: false });
        return;
      }

      // If no tasks found and we're in demo mode, seed demo data
      if (tasksResult.isDemo && tasksResult.data.length === 0) {
        console.log('No tasks found, attempting to seed demo data...');
        const seeded = await seedDemoTasks(id);
        
        if (seeded) {
          // Reload tasks and links after seeding
          const reloadedTasks = await getTasks(id);
          const reloadedLinks = await getLinks(id);
          
          set({
            tasks: reloadedTasks.data,
            links: reloadedLinks.data,
            loading: false
          });
          return;
        }
      }

      // Set the loaded data
      set({
        tasks: tasksResult.data,
        links: linksResult.data,
        loading: false
      });

    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load project data',
        loading: false 
      });
    }
  },

  // Utility actions
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),

  // Task mutations with optimistic updates and batching
  mutateTask: async (taskId: string, patch: Partial<TaskUpdate>): Promise<boolean> => {
    const state = get();
    const currentProjectId = state.currentProjectId;
    
    if (!currentProjectId) {
      console.error('No project selected for task mutation');
      return false;
    }

    // Find the current task for snapshot
    const currentTask = state.tasks.find(task => task.id === taskId);
    if (!currentTask) {
      console.error('Task not found for mutation:', taskId);
      return false;
    }

    // Create optimistic update
    const optimisticTask = { ...currentTask, ...patch };
    
    // Apply optimistic update immediately
    set((state) => ({
      tasks: state.tasks.map(task => 
        task.id === taskId ? optimisticTask : task
      )
    }));

    // Check if we're offline
    if (!isOnline()) {
      // Add to offline queue
      get().addToOfflineQueue(taskId, patch);
      return true;
    }

    // Clear existing timeout for this task
    const existingTimeout = state.mutationTimeouts.get(taskId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Create new mutation queue entry
    const mutation: MutationQueue = {
      taskId,
      patch,
      timestamp: Date.now()
    };

    // Update pending mutations
    const newPendingMutations = new Map(state.pendingMutations);
    newPendingMutations.set(taskId, mutation);
    
    // Set timeout for debounced update (500ms for batching)
    const timeout = setTimeout(async () => {
      await get().flushTaskMutations(taskId);
    }, 500);

    const newMutationTimeouts = new Map(state.mutationTimeouts);
    newMutationTimeouts.set(taskId, timeout);

    set({
      pendingMutations: newPendingMutations,
      mutationTimeouts: newMutationTimeouts
    });

    return true;
  },

  // Flush mutations for a specific task
  flushTaskMutations: async (taskId: string) => {
    const state = get();
    const mutation = state.pendingMutations.get(taskId);
    const currentProjectId = state.currentProjectId;
    
    if (!mutation || !currentProjectId) {
      return;
    }

    // Check if we're offline
    if (!isOnline()) {
      // Move to offline queue
      get().addToOfflineQueue(taskId, mutation.patch);
      
      // Remove from pending mutations
      const newPendingMutations = new Map(state.pendingMutations);
      newPendingMutations.delete(taskId);
      
      const newMutationTimeouts = new Map(state.mutationTimeouts);
      newMutationTimeouts.delete(taskId);
      
      set({
        pendingMutations: newPendingMutations,
        mutationTimeouts: newMutationTimeouts,
        syncPending: true
      });
      return;
    }

    try {
      // Attempt to update the database
      const success = await updateTaskPartial(currentProjectId, taskId, mutation.patch);
      
      if (success) {
        // Remove from pending mutations on success
        const newPendingMutations = new Map(state.pendingMutations);
        newPendingMutations.delete(taskId);
        
        const newMutationTimeouts = new Map(state.mutationTimeouts);
        newMutationTimeouts.delete(taskId);
        
        set({
          pendingMutations: newPendingMutations,
          mutationTimeouts: newMutationTimeouts
        });
      } else {
        // Rollback on failure
        get().rollbackTask(taskId);
        throw new Error('Failed to save changes');
      }
    } catch (error) {
      // Rollback on error
      get().rollbackTask(taskId);
      throw error;
    }
  },

  // Rollback optimistic update
  rollbackTask: (taskId: string) => {
    const state = get();
    const mutation = state.pendingMutations.get(taskId);
    
    if (!mutation) {
      return;
    }

    // Find the original task data (we'll need to reload from DB or store original)
    // For now, we'll reload the task from the database
    if (state.currentProjectId) {
      getTasks(state.currentProjectId).then(result => {
        if (!result.error && result.data) {
          const originalTask = result.data.find(task => task.id === taskId);
          if (originalTask) {
            set((state) => ({
              tasks: state.tasks.map(task => 
                task.id === taskId ? originalTask : task
              )
            }));
          }
        }
      });
    }

    // Clear pending mutations
    const newPendingMutations = new Map(state.pendingMutations);
    newPendingMutations.delete(taskId);
    
    const newMutationTimeouts = new Map(state.mutationTimeouts);
    newMutationTimeouts.delete(taskId);
    
    set({
      pendingMutations: newPendingMutations,
      mutationTimeouts: newMutationTimeouts
    });
  },

  // Offline queue management
  addToOfflineQueue: (taskId: string, patch: Partial<TaskUpdate>) => {
    const state = get();
    const queueEntry: OfflineQueue = {
      taskId,
      patch,
      timestamp: Date.now()
    };

    set((state) => ({
      offlineQueue: [...state.offlineQueue, queueEntry],
      syncPending: true
    }));

    console.log('Added to offline queue:', queueEntry);
  },

  flushOfflineQueue: async () => {
    const state = get();
    const currentProjectId = state.currentProjectId;
    
    if (!currentProjectId || state.offlineQueue.length === 0 || !isOnline()) {
      return;
    }

    try {
      console.log('Flushing offline queue with', state.offlineQueue.length, 'items');
      
      // Convert queue to batch format
      const batchPatches = state.offlineQueue.map(entry => ({
        taskId: entry.taskId,
        patch: entry.patch
      }));

      // Attempt batch update
      const success = await updateTasksBatch(currentProjectId, batchPatches);
      
      if (success) {
        // Clear the queue on success
        set({
          offlineQueue: [],
          syncPending: false
        });
        console.log('Offline queue flushed successfully');
      } else {
        console.error('Failed to flush offline queue');
        // Keep the queue for retry
        set({ syncPending: true });
      }
    } catch (error) {
      console.error('Error flushing offline queue:', error);
      // Keep the queue for retry
      set({ syncPending: true });
    }
  },

  clearOfflineQueue: () => {
    set({
      offlineQueue: [],
      syncPending: false
    });
  },

  // Legacy task actions (kept for backward compatibility)
  renameTask: (taskId: string, newName: string) => {
    get().mutateTask(taskId, { name: newName });
  }
}));
