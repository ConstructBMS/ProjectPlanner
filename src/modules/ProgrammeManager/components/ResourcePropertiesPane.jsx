import React, { useState, useEffect } from 'react';
import {
  UserIcon,
  CurrencyPoundIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  ChartBarIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import {
  validateCostRate,
  formatCostRate,
  getResourceCostSummary,
  formatCost,
} from '../utils/costUtils';
import {
  getResourceCalendarSummary,
  getAvailableCalendars,
  validateResourceCalendar,
  updateResourceCalendar,
  calculateResourceAvailability,
  checkResourceAllocationConflicts,
  DEFAULT_RESOURCE_CALENDAR_CONFIG,
} from '../utils/resourceCalendarUtils';

const ResourcePropertiesPane = ({ resource, tasks, onResourceUpdate, projectCalendars = {} }) => {
  const [editingResource, setEditingResource] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [costRateValidation, setCostRateValidation] = useState({
    isValid: true,
    errors: [],
    warnings: [],
  });
  const [calendarValidation, setCalendarValidation] = useState({
    isValid: true,
    errors: [],
    warnings: [],
  });

  // Initialize editing resource when resource changes
  useEffect(() => {
    if (resource) {
      setEditingResource({
        ...resource,
        costRate: resource.costRate || 0,
        costRateUnit: resource.costRateUnit || 'day',
      });
      setHasChanges(false);
    }
  }, [resource]);

  // Validate cost rate when it changes
  useEffect(() => {
    if (editingResource) {
      const validation = validateCostRate(editingResource.costRate);
      setCostRateValidation(validation);
    }
  }, [editingResource?.costRate]);

  // Validate calendar assignment when it changes
  useEffect(() => {
    if (editingResource) {
      const validation = validateResourceCalendar(editingResource, projectCalendars);
      setCalendarValidation(validation);
    }
  }, [editingResource?.calendarId, projectCalendars]);

  const handleFieldChange = (field, value) => {
    if (!editingResource) return;

    setEditingResource(prev => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!editingResource || !hasChanges) return;

    onResourceUpdate(editingResource.id, editingResource);
    setHasChanges(false);
  };

  const handleCancel = () => {
    if (resource) {
      setEditingResource({
        ...resource,
        costRate: resource.costRate || 0,
        costRateUnit: resource.costRateUnit || 'day',
      });
      setHasChanges(false);
    }
  };

  if (!resource || !editingResource) {
    return (
      <div className='w-80 bg-gray-50 border-l border-gray-200 p-4'>
        <div className='text-center text-gray-500'>
          <UserIcon className='w-12 h-12 mx-auto mb-2 text-gray-400' />
          <p>Select a resource to view properties</p>
        </div>
      </div>
    );
  }

  // Calculate resource cost summary
  const costSummary = getResourceCostSummary(resource.id, tasks, []);

  // Get calendar information
  const calendarSummary = getResourceCalendarSummary(editingResource, projectCalendars, DEFAULT_RESOURCE_CALENDAR_CONFIG);
  const availableCalendars = getAvailableCalendars(projectCalendars, DEFAULT_RESOURCE_CALENDAR_CONFIG);

  return (
    <div className='w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <UserIcon className='w-5 h-5 text-blue-600' />
          <h3 className='text-lg font-semibold text-gray-900'>
            Resource Properties
          </h3>
        </div>
        {hasChanges && (
          <span className='px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full'>
            Unsaved
          </span>
        )}
      </div>

      {/* Resource Name */}
      <div className='bg-white border border-gray-200 rounded-lg p-4 mb-4'>
        <div className='flex items-center gap-2 mb-3'>
          <UserIcon className='w-4 h-4 text-gray-600' />
          <h4 className='text-sm font-semibold text-gray-700'>
            Resource Information
          </h4>
        </div>

        <div className='space-y-3'>
          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1'>
              Resource Name
            </label>
            <input
              type='text'
              value={editingResource.name || ''}
              onChange={e => handleFieldChange('name', e.target.value)}
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='Enter resource name'
            />
          </div>

          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1'>
              Email
            </label>
            <input
              type='email'
              value={editingResource.email || ''}
              onChange={e => handleFieldChange('email', e.target.value)}
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='resource@company.com'
            />
          </div>

          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1'>
              Role/Position
            </label>
            <input
              type='text'
              value={editingResource.role || ''}
              onChange={e => handleFieldChange('role', e.target.value)}
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='e.g., Project Manager, Developer'
            />
          </div>
        </div>
      </div>

      {/* Cost Rate Section */}
      <div className='bg-white border border-gray-200 rounded-lg p-4 mb-4'>
        <div className='flex items-center gap-2 mb-3'>
          <CurrencyPoundIcon className='w-4 h-4 text-green-600' />
          <h4 className='text-sm font-semibold text-gray-700'>Cost Rate</h4>
        </div>

        <div className='space-y-3'>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='block text-xs font-medium text-gray-600 mb-1'>
                Rate Amount
              </label>
              <input
                type='number'
                min='0'
                step='0.01'
                value={editingResource.costRate || ''}
                onChange={e =>
                  handleFieldChange('costRate', parseFloat(e.target.value) || 0)
                }
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='0.00'
              />
            </div>

            <div>
              <label className='block text-xs font-medium text-gray-600 mb-1'>
                Rate Unit
              </label>
              <select
                value={editingResource.costRateUnit || 'day'}
                onChange={e =>
                  handleFieldChange('costRateUnit', e.target.value)
                }
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='hour'>Per Hour</option>
                <option value='day'>Per Day</option>
                <option value='week'>Per Week</option>
                <option value='month'>Per Month</option>
              </select>
            </div>
          </div>

          {/* Current Rate Display */}
          <div className='p-2 bg-gray-50 border border-gray-200 rounded'>
            <div className='text-sm text-gray-700'>
              <strong>Current Rate:</strong>{' '}
              {formatCostRate(
                editingResource.costRate,
                editingResource.costRateUnit
              )}
            </div>
          </div>

          {/* Validation */}
          {!costRateValidation.isValid && (
            <div className='p-3 bg-red-50 border border-red-200 rounded'>
              <div className='flex items-center gap-2 mb-2'>
                <ExclamationTriangleIcon className='w-4 h-4 text-red-600' />
                <span className='text-sm font-medium text-red-900'>
                  Validation Errors
                </span>
              </div>
              <ul className='text-xs text-red-700 space-y-1'>
                {costRateValidation.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {costRateValidation.warnings.length > 0 && (
            <div className='p-3 bg-yellow-50 border border-yellow-200 rounded'>
              <div className='flex items-center gap-2 mb-2'>
                <ExclamationTriangleIcon className='w-4 h-4 text-yellow-600' />
                <span className='text-sm font-medium text-yellow-900'>
                  Warnings
                </span>
              </div>
              <ul className='text-xs text-yellow-700 space-y-1'>
                {costRateValidation.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Success indicator */}
          {costRateValidation.isValid && editingResource.costRate > 0 && (
            <div className='p-3 bg-green-50 border border-green-200 rounded'>
              <div className='flex items-center gap-2'>
                <CheckIcon className='w-4 h-4 text-green-600' />
                <span className='text-sm text-green-700'>
                  Cost rate is valid
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Working Calendar Section */}
      <div className='bg-white border border-gray-200 rounded-lg p-4 mb-4'>
        <div className='flex items-center gap-2 mb-3'>
          <CalendarIcon className='w-4 h-4 text-purple-600' />
          <h4 className='text-sm font-semibold text-gray-700'>Working Calendar</h4>
        </div>

        <div className='space-y-3'>
          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1'>
              Calendar Assignment
            </label>
            <select
              value={editingResource.calendarId || ''}
              onChange={e => handleFieldChange('calendarId', e.target.value || null)}
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value=''>No Calendar Assigned</option>
              {availableCalendars.map(calendar => (
                <option key={calendar.id} value={calendar.id}>
                  {calendar.name} {calendar.isDefault ? '(Default)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Current Calendar Display */}
          <div className='p-2 bg-gray-50 border border-gray-200 rounded'>
            <div className='text-sm text-gray-700'>
              <strong>Current Calendar:</strong> {calendarSummary.calendarName}
            </div>
            <div className='text-xs text-gray-500 mt-1'>
              {calendarSummary.workingDays} working days, {calendarSummary.totalWeeklyHours}h per week
            </div>
          </div>

          {/* Calendar Validation */}
          {!calendarValidation.isValid && (
            <div className='p-3 bg-red-50 border border-red-200 rounded'>
              <div className='flex items-center gap-2 mb-2'>
                <ExclamationTriangleIcon className='w-4 h-4 text-red-600' />
                <span className='text-sm font-medium text-red-900'>
                  Calendar Errors
                </span>
              </div>
              <ul className='text-xs text-red-700 space-y-1'>
                {calendarValidation.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {calendarValidation.warnings.length > 0 && (
            <div className='p-3 bg-yellow-50 border border-yellow-200 rounded'>
              <div className='flex items-center gap-2 mb-2'>
                <ExclamationTriangleIcon className='w-4 h-4 text-yellow-600' />
                <span className='text-sm font-medium text-yellow-900'>
                  Calendar Warnings
                </span>
              </div>
              <ul className='text-xs text-yellow-700 space-y-1'>
                {calendarValidation.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Success indicator */}
          {calendarValidation.isValid && editingResource.calendarId && (
            <div className='p-3 bg-green-50 border border-green-200 rounded'>
              <div className='flex items-center gap-2'>
                <CheckIcon className='w-4 h-4 text-green-600' />
                <span className='text-sm text-green-700'>
                  Calendar assignment is valid
                </span>
              </div>
            </div>
          )}

          {/* Availability Preview */}
          {editingResource.calendarId && (
            <div>
              <h5 className='text-xs font-medium text-gray-600 mb-2'>
                Next 30 Days Availability
              </h5>
              {(() => {
                const startDate = new Date();
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + 30);
                
                const availability = calculateResourceAvailability(
                  editingResource,
                  startDate,
                  endDate,
                  projectCalendars,
                  DEFAULT_RESOURCE_CALENDAR_CONFIG
                );

                return (
                  <div className='p-2 bg-blue-50 border border-blue-200 rounded'>
                    <div className='text-xs text-blue-700'>
                      <strong>Available:</strong> {availability.totalWorkingDays} days, {availability.totalWorkingHours}h
                    </div>
                    <div className='text-xs text-blue-600 mt-1'>
                      <strong>Unavailable:</strong> {availability.unavailableDates.length} days
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Cost Summary Section */}
      <div className='bg-white border border-gray-200 rounded-lg p-4 mb-4'>
        <div className='flex items-center gap-2 mb-3'>
          <ChartBarIcon className='w-4 h-4 text-blue-600' />
          <h4 className='text-sm font-semibold text-gray-700'>Cost Summary</h4>
        </div>

        <div className='space-y-3'>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='text-gray-600'>Total Cost:</span>
              <div className='font-semibold text-green-600'>
                {formatCost(costSummary.totalCost)}
              </div>
            </div>
            <div>
              <span className='text-gray-600'>Tasks:</span>
              <div className='font-semibold text-gray-900'>
                {costSummary.taskCount}
              </div>
            </div>
            <div>
              <span className='text-gray-600'>Avg per Task:</span>
              <div className='font-semibold text-blue-600'>
                {formatCost(costSummary.averageCostPerTask)}
              </div>
            </div>
            <div>
              <span className='text-gray-600'>Avg per Day:</span>
              <div className='font-semibold text-purple-600'>
                {formatCost(costSummary.averageCostPerDay)}
              </div>
            </div>
          </div>

          {/* Task breakdown */}
          {costSummary.tasks.length > 0 && (
            <div>
              <h5 className='text-xs font-medium text-gray-600 mb-2'>
                Task Breakdown
              </h5>
              <div className='max-h-32 overflow-y-auto space-y-1'>
                {costSummary.tasks.map(task => (
                  <div
                    key={task.taskId}
                    className='flex justify-between items-center text-xs p-1 bg-gray-50 rounded'
                  >
                    <span className='truncate' title={task.taskName}>
                      {task.taskName}
                    </span>
                    <span className='font-medium text-green-600 ml-2'>
                      {formatCost(task.cost)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex gap-2'>
        <button
          onClick={handleSave}
          disabled={!hasChanges || !costRateValidation.isValid}
          className='flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Save Changes
        </button>
        <button
          onClick={handleCancel}
          disabled={!hasChanges}
          className='px-4 py-2 text-gray-700 bg-white border border-gray-300 text-sm rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ResourcePropertiesPane;
