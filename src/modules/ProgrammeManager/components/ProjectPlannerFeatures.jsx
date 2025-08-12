import { useProjectsContext } from '../context/ProjectsContext';
import {
  ClockIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyPoundIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const ProjectPlannerFeatures = () => {
  const {
    projects,
    metrics,
    getProjectsByPriority,
    getHighPriorityProjects,
    getOverdueProjects,
  } = useProjectsContext();

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  const priorityIcons = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    critical: '🔴',
  };

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatHours = hours => {
    return `${hours.toLocaleString()} hrs`;
  };

  return (
    <div className='space-y-6'>
      {/* Enhanced Metrics Dashboard */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4'>
          ProjectPlanner Enhanced Metrics
        </h2>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg'>
            <div className='flex items-center'>
              <ClockIcon className='h-8 w-8 text-blue-600' />
              <div className='ml-3'>
                <p className='text-sm font-medium text-blue-600'>
                  Estimated Hours
                </p>
                <p className='text-2xl font-bold text-blue-900'>
                  {formatHours(metrics.totalEstimatedHours)}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg'>
            <div className='flex items-center'>
              <CheckCircleIcon className='h-8 w-8 text-green-600' />
              <div className='ml-3'>
                <p className='text-sm font-medium text-green-600'>
                  Actual Hours
                </p>
                <p className='text-2xl font-bold text-green-900'>
                  {formatHours(metrics.totalActualHours)}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg'>
            <div className='flex items-center'>
              <ExclamationTriangleIcon className='h-8 w-8 text-orange-600' />
              <div className='ml-3'>
                <p className='text-sm font-medium text-orange-600'>
                  High Priority
                </p>
                <p className='text-2xl font-bold text-orange-900'>
                  {metrics.highPriorityProjects}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg'>
            <div className='flex items-center'>
              <CurrencyPoundIcon className='h-8 w-8 text-purple-600' />
              <div className='ml-3'>
                <p className='text-sm font-medium text-purple-600'>
                  Total Budget
                </p>
                <p className='text-2xl font-bold text-purple-900'>
                  {formatCurrency(metrics.totalCost)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Projects by Priority
        </h3>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {['critical', 'high', 'medium', 'low'].map(priority => {
            const projects = getProjectsByPriority(priority);
            return (
              <div key={priority} className='text-center'>
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${priorityColors[priority]}`}
                >
                  <span className='mr-2'>{priorityIcons[priority]}</span>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </div>
                <p className='text-2xl font-bold text-gray-900 mt-2'>
                  {projects.length}
                </p>
                <p className='text-sm text-gray-500'>projects</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Project Cards */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Projects with Enhanced Features
        </h3>
        <div className='space-y-4'>
          {projects.slice(0, 5).map(project => (
            <div
              key={project.id}
              className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-3 mb-2'>
                    <h4 className='text-lg font-medium text-gray-900'>
                      {project.name}
                    </h4>
                    {project.projectplanner_priority && (
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityColors[project.projectplanner_priority]}`}
                      >
                        {priorityIcons[project.projectplanner_priority]}
                        <span className='ml-1'>
                          {project.projectplanner_priority}
                        </span>
                      </span>
                    )}
                  </div>

                  <p className='text-gray-600 mb-3'>{project.description}</p>

                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                    {project.projectplanner_location && (
                      <div className='flex items-center text-gray-600'>
                        <MapPinIcon className='h-4 w-4 mr-2' />
                        <span className='truncate' title={project.projectplanner_location}>
                          {project.projectplanner_location}
                        </span>
                      </div>
                    )}

                    {project.projectplanner_estimated_hours && (
                      <div className='flex items-center text-gray-600'>
                        <ClockIcon className='h-4 w-4 mr-2' />
                        <span>
                          Est:{' '}
                          {formatHours(project.projectplanner_estimated_hours)}
                        </span>
                      </div>
                    )}

                    {project.projectplanner_actual_hours && (
                      <div className='flex items-center text-gray-600'>
                        <CheckCircleIcon className='h-4 w-4 mr-2' />
                        <span>
                          Actual:{' '}
                          {formatHours(project.projectplanner_actual_hours)}
                        </span>
                      </div>
                    )}

                    {project.budget && (
                      <div className='flex items-center text-gray-600'>
                        <CurrencyPoundIcon className='h-4 w-4 mr-2' />
                        <span>{formatCurrency(project.budget)}</span>
                      </div>
                    )}
                  </div>

                  {project.projectplanner_notes && (
                    <div className='mt-3 p-3 bg-gray-50 rounded-md'>
                      <div className='flex items-start'>
                        <DocumentTextIcon className='h-4 w-4 text-gray-500 mr-2 mt-0.5' />
                        <p className='text-sm text-gray-700'>
                          {project.projectplanner_notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className='text-right'>
                  <div className='text-2xl font-bold text-gray-900'>
                    {project.progress}%
                  </div>
                  <div className='text-sm text-gray-500'>Complete</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* High Priority Projects Alert */}
      {getHighPriorityProjects().length > 0 && (
        <div className='bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6'>
          <div className='flex items-center'>
            <ExclamationTriangleIcon className='h-8 w-8 text-red-600' />
            <div className='ml-3'>
              <h3 className='text-lg font-semibold text-red-900'>
                High Priority Projects
              </h3>
              <p className='text-red-700'>
                You have {getHighPriorityProjects().length} high priority or
                critical projects that require attention.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overdue Projects Alert */}
      {getOverdueProjects().length > 0 && (
        <div className='bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6'>
          <div className='flex items-center'>
            <ClockIcon className='h-8 w-8 text-yellow-600' />
            <div className='ml-3'>
              <h3 className='text-lg font-semibold text-yellow-900'>
                Overdue Projects
              </h3>
              <p className='text-yellow-700'>
                You have {getOverdueProjects().length} projects that are past
                their deadline.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPlannerFeatures;
