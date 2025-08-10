import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabase/client';

const ProjectsContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useProjectsContext = () => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjectsContext must be used within a ProjectsProvider');
  }
  return context;
};

export const ProjectsProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalDuration: 0,
    totalCost: 0,
    overdueTasks: 0,
    averageCompletion: 0,
  });

  // Load projects from Supabase
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch projects from Supabase
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) {
        throw new Error(`Error loading projects: ${projectsError.message}`);
      }

      // For now, create mock projects if none exist
      let projectsList = projectsData || [];
      
      if (projectsList.length === 0) {
        // Create mock projects for demonstration
        projectsList = [
          {
            id: '1',
            name: 'Office Building Construction',
            description: 'New 10-story office building in downtown',
            status: 'active',
            start_date: '2024-01-15',
            end_date: '2024-12-31',
            budget: 2500000,
            progress: 65,
            manager: 'John Smith',
            location: 'Downtown',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-08-09T00:00:00Z',
          },
          {
            id: '2',
            name: 'Residential Complex',
            description: '50-unit residential complex with amenities',
            status: 'active',
            start_date: '2024-03-01',
            end_date: '2025-02-28',
            budget: 1800000,
            progress: 35,
            manager: 'Sarah Johnson',
            location: 'Suburban Area',
            created_at: '2024-02-15T00:00:00Z',
            updated_at: '2024-08-09T00:00:00Z',
          },
          {
            id: '3',
            name: 'Shopping Mall Renovation',
            description: 'Complete renovation of existing shopping mall',
            status: 'completed',
            start_date: '2023-06-01',
            end_date: '2024-05-31',
            budget: 1200000,
            progress: 100,
            manager: 'Mike Davis',
            location: 'City Center',
            created_at: '2023-05-01T00:00:00Z',
            updated_at: '2024-06-01T00:00:00Z',
          },
          {
            id: '4',
            name: 'Highway Bridge Construction',
            description: 'New bridge connecting two districts',
            status: 'active',
            start_date: '2024-02-01',
            end_date: '2025-01-31',
            budget: 3500000,
            progress: 45,
            manager: 'Lisa Wilson',
            location: 'Riverside',
            created_at: '2024-01-15T00:00:00Z',
            updated_at: '2024-08-09T00:00:00Z',
          },
          {
            id: '5',
            name: 'Hospital Extension',
            description: 'New wing addition to existing hospital',
            status: 'planning',
            start_date: '2024-09-01',
            end_date: '2026-08-31',
            budget: 4200000,
            progress: 10,
            manager: 'Robert Brown',
            location: 'Medical District',
            created_at: '2024-07-01T00:00:00Z',
            updated_at: '2024-08-09T00:00:00Z',
          },
        ];
      }

      setProjects(projectsList);
      calculateMetrics(projectsList);
    } catch (err) {
      setError(err.message);
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate portfolio metrics
  const calculateMetrics = useCallback((projectsList) => {
    const totalProjects = projectsList.length;
    const activeProjects = projectsList.filter(p => p.status === 'active').length;
    const completedProjects = projectsList.filter(p => p.status === 'completed').length;
    
    const totalDuration = projectsList.reduce((sum, project) => {
      const start = new Date(project.start_date);
      const end = new Date(project.end_date);
      const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return sum + duration;
    }, 0);

    const totalCost = projectsList.reduce((sum, project) => sum + (project.budget || 0), 0);
    
    // Calculate overdue tasks (projects past end date with < 100% progress)
    const overdueTasks = projectsList.filter(project => {
      const endDate = new Date(project.end_date);
      const today = new Date();
      return endDate < today && project.progress < 100;
    }).length;

    const averageCompletion = totalProjects > 0 
      ? projectsList.reduce((sum, project) => sum + (project.progress || 0), 0) / totalProjects
      : 0;

    setMetrics({
      totalProjects,
      activeProjects,
      completedProjects,
      totalDuration,
      totalCost,
      overdueTasks,
      averageCompletion: Math.round(averageCompletion),
    });
  }, []);

  // Add new project
  const addProject = useCallback(async (projectData) => {
    try {
      const newProject = {
        ...projectData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([newProject])
        .select()
        .single();

      if (error) {
        throw new Error(`Error adding project: ${error.message}`);
      }

      setProjects(prev => [data, ...prev]);
      calculateMetrics([data, ...projects]);
      
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error adding project:', err);
      throw err;
    }
  }, [projects, calculateMetrics]);

  // Update project
  const updateProject = useCallback(async (projectId, updates) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating project: ${error.message}`);
      }

      setProjects(prev => 
        prev.map(project => 
          project.id === projectId ? data : project
        )
      );
      
      calculateMetrics(projects.map(project => 
        project.id === projectId ? data : project
      ));
      
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error updating project:', err);
      throw err;
    }
  }, [projects, calculateMetrics]);

  // Delete project
  const deleteProject = useCallback(async (projectId) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        throw new Error(`Error deleting project: ${error.message}`);
      }

      const updatedProjects = projects.filter(project => project.id !== projectId);
      setProjects(updatedProjects);
      calculateMetrics(updatedProjects);
    } catch (err) {
      setError(err.message);
      console.error('Error deleting project:', err);
      throw err;
    }
  }, [projects, calculateMetrics]);

  // Get project by ID
  const getProjectById = useCallback((projectId) => {
    return projects.find(project => project.id === projectId);
  }, [projects]);

  // Get projects by status
  const getProjectsByStatus = useCallback((status) => {
    return projects.filter(project => project.status === status);
  }, [projects]);

  // Get projects by manager
  const getProjectsByManager = useCallback((manager) => {
    return projects.filter(project => project.manager === manager);
  }, [projects]);

  // Get overdue projects
  const getOverdueProjects = useCallback(() => {
    const today = new Date();
    return projects.filter(project => {
      const endDate = new Date(project.end_date);
      return endDate < today && project.progress < 100;
    });
  }, [projects]);

  // Get projects with high risk (low progress, approaching deadline)
  const getHighRiskProjects = useCallback(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return projects.filter(project => {
      const endDate = new Date(project.end_date);
      const isApproachingDeadline = endDate <= thirtyDaysFromNow;
      const isLowProgress = project.progress < 50;
      return isApproachingDeadline && isLowProgress;
    });
  }, [projects]);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const value = {
    projects,
    loading,
    error,
    metrics,
    loadProjects,
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
    getProjectsByStatus,
    getProjectsByManager,
    getOverdueProjects,
    getHighRiskProjects,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
};
