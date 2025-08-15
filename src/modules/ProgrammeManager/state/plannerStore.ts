import { create } from 'zustand';
import { getProjects, getTasks, getLinks, seedDemoTasks, updateTaskPartial, updateTasksBatch, getRealtimeChannel, unsubscribeRealtime, createLink, updateLink, deleteLink } from '../data/adapter.constructbms';
import { Project, Task, TaskLink, TaskUpdate } from '../data/types';
import { networkManager, isOnline } from '../utils/net';
import { safeGetColumn, tableNames, columns } from '../data/adapter.config';
import { useState } from 'react';

// Transform raw DB data to our interface using safe column access
const transformTask = (rawData: any): Task => ({
  id: safeGetColumn(rawData, tableNames.tasks, columns.tasks.id, ''),
  project_id: safeGetColumn(rawData, tableNames.tasks, columns.tasks.project, ''),
  name: safeGetColumn(rawData, tableNames.tasks, columns.tasks.name, ''),
  start_date: safeGetColumn(rawData, tableNames.tasks, columns.tasks.start),
  end_date: safeGetColumn(rawData, tableNames.tasks, columns.tasks.end),
  duration_days: safeGetColumn(rawData, tableNames.tasks, columns.tasks.duration),
  progress: safeGetColumn(rawData, tableNames.tasks, columns.tasks.progress),
  status: safeGetColumn(rawData, tableNames.tasks, columns.tasks.status),
  wbs: safeGetColumn(rawData, tableNames.tasks, columns.tasks.wbs),
  resource_id: safeGetColumn(rawData, tableNames.tasks, columns.tasks.resource),
  description: safeGetColumn(rawData, tableNames.tasks, 'description'),
  priority: safeGetColumn(rawData, tableNames.tasks, 'priority'),
  parent_task_id: safeGetColumn(rawData, tableNames.tasks, 'parent_task_id'),
  assigned_to: safeGetColumn(rawData, tableNames.tasks, 'assigned_to'),
  estimated_hours: safeGetColumn(rawData, tableNames.tasks, 'estimated_hours'),
  actual_hours: safeGetColumn(rawData, tableNames.tasks, 'actual_hours'),
  cost: safeGetColumn(rawData, tableNames.tasks, 'cost'),
  created_at: safeGetColumn(rawData, tableNames.tasks, 'created_at'),
  updated_at: safeGetColumn(rawData, tableNames.tasks, 'updated_at')
});

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
  // Core data
  projects: Project[];
  tasks: Task[];
  links: TaskLink[];
  currentProjectId: string | null;
  
  // UI state
  selectedTaskIds: Set<string>;
  lastSelectedTaskId: string | null;
  
  // Loading and error state
  loading: boolean;
  lastError: string | null;
  hasInitialized: boolean;
  
  // Mutation state
  pendingMutations: Map<string, any>;
  mutationTimeouts: Map<string, NodeJS.Timeout>;
  offlineQueue: any[];
  syncPending: boolean;
  
  // Realtime state
  realtimeSubscribed: boolean;
  ganttRelayoutTimeout: NodeJS.Timeout | null;
  
  // Zoom and timescale state
  zoomScale: number;
  zoomCenterDate: Date | null;
  isZooming: boolean;
  
  // Bar text options state
  barTextOptions: {
    taskName: boolean;
    id: boolean;
    percentComplete: boolean;
    start: boolean;
    finish: boolean;
  };
  
  // Hydration pipeline state
  hydrationState: 'idle' | 'loadingProjects' | 'projectsLoaded' | 'hydrating' | 'ready' | 'error';
  hydrationError: string | null;
  
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
  
  // Realtime subscription management
  subscribeProject: (projectId: string) => void;
  unsubscribeProject: () => void;
  handleRealtimeUpdate: (event: CustomEvent) => void;
  handleRealtimeLinkUpdate: (event: CustomEvent) => void;
  triggerGanttRelayout: () => void;
  
  // Selection management
  selectOne: (taskId: string) => void;
  setSelectedTaskId: (taskId: string) => void; // Alias for selectOne
  toggleSelection: (taskId: string) => void;
  selectRange: (startId: string, endId: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  getSelectedTasks: () => Task[];
  getSelectedCount: () => number;
  
  // Link management
  createTaskLink: (predecessorId: string, successorId: string, type: string, lagDays: number) => Promise<boolean>;
  updateTaskLink: (linkId: string, type: string, lagDays: number) => Promise<boolean>;
  deleteTaskLink: (linkId: string) => Promise<boolean>;
  createChainLinks: (taskIds: string[], type: string, lagDays: number) => Promise<boolean>;
  
  // Hydration pipeline
  init: () => Promise<void>;
  loadProjects: () => Promise<void>;
  selectProject: (id: string) => Promise<void>;
  hydrate: (projectId: string) => Promise<void>;
  
  // Legacy task actions (kept for backward compatibility)
  renameTask: (taskId: string, newName: string) => void;
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  // Core data
  projects: [],
  tasks: [],
  links: [],
  currentProjectId: null,
  
  // UI state
  selectedTaskIds: new Set(),
  lastSelectedTaskId: null,
  
  // Loading and error state
  loading: false,
  lastError: null,
  hasInitialized: false,
  
  // Mutation state
  pendingMutations: new Map(),
  mutationTimeouts: new Map(),
  offlineQueue: [],
  syncPending: false,
  
  // Realtime state
  realtimeSubscribed: false,
  ganttRelayoutTimeout: null,
  
  // Zoom and timescale state
  zoomScale: 1.0,
  zoomCenterDate: null,
  isZooming: false,
  
  // Bar text options state
  barTextOptions: {
    taskName: true,
    id: false,
    percentComplete: false,
    start: false,
    finish: false
  },
  
  // Hydration pipeline state
  hydrationState: 'idle',
  hydrationError: null,
  




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

  // Realtime subscription management
  subscribeProject: (projectId: string) => {
    try {
      getRealtimeChannel(projectId);
      set({ realtimeSubscribed: true });
      console.log('Subscribed to realtime updates for project:', projectId);
    } catch (error) {
      console.error('Failed to subscribe to realtime updates:', error);
      set({ realtimeSubscribed: false });
    }
  },

  unsubscribeProject: () => {
    try {
      unsubscribeRealtime();
      set({ realtimeSubscribed: false });
      console.log('Unsubscribed from realtime updates');
    } catch (error) {
      console.error('Failed to unsubscribe from realtime updates:', error);
    }
  },

  // Handle realtime task updates
  handleRealtimeUpdate: (event: CustomEvent) => {
    const { type, data, old } = event.detail;
    const state = get();

    console.log('Handling realtime task update:', type, data);

    switch (type) {
      case 'INSERT':
        if (data) {
          const transformedTask = transformTask(data);
          set((state) => ({
            tasks: [...state.tasks, transformedTask]
          }));
          get().triggerGanttRelayout();
        }
        break;

      case 'UPDATE':
        if (data) {
          const transformedTask = transformTask(data);
          set((state) => ({
            tasks: state.tasks.map(task => 
              task.id === transformedTask.id ? transformedTask : task
            )
          }));
          get().triggerGanttRelayout();
        }
        break;

      case 'DELETE':
        if (old) {
          set((state) => ({
            tasks: state.tasks.filter(task => task.id !== old.id)
          }));
          get().triggerGanttRelayout();
        }
        break;

      default:
        console.warn('Unknown realtime event type:', type);
    }
  },

  // Handle realtime task link updates
  handleRealtimeLinkUpdate: (event: CustomEvent) => {
    const { type, data, old } = event.detail;
    const state = get();

    console.log('Handling realtime task link update:', type, data);

    switch (type) {
      case 'INSERT':
        if (data) {
          set((state) => ({
            links: [...state.links, data]
          }));
          get().triggerGanttRelayout();
        }
        break;

      case 'UPDATE':
        if (data) {
          set((state) => ({
            links: state.links.map(link => 
              link.id === data.id ? data : link
            )
          }));
          get().triggerGanttRelayout();
        }
        break;

      case 'DELETE':
        if (old) {
          set((state) => ({
            links: state.links.filter(link => link.id !== old.id)
          }));
          get().triggerGanttRelayout();
        }
        break;

      default:
        console.warn('Unknown realtime link event type:', type);
    }
  },

  // Debounced Gantt re-layout
  triggerGanttRelayout: () => {
    const state = get();
    
    // Clear existing timeout
    if (state.ganttRelayoutTimeout) {
      clearTimeout(state.ganttRelayoutTimeout);
    }

    // Set new timeout for debounced re-layout
    const timeout = setTimeout(() => {
      // Dispatch event to trigger Gantt re-layout
      window.dispatchEvent(new CustomEvent('GANTT_RELAYOUT'));
      set({ ganttRelayoutTimeout: null });
    }, 100);

    set({ ganttRelayoutTimeout: timeout });
  },

  // Selection management
  selectOne: (taskId: string) => {
    set({ selectedTaskIds: new Set([taskId]), lastSelectedTaskId: taskId });
  },
  setSelectedTaskId: (taskId: string) => {
    set({ selectedTaskIds: new Set([taskId]), lastSelectedTaskId: taskId });
  },
  toggleSelection: (taskId: string) => {
    const newSelected = new Set(get().selectedTaskIds);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    set({ selectedTaskIds: newSelected, lastSelectedTaskId: taskId });
  },
  selectRange: (startId: string, endId: string) => {
    const state = get();
    const tasks = state.tasks;
    const startIndex = tasks.findIndex(task => task.id === startId);
    const endIndex = tasks.findIndex(task => task.id === endId);
    
    if (startIndex === -1 || endIndex === -1) {
      return;
    }
    
    const newSelected = new Set(state.selectedTaskIds);
    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);
    
    // Add all tasks in the range
    for (let i = minIndex; i <= maxIndex; i++) {
      newSelected.add(tasks[i].id);
    }
    
    set({ selectedTaskIds: newSelected, lastSelectedTaskId: endId });
  },
  clearSelection: () => {
    set({ selectedTaskIds: new Set(), lastSelectedTaskId: null });
  },
  selectAll: () => {
    set({ selectedTaskIds: new Set(get().tasks.map(task => task.id)), lastSelectedTaskId: null });
  },
  getSelectedTasks: () => {
    return Array.from(get().selectedTaskIds).map(id => get().tasks.find(task => task.id === id));
  },
  getSelectedCount: () => {
    return get().selectedTaskIds.size;
  },

  // Link management
  createTaskLink: async (predecessorId: string, successorId: string, type: string, lagDays: number): Promise<boolean> => {
    const state = get();
    const currentProjectId = state.currentProjectId;
    
    if (!currentProjectId) {
      console.error('No project selected for link creation');
      return false;
    }

    try {
      const success = await createLink(currentProjectId, predecessorId, successorId, type, lagDays);
      
      if (success) {
        // Optimistic update - add the new link to the store
        const newLink: TaskLink = {
          id: `temp-${Date.now()}`, // Temporary ID until we get the real one from DB
          project_id: currentProjectId,
          pred_id: predecessorId,
          succ_id: successorId,
          type: type,
          lag_days: lagDays,
          created_at: new Date().toISOString()
        };
        
        set((state) => ({
          links: [...state.links, newLink]
        }));
        
        // Trigger Gantt re-layout
        get().triggerGanttRelayout();
      }
      
      return success;
    } catch (error) {
      console.error('Error creating task link:', error);
      return false;
    }
  },

  updateTaskLink: async (linkId: string, type: string, lagDays: number): Promise<boolean> => {
    const state = get();
    const currentProjectId = state.currentProjectId;
    
    if (!currentProjectId) {
      console.error('No project selected for link update');
      return false;
    }

    try {
      const success = await updateLink(currentProjectId, linkId, type, lagDays);
      
      if (success) {
        // Optimistic update - update the link in the store
        set((state) => ({
          links: state.links.map(link => 
            link.id === linkId 
              ? { ...link, type, lag_days: lagDays }
              : link
          )
        }));
        
        // Trigger Gantt re-layout
        get().triggerGanttRelayout();
      }
      
      return success;
    } catch (error) {
      console.error('Error updating task link:', error);
      return false;
    }
  },

  deleteTaskLink: async (linkId: string): Promise<boolean> => {
    const state = get();
    const currentProjectId = state.currentProjectId;
    
    if (!currentProjectId) {
      console.error('No project selected for link deletion');
      return false;
    }

    try {
      const success = await deleteLink(currentProjectId, linkId);
      
      if (success) {
        // Optimistic update - remove the link from the store
        set((state) => ({
          links: state.links.filter(link => link.id !== linkId)
        }));
        
        // Trigger Gantt re-layout
        get().triggerGanttRelayout();
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting task link:', error);
      return false;
    }
  },

  createChainLinks: async (taskIds: string[], type: string, lagDays: number): Promise<boolean> => {
    if (taskIds.length < 2) {
      console.error('Need at least 2 tasks to create chain links');
      return false;
    }

    try {
      const results = [];
      
      // Create links in chain order: A→B, B→C, C→D, etc.
      for (let i = 0; i < taskIds.length - 1; i++) {
        const predecessorId = taskIds[i];
        const successorId = taskIds[i + 1];
        const success = await get().createTaskLink(predecessorId, successorId, type, lagDays);
        results.push(success);
      }
      
      const allSuccess = results.every(result => result === true);
      
      if (allSuccess) {
        console.log(`Created ${taskIds.length - 1} chain links successfully`);
      } else {
        console.error('Some chain links failed to create');
      }
      
      return allSuccess;
    } catch (error) {
      console.error('Error creating chain links:', error);
      return false;
    }
  },

  // Loading and error management
  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ lastError: error });
  },

  clearError: () => {
    set({ lastError: null });
  },

  // Hydration pipeline
  init: async () => {
    const state = get();
    if (state.hydrationState !== 'idle') {
      console.log('Hydration already in progress, skipping init');
      return;
    }

    try {
      console.log('Starting hydration pipeline...');
      set({ hydrationState: 'loadingProjects', hydrationError: null });
      
      await get().loadProjects();
      
      // Choose default project (last updated or first)
      const projects = get().projects;
      if (projects.length === 0) {
        throw new Error('No projects available');
      }
      
      // Sort by updated_at descending, then by created_at descending
      const sortedProjects = [...projects].sort((a, b) => {
        const aDate = new Date(a.updated_at || a.created_at || 0);
        const bDate = new Date(b.updated_at || b.created_at || 0);
        return bDate.getTime() - aDate.getTime();
      });
      
      const defaultProjectId = sortedProjects[0].id;
      console.log('Selected default project:', defaultProjectId);
      
      await get().selectProject(defaultProjectId);
      await get().hydrate(defaultProjectId);
      
      set({ hydrationState: 'ready' });
      console.log('Hydration pipeline completed successfully');
    } catch (error) {
      console.error('Hydration pipeline failed:', error);
      set({ 
        hydrationState: 'error', 
        hydrationError: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  },

  loadProjects: async () => {
    try {
      set({ hydrationState: 'loadingProjects' });
      
      const projects = await getProjects();
      set({ 
        projects,
        hydrationState: 'projectsLoaded'
      });
      
      console.log('Projects loaded:', projects.length);
    } catch (error) {
      console.error('Failed to load projects:', error);
      set({ 
        hydrationState: 'error',
        hydrationError: error instanceof Error ? error.message : 'Failed to load projects'
      });
      throw error;
    }
  },

  selectProject: async (projectId: string) => {
    try {
      // Unsubscribe from previous project's realtime
      if (get().realtimeSubscribed) {
        get().unsubscribeProject();
      }
      
      set({ currentProjectId: projectId });
      console.log('Project selected:', projectId);
    } catch (error) {
      console.error('Failed to select project:', error);
      throw error;
    }
  },

  hydrate: async (projectId: string) => {
    try {
      set({ hydrationState: 'hydrating' });
      
      // Check if we've already seeded this project to prevent loops
      const seededFlag = `pm.seeded.${projectId}`;
      const isAlreadySeeded = localStorage.getItem(seededFlag);
      
      let tasks: Task[] = [];
      let links: TaskLink[] = [];
      let needsSeeding = false;
      
      try {
        // Load tasks and links
        const [tasksResult, linksResult] = await Promise.all([
          getTasks(projectId),
          getLinks(projectId)
        ]);
        
        tasks = tasksResult;
        links = linksResult;
        
        // Check if we need to seed demo data
        needsSeeding = (tasks.length === 0 || links.length === 0) && !isAlreadySeeded;
        
        if (needsSeeding) {
          console.log('No tasks/links found and not previously seeded, seeding demo data...');
        } else {
          console.log('Project hydrated with existing data:', { 
            tasksCount: tasks.length, 
            linksCount: links.length,
            wasSeeded: !!isAlreadySeeded
          });
        }
      } catch (dbError) {
        console.warn('Database query failed, will attempt demo seeding:', dbError);
        needsSeeding = !isAlreadySeeded;
      }
      
      // Seed demo data if needed
      if (needsSeeding) {
        try {
          console.log('Seeding demo data for project:', projectId);
          
          // Seed demo data
          const seeded = await seedDemoTasks(projectId);
          if (!seeded) {
            throw new Error('Failed to seed demo data');
          }
          
          // Set seeded flag to prevent infinite loops
          localStorage.setItem(seededFlag, 'true');
          
          // Re-fetch tasks and links after seeding
          const [seededTasks, seededLinks] = await Promise.all([
            getTasks(projectId),
            getLinks(projectId)
          ]);
          
          tasks = seededTasks;
          links = seededLinks;
          
          console.log('Demo data seeded and re-hydrated successfully:', { 
            tasksCount: tasks.length, 
            linksCount: links.length 
          });
        } catch (seedError) {
          console.error('Failed to seed demo data:', seedError);
          set({ 
            hydrationState: 'error',
            hydrationError: `Failed to seed demo data: ${seedError instanceof Error ? seedError.message : 'Unknown error'}`
          });
          throw seedError;
        }
      }
      
      // Ensure we always have some data
      if (tasks.length === 0 && links.length === 0) {
        console.warn('No data available after all attempts, setting error state');
        set({ 
          hydrationState: 'error',
          hydrationError: 'No data available from database or demo seeding'
        });
        throw new Error('No data available from database or demo seeding');
      }
      
      // Set the data
      set({ tasks, links });
      
      // Subscribe to realtime updates
      get().subscribeProject(projectId);
      set({ hydrationState: 'ready' });
      
      // Trigger fit project after first successful hydration
      const fitFlag = `pm.fitOnce.${projectId}`;
      const hasFitted = localStorage.getItem(fitFlag);
      
      if (!hasFitted && tasks.length > 0) {
        // Dispatch custom event to trigger fit project
        window.dispatchEvent(new CustomEvent('FIT_PROJECT', { 
          detail: { projectId, tasksCount: tasks.length } 
        }));
        
        // Mark as fitted for this project
        localStorage.setItem(fitFlag, 'true');
        console.log('Fit project triggered for project:', projectId);
      }
      
    } catch (error) {
      console.error('Failed to hydrate project:', error);
      set({ 
        hydrationState: 'error',
        hydrationError: error instanceof Error ? error.message : 'Failed to hydrate project'
      });
      throw error;
    }
  },

  // Legacy task actions (kept for backward compatibility)
  renameTask: (taskId: string, newName: string) => {
    get().mutateTask(taskId, { name: newName });
  }
}));
