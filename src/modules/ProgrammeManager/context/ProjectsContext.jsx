 
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { supabase } from '../../../supabase/client';
import { getCachedTableExists } from '../utils/databaseSchema.js';

const ProjectsContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useProjectsContext = () => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error(
      'useProjectsContext must be used within a ProjectsProvider'
    );
  }
  return context;
};

export const ProjectsProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [enhancedProjects, setEnhancedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalDuration: 0,
    totalCost: 0,
    totalEstimatedHours: 0,
    totalActualHours: 0,
    overdueTasks: 0,
    averageCompletion: 0,
    highPriorityProjects: 0,
  });

  // Load projects from Supabase with enhanced fields
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if table exists using cached result
      const tableExists = getCachedTableExists('projects');
      if (!tableExists) {
        console.info('Using mock project data (database table not found)');
        setProjects([]);
        setEnhancedProjects([]);
        calculateMetrics([], []);
        return;
      }

      // Fetch projects with enhanced ProjectPlanner fields
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) {
        throw new Error(`Error loading projects: ${projectsError.message}`);
      }

      // Fetch enhanced projects view for additional calculated fields
      const { data: enhancedData, error: enhancedError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (enhancedError) {
        console.warn(
          'Enhanced projects view not available, using basic data:',
          enhancedError.message
        );
      }

      // Use real data from ConstructBMS database
      const projectsList = projectsData || [];
      const enhancedProjectsList = enhancedData || [];

      // Only log if we have actual data
      if (projectsList.length > 0) {
        console.log(
          'Loaded projects from database:',
          projectsList.length,
          'projects'
        );
      }

      // If no projects exist, show a message but don't create mock data
      if (projectsList.length === 0) {
        console.info(
          'No projects found in database. Please add some projects to see them here.'
        );
      }

      setProjects(projectsList);
      setEnhancedProjects(enhancedProjectsList);
      calculateMetrics(projectsList, enhancedProjectsList);
    } catch (err) {
      setError(err.message);
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate portfolio metrics with enhanced fields
  const calculateMetrics = useCallback((projectsList, enhancedProjectsList) => {
    const totalProjects = projectsList.length;
    const activeProjects = projectsList.filter(
      p => p.status === 'active'
    ).length;
    const completedProjects = projectsList.filter(
      p => p.status === 'completed'
    ).length;

    const totalDuration = projectsList.reduce((sum, project) => {
      const start = new Date(project.start_date);
      const end = new Date(project.end_date);
      const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return sum + duration;
    }, 0);

    const totalCost = projectsList.reduce(
      (sum, project) => sum + (project.budget || 0),
      0
    );

    const totalEstimatedHours = projectsList.reduce(
      (sum, project) => sum + (project.estimated_hours || 0),
      0
    );

    const totalActualHours = projectsList.reduce(
      (sum, project) => sum + (project.actual_hours || 0),
      0
    );

    // Calculate overdue tasks (projects past end date with < 100% progress)
    const overdueTasks = projectsList.filter(project => {
      const endDate = new Date(project.end_date);
      const today = new Date();
      return endDate < today && project.progress < 100;
    }).length;

    const averageCompletion =
      totalProjects > 0
        ? projectsList.reduce(
            (sum, project) => sum + (project.progress || 0),
            0
          ) / totalProjects
        : 0;

    const highPriorityProjects = projectsList.filter(
      project =>
        project.projectplanner_priority === 'high' ||
        project.projectplanner_priority === 'critical'
    ).length;

    setMetrics({
      totalProjects,
      activeProjects,
      completedProjects,
      totalDuration,
      totalCost,
      totalEstimatedHours,
      totalActualHours,
      overdueTasks,
      averageCompletion: Math.round(averageCompletion),
      highPriorityProjects,
    });
  }, []);

  // Add new project with enhanced fields
  const addProject = useCallback(
    async projectData => {
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
        calculateMetrics([data, ...projects], enhancedProjects);

        return data;
      } catch (err) {
        setError(err.message);
        console.error('Error adding project:', err);
        throw err;
      }
    },
    [projects, enhancedProjects, calculateMetrics]
  );

  // Update project with enhanced fields
  const updateProject = useCallback(
    async (projectId, updates) => {
      try {
        const { data, error } = await supabase
          .from('asta_projects')
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
          prev.map(project => (project.id === projectId ? data : project))
        );

        calculateMetrics(
          projects.map(project => (project.id === projectId ? data : project)),
          enhancedProjects
        );

        return data;
      } catch (err) {
        setError(err.message);
        console.error('Error updating project:', err);
        throw err;
      }
    },
    [projects, enhancedProjects, calculateMetrics]
  );

  // Delete project
  const deleteProject = useCallback(
    async projectId => {
      try {
        const { error } = await supabase
          .from('asta_projects')
          .delete()
          .eq('id', projectId);

        if (error) {
          throw new Error(`Error deleting project: ${error.message}`);
        }

        const updatedProjects = projects.filter(
          project => project.id !== projectId
        );
        setProjects(updatedProjects);
        calculateMetrics(updatedProjects, enhancedProjects);
      } catch (err) {
        setError(err.message);
        console.error('Error deleting project:', err);
        throw err;
      }
    },
    [projects, enhancedProjects, calculateMetrics]
  );

  // Get project by ID
  const getProjectById = useCallback(
    projectId => {
      return projects.find(project => project.id === projectId);
    },
    [projects]
  );

  // Get enhanced project by ID
  const getEnhancedProjectById = useCallback(
    projectId => {
      return enhancedProjects.find(project => project.id === projectId);
    },
    [enhancedProjects]
  );

  // Get projects by status
  const getProjectsByStatus = useCallback(
    status => {
      return projects.filter(project => project.status === status);
    },
    [projects]
  );

  // Get projects by priority
  const getProjectsByPriority = useCallback(
    priority => {
      return projects.filter(
        project => project.projectplanner_priority === priority
      );
    },
    [projects]
  );

  // Get projects by manager
  const getProjectsByManager = useCallback(
    managerId => {
      return projects.filter(project => project.manager_id === managerId);
    },
    [projects]
  );

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
    const thirtyDaysFromNow = new Date(
      today.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    return projects.filter(project => {
      const endDate = new Date(project.end_date);
      const isApproachingDeadline = endDate <= thirtyDaysFromNow;
      const isLowProgress = project.progress < 50;
      return isApproachingDeadline && isLowProgress;
    });
  }, [projects]);

  // Get high priority projects
  const getHighPriorityProjects = useCallback(() => {
    return projects.filter(
      project =>
        project.projectplanner_priority === 'high' ||
        project.projectplanner_priority === 'critical'
    );
  }, [projects]);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const value = {
    projects,
    enhancedProjects,
    loading,
    error,
    metrics,
    loadProjects,
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
    getEnhancedProjectById,
    getProjectsByStatus,
    getProjectsByPriority,
    getProjectsByManager,
    getOverdueProjects,
    getHighRiskProjects,
    getHighPriorityProjects,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
};
