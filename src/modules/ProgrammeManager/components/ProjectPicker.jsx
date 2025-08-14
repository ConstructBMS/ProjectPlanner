import { useState, useEffect } from 'react';
import { ChevronDownIcon, FolderIcon } from '@heroicons/react/24/outline';
import { usePlannerStore } from '../state/plannerStore';

const ProjectPicker = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    currentProjectId,
    projects,
    loading,
    error,
    selectProject,
    hydrate,
    loadProjects
  } = usePlannerStore();

  // Load projects on mount
  useEffect(() => {
    if (projects.length === 0) {
      loadProjects();
    }
  }, [projects.length, loadProjects]);

  // Get current project details
  const currentProject = projects.find(p => p.id === currentProjectId);

  // Filter projects based on search term
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.code && project.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleProjectSelect = async (projectId) => {
    selectProject(projectId);
    await hydrate(projectId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const formatProjectDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getProjectStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'on-hold':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" />
        <span>Loading projects...</span>
      </div>
    );
  }

  if (error && projects.length === 0) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 text-sm text-red-500">
        <span>Failed to load projects</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Project Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        disabled={loading}
      >
        <FolderIcon className="h-4 w-4 text-gray-500" />
        <div className="text-left">
          <div className="font-medium text-gray-900">
            {currentProject ? currentProject.name : 'Select Project'}
          </div>
          {currentProject && (
            <div className="text-xs text-gray-500">
              {currentProject.code && `${currentProject.code} • `}
              {formatProjectDate(currentProject.start_date)}
            </div>
          )}
        </div>
        <ChevronDownIcon className="h-4 w-4 text-gray-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-80 bg-white border border-gray-300 rounded-md shadow-lg z-50">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>

          {/* Project List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredProjects.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                {searchTerm ? 'No projects found' : 'No projects available'}
              </div>
            ) : (
              filteredProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleProjectSelect(project.id)}
                  className={`w-full p-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors ${
                    project.id === currentProjectId ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 truncate">
                          {project.name}
                        </span>
                        {project.status && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getProjectStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-gray-500 space-y-1">
                        {project.code && (
                          <div>Code: {project.code}</div>
                        )}
                        <div className="flex items-center space-x-4">
                          {project.start_date && (
                            <span>Start: {formatProjectDate(project.start_date)}</span>
                          )}
                          {project.progress !== undefined && (
                            <span>Progress: {project.progress}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {project.id === currentProjectId && (
                      <div className="ml-2 text-blue-500">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500">
              {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-md">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
        </div>
      )}
    </div>
  );
};

export default ProjectPicker;
