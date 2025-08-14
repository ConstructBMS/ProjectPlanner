// Project Store - Lightweight persistence for project information
// Uses Supabase if available, falls back to localStorage

interface ProjectInfo {
  name: string;
  code: string;
  startDate: string;
  finishDate: string;
  autoFinish: boolean;
  calendar: 'standard' | '24x7' | 'custom';
}

class ProjectStore {
  private supabase: any = null;

  constructor() {
    this.initializeSupabase();
  }

  private async initializeSupabase() {
    try {
      // Try to import Supabase client
      const { supabase } = await import('../../../supabase/client');
      this.supabase = supabase;
    } catch (error) {
      console.warn('Supabase not available, using localStorage fallback');
      this.supabase = null;
    }
  }

  /**
   * Get project information
   */
  async getInfo(projectId: string): Promise<ProjectInfo | null> {
    try {
      // Try Supabase first
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('project_info')
          .select('*')
          .eq('project_id', projectId)
          .maybeSingle();

        if (error) {
          if (error.code === 'PGRST116') {
            // No data found, try localStorage
            return this.getFromLocalStorage(projectId);
          }
          throw error;
        }

        if (data) {
          return data.info as ProjectInfo;
        }
      }

      // Fallback to localStorage
      return this.getFromLocalStorage(projectId);
    } catch (error) {
      console.warn('Failed to get project info from Supabase, using localStorage:', error);
      return this.getFromLocalStorage(projectId);
    }
  }

  /**
   * Set project information
   */
  async setInfo(projectId: string, info: ProjectInfo): Promise<void> {
    try {
      // Try Supabase first
      if (this.supabase) {
        const { error } = await this.supabase
          .from('project_info')
          .upsert({
            project_id: projectId,
            info: info,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'project_id'
          });

        if (error) {
          throw error;
        }

        // Also save to localStorage as backup
        this.saveToLocalStorage(projectId, info);
        return;
      }

      // Fallback to localStorage only
      this.saveToLocalStorage(projectId, info);
    } catch (error) {
      console.warn('Failed to save project info to Supabase, using localStorage:', error);
      this.saveToLocalStorage(projectId, info);
    }
  }

  /**
   * Get project info from localStorage
   */
  private getFromLocalStorage(projectId: string): ProjectInfo | null {
    try {
      const key = `pm.project.${projectId}.info`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to read project info from localStorage:', error);
      return null;
    }
  }

  /**
   * Save project info to localStorage
   */
  private saveToLocalStorage(projectId: string, info: ProjectInfo): void {
    try {
      const key = `pm.project.${projectId}.info`;
      localStorage.setItem(key, JSON.stringify(info));
    } catch (error) {
      console.error('Failed to save project info to localStorage:', error);
      throw error;
    }
  }

  /**
   * Delete project information
   */
  async deleteInfo(projectId: string): Promise<void> {
    try {
      // Try Supabase first
      if (this.supabase) {
        const { error } = await this.supabase
          .from('project_info')
          .delete()
          .eq('project_id', projectId);

        if (error) {
          throw error;
        }
      }

      // Also remove from localStorage
      this.deleteFromLocalStorage(projectId);
    } catch (error) {
      console.warn('Failed to delete project info from Supabase, using localStorage:', error);
      this.deleteFromLocalStorage(projectId);
    }
  }

  /**
   * Delete project info from localStorage
   */
  private deleteFromLocalStorage(projectId: string): void {
    try {
      const key = `pm.project.${projectId}.info`;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to delete project info from localStorage:', error);
    }
  }

  /**
   * Get all project IDs that have stored info
   */
  async getAllProjectIds(): Promise<string[]> {
    try {
      // Try Supabase first
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('project_info')
          .select('project_id');

        if (error) {
          throw error;
        }

        return data?.map(row => row.project_id) || [];
      }

      // Fallback to localStorage
      return this.getAllProjectIdsFromLocalStorage();
    } catch (error) {
      console.warn('Failed to get project IDs from Supabase, using localStorage:', error);
      return this.getAllProjectIdsFromLocalStorage();
    }
  }

  /**
   * Get all project IDs from localStorage
   */
  private getAllProjectIdsFromLocalStorage(): string[] {
    try {
      const projectIds: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('pm.project.') && key.endsWith('.info')) {
          const projectId = key.replace('pm.project.', '').replace('.info', '');
          projectIds.push(projectId);
        }
      }
      return projectIds;
    } catch (error) {
      console.warn('Failed to get project IDs from localStorage:', error);
      return [];
    }
  }

  // Calendar methods
  async getCalendar(projectId: string): Promise<any | null> {
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('project_calendars')
          .select('*')
          .eq('project_id', projectId)
          .maybeSingle();

        if (error) {
          if (error.code === 'PGRST116') {
            return this.getCalendarFromLocalStorage(projectId);
          }
          throw error;
        }

        if (data) {
          return data.calendar;
        }
      }
      return this.getCalendarFromLocalStorage(projectId);
    } catch (error) {
      console.warn('Failed to get calendar from Supabase, using localStorage:', error);
      return this.getCalendarFromLocalStorage(projectId);
    }
  }

  async setCalendar(projectId: string, calendar: any): Promise<void> {
    try {
      if (this.supabase) {
        const { error } = await this.supabase
          .from('project_calendars')
          .upsert({
            project_id: projectId,
            calendar: calendar,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'project_id'
          });

        if (error) {
          throw error;
        }
        this.saveCalendarToLocalStorage(projectId, calendar);
        return;
      }
      this.saveCalendarToLocalStorage(projectId, calendar);
    } catch (error) {
      console.warn('Failed to save calendar to Supabase, using localStorage:', error);
      this.saveCalendarToLocalStorage(projectId, calendar);
    }
  }

  private getCalendarFromLocalStorage(projectId: string): any | null {
    try {
      const key = `pm.project.${projectId}.calendar`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to read calendar from localStorage:', error);
      return null;
    }
  }

  private saveCalendarToLocalStorage(projectId: string, calendar: any): void {
    try {
      const key = `pm.project.${projectId}.calendar`;
      localStorage.setItem(key, JSON.stringify(calendar));
    } catch (error) {
      console.error('Failed to save calendar to localStorage:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const projectStore = new ProjectStore();
