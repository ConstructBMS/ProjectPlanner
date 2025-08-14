import { create } from 'zustand';
import { getProjects, getTasks, getLinks, seedDemoTasks } from '../data/adapter.constructbms';
import { Project, Task, TaskLink } from '../data/types';

interface PlannerState {
  // State
  currentProjectId: string | null;
  projects: Project[];
  tasks: Task[];
  links: TaskLink[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadProjects: () => Promise<void>;
  selectProject: (id: string) => void;
  hydrate: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  // Initial state
  currentProjectId: null,
  projects: [],
  tasks: [],
  links: [],
  loading: false,
  error: null,

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

  // Task actions
  renameTask: (taskId: string, newName: string) => {
    set((state) => ({
      tasks: state.tasks.map(task => 
        task.id === taskId ? { ...task, name: newName } : task
      )
    }));
    
    // Emit event for future backend integration
    window.dispatchEvent(new CustomEvent('TASK_RENAME_COMMIT', {
      detail: { taskId, newName }
    }));
  }
}));
