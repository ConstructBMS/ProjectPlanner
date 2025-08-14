import { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import {
  createRecurrenceRule,
  validateRecurrenceRule,
  getRecurrencePatternDescription,
  formatRecurrenceRule,
  isRecurringTask,
  isRecurringInstance,
} from '../utils/recurringTaskUtils';

const RecurringTaskConfig = ({ task, onRecurrenceChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [recurrenceConfig, setRecurrenceConfig] = useState({
    isEnabled: false,
    frequency: 'daily',
    interval: 1,
    weekdays: [],
    dayOfMonth: null,
    endDate: null,
    maxOccurrences: null,
  });
  const [validation, setValidation] = useState({
    isValid: true,
    errors: [],
    warnings: [],
  });

  // Initialize configuration from task
  useEffect(() => {
    if (task.recurrence) {
      setRecurrenceConfig({
        isEnabled: true,
        frequency: task.recurrence.frequency || 'daily',
        interval: task.recurrence.interval || 1,
        weekdays: task.recurrence.weekdays || [],
        dayOfMonth: task.recurrence.dayOfMonth || null,
        endDate: task.recurrence.endDate || null,
        maxOccurrences: task.recurrence.maxOccurrences || null,
      });
    } else {
      setRecurrenceConfig({
        isEnabled: false,
        frequency: 'daily',
        interval: 1,
        weekdays: [],
        dayOfMonth: null,
        endDate: null,
        maxOccurrences: null,
      });
    }
  }, [task]);

  // Validate configuration when it changes
  useEffect(() => {
    if (recurrenceConfig.isEnabled) {
      const rule = createRecurrenceRule(
        recurrenceConfig.frequency,
        recurrenceConfig.interval,
        new Date(task.startDate),
        recurrenceConfig.endDate ? new Date(recurrenceConfig.endDate) : null,
        recurrenceConfig.maxOccurrences,
        recurrenceConfig.weekdays,
        recurrenceConfig.dayOfMonth
      );
      const validationResult = validateRecurrenceRule(rule);
      setValidation(validationResult);
    } else {
      setValidation({ isValid: true, errors: [], warnings: [] });
    }
  }, [recurrenceConfig, task.startDate]);

  const handleConfigChange = (field, value) => {
    const updatedConfig = { ...recurrenceConfig, [field]: value };
    setRecurrenceConfig(updatedConfig);

    // Update task recurrence
    if (updatedConfig.isEnabled) {
      const rule = createRecurrenceRule(
        updatedConfig.frequency,
        updatedConfig.interval,
        new Date(task.startDate),
        updatedConfig.endDate ? new Date(updatedConfig.endDate) : null,
        updatedConfig.maxOccurrences,
        updatedConfig.weekdays,
        updatedConfig.dayOfMonth
      );
      onRecurrenceChange(rule);
    } else {
      onRecurrenceChange(null);
    }
  };

  const handleWeekdayToggle = weekday => {
    const updatedWeekdays = recurrenceConfig.weekdays.includes(weekday)
      ? recurrenceConfig.weekdays.filter(day => day !== weekday)
      : [...recurrenceConfig.weekdays, weekday];

    handleConfigChange('weekdays', updatedWeekdays);
  };

  const isRecurring = isRecurringTask(task) || isRecurringInstance(task);

  return (
    <div className='bg-white border border-gray-200 rounded-lg p-4'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <CalendarIcon className='w-4 h-4 text-blue-600' />
          <h4 className='text-sm font-semibold text-gray-700'>Recurrence</h4>
          {isRecurring && (
            <span className='px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full'>
              Recurring
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className='text-gray-400 hover:text-gray-600 transition-colors'
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {/* Current recurrence display */}
      {isRecurring && task.recurrence && (
        <div className='mb-3 p-2 bg-blue-50 border border-blue-200 rounded'>
          <div className='text-sm text-blue-900'>
            <strong>Pattern:</strong> {formatRecurrenceRule(task.recurrence)}
          </div>
        </div>
      )}

      {/* Configuration form */}
      {isExpanded && (
        <div className='space-y-4'>
          {/* Enable/Disable */}
          <div className='flex items-center gap-2'>
            <input
              type='checkbox'
              id='recurrence-enabled'
              checked={recurrenceConfig.isEnabled}
              onChange={e => handleConfigChange('isEnabled', e.target.checked)}
              className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
            />
            <label
              htmlFor='recurrence-enabled'
              className='text-sm text-gray-700'
            >
              Enable recurrence
            </label>
          </div>

          {recurrenceConfig.isEnabled && (
            <>
              {/* Frequency and Interval */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-medium text-gray-600 mb-1'>
                    Frequency
                  </label>
                  <select
                    value={recurrenceConfig.frequency}
                    onChange={e =>
                      handleConfigChange('frequency', e.target.value)
                    }
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value='daily'>Daily</option>
                    <option value='weekly'>Weekly</option>
                    <option value='monthly'>Monthly</option>
                  </select>
                </div>

                <div>
                  <label className='block text-xs font-medium text-gray-600 mb-1'>
                    Interval
                  </label>
                  <input
                    type='number'
                    min='1'
                    max='365'
                    value={recurrenceConfig.interval}
                    onChange={e =>
                      handleConfigChange(
                        'interval',
                        parseInt(e.target.value) || 1
                      )
                    }
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
              </div>

              {/* Weekly options */}
              {recurrenceConfig.frequency === 'weekly' && (
                <div>
                  <label className='block text-xs font-medium text-gray-600 mb-2'>
                    Days of the week
                  </label>
                  <div className='grid grid-cols-7 gap-1'>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                      (day, index) => (
                        <button
                          key={day}
                          onClick={() => handleWeekdayToggle(index)}
                          className={`px-2 py-1 text-xs rounded border transition-colors ${
                            recurrenceConfig.weekdays.includes(index)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {day}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Monthly options */}
              {recurrenceConfig.frequency === 'monthly' && (
                <div>
                  <label className='block text-xs font-medium text-gray-600 mb-1'>
                    Day of month
                  </label>
                  <input
                    type='number'
                    min='1'
                    max='31'
                    value={recurrenceConfig.dayOfMonth || ''}
                    onChange={e =>
                      handleConfigChange(
                        'dayOfMonth',
                        parseInt(e.target.value) || null
                      )
                    }
                    placeholder='Same day as start'
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
              )}

              {/* End conditions */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-medium text-gray-600 mb-1'>
                    End date (optional)
                  </label>
                  <input
                    type='date'
                    value={recurrenceConfig.endDate || ''}
                    onChange={e =>
                      handleConfigChange('endDate', e.target.value || null)
                    }
                    min={task.startDate}
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>

                <div>
                  <label className='block text-xs font-medium text-gray-600 mb-1'>
                    Max occurrences (optional)
                  </label>
                  <input
                    type='number'
                    min='1'
                    max='1000'
                    value={recurrenceConfig.maxOccurrences || ''}
                    onChange={e =>
                      handleConfigChange(
                        'maxOccurrences',
                        parseInt(e.target.value) || null
                      )
                    }
                    placeholder='No limit'
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
              </div>

              {/* Preview */}
              <div className='p-3 bg-gray-50 border border-gray-200 rounded'>
                <div className='text-sm text-gray-700'>
                  <strong>Preview:</strong>{' '}
                  {getRecurrencePatternDescription({
                    frequency: recurrenceConfig.frequency,
                    interval: recurrenceConfig.interval,
                    weekdays: recurrenceConfig.weekdays,
                    dayOfMonth: recurrenceConfig.dayOfMonth,
                  })}
                </div>
              </div>

              {/* Validation */}
              {!validation.isValid && (
                <div className='p-3 bg-red-50 border border-red-200 rounded'>
                  <div className='flex items-center gap-2 mb-2'>
                    <ExclamationTriangleIcon className='w-4 h-4 text-red-600' />
                    <span className='text-sm font-medium text-red-900'>
                      Validation Errors
                    </span>
                  </div>
                  <ul className='text-xs text-red-700 space-y-1'>
                    {validation.errors.map((error, index) => (
                      <li key={`error-${index}`}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validation.warnings.length > 0 && (
                <div className='p-3 bg-yellow-50 border border-yellow-200 rounded'>
                  <div className='flex items-center gap-2 mb-2'>
                    <ExclamationTriangleIcon className='w-4 h-4 text-yellow-600' />
                    <span className='text-sm font-medium text-yellow-900'>
                      Warnings
                    </span>
                  </div>
                  <ul className='text-xs text-yellow-700 space-y-1'>
                    {validation.warnings.map((warning, index) => (
                      <li key={`warning-${index}`}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success indicator */}
              {validation.isValid && recurrenceConfig.isEnabled && (
                <div className='p-3 bg-green-50 border border-green-200 rounded'>
                  <div className='flex items-center gap-2'>
                    <CheckIcon className='w-4 h-4 text-green-600' />
                    <span className='text-sm text-green-700'>
                      Recurrence configuration is valid
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RecurringTaskConfig;
