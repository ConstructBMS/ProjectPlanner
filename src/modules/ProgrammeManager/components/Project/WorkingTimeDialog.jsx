import { useState, useEffect, useCallback } from 'react';
import { XMarkIcon, PlusIcon, CalendarIcon } from '@heroicons/react/24/outline';

const WorkingTimeDialog = ({ isOpen, onClose, projectId, initialCalendar = {} }) => {
  const [calendar, setCalendar] = useState({
    workingDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
    workingHours: {
      monday: 8,
      tuesday: 8,
      wednesday: 8,
      thursday: 8,
      friday: 8,
      saturday: 0,
      sunday: 0,
    },
    holidays: [],
    ...initialCalendar
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayLabel, setNewHolidayLabel] = useState('');

  const daysOfWeek = [
    { key: 'monday', label: 'Monday', short: 'Mon' },
    { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { key: 'thursday', label: 'Thursday', short: 'Thu' },
    { key: 'friday', label: 'Friday', short: 'Fri' },
    { key: 'saturday', label: 'Saturday', short: 'Sat' },
    { key: 'sunday', label: 'Sunday', short: 'Sun' },
  ];

  const loadCalendar = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const { projectStore } = await import('../../utils/projectStore');
      const savedCalendar = await projectStore.getCalendar(projectId);
      
      if (savedCalendar) {
        setCalendar(prev => ({
          ...prev,
          ...savedCalendar
        }));
      }
    } catch (err) {
      console.error('Error loading calendar:', err);
      setError('Failed to load calendar settings');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isOpen && projectId) {
      loadCalendar();
    }
  }, [isOpen, projectId, loadCalendar]);

  const handleWorkingDayChange = (day, isWorking) => {
    setCalendar(prev => ({
      ...prev,
      workingDays: {
        ...prev.workingDays,
        [day]: isWorking,
      },
      workingHours: {
        ...prev.workingHours,
        [day]: isWorking ? (prev.workingHours[day] || 8) : 0,
      },
    }));
  };

  const handleWorkingHoursChange = (day, hours) => {
    setCalendar(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: Math.max(0, Math.min(24, hours)),
      },
    }));
  };

  const handleAddHoliday = () => {
    if (!newHolidayDate || !newHolidayLabel.trim()) {
      setError('Please enter both date and label for the holiday');
      return;
    }

    const holiday = {
      date: newHolidayDate,
      label: newHolidayLabel.trim(),
    };

    if (calendar.holidays.some(h => h.date === holiday.date)) {
      setError('A holiday for this date already exists');
      return;
    }

    setCalendar(prev => ({
      ...prev,
      holidays: [...prev.holidays, holiday].sort((a, b) => a.date.localeCompare(b.date)),
    }));

    setNewHolidayDate('');
    setNewHolidayLabel('');
    setError('');
  };

  const handleRemoveHoliday = (date) => {
    setCalendar(prev => ({
      ...prev,
      holidays: prev.holidays.filter(h => h.date !== date),
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError('');

      const { projectStore } = await import('../../utils/projectStore');
      await projectStore.setCalendar(projectId, calendar);

      // Emit calendar update event for Gantt chart
      window.dispatchEvent(new window.CustomEvent('PROJECT_CALENDAR_UPDATED', {
        detail: { projectId, calendar }
      }));

      onClose();
    } catch (err) {
      console.error('Error saving calendar:', err);
      setError('Failed to save calendar settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Working Time & Holidays</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Working Days Matrix */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Working Days</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-7 gap-4">
                {daysOfWeek.map(day => (
                  <div key={day.key} className="text-center">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      {day.short}
                    </div>
                    <label className="flex items-center justify-center mb-2">
                      <input
                        type="checkbox"
                        checked={calendar.workingDays[day.key]}
                        onChange={(e) => handleWorkingDayChange(day.key, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={isLoading}
                      />
                      <span className="ml-2 text-sm text-gray-600">Working</span>
                    </label>
                    {calendar.workingDays[day.key] && (
                      <div className="flex items-center justify-center">
                        <input
                          type="number"
                          min="0"
                          max="24"
                          step="0.5"
                          value={calendar.workingHours[day.key]}
                          onChange={(e) => handleWorkingHoursChange(day.key, parseFloat(e.target.value))}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Hours"
                          disabled={isLoading}
                        />
                        <span className="ml-1 text-xs text-gray-500">hrs</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Holidays Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Holidays</h3>
            
            {/* Add Holiday Form */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={newHolidayDate}
                      onChange={(e) => setNewHolidayDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <CalendarIcon className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={newHolidayLabel}
                    onChange={(e) => setNewHolidayLabel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Christmas Day"
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={handleAddHoliday}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  <PlusIcon className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>

            {/* Holidays List */}
            {calendar.holidays.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No holidays configured</p>
                <p className="text-sm">Add holidays above to mark non-working days</p>
              </div>
            ) : (
              <div className="space-y-2">
                {calendar.holidays.map(holiday => (
                  <div
                    key={holiday.date}
                    className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-5 h-5 text-red-500" />
                      <div>
                        <div className="font-medium text-red-900">
                          {new Date(holiday.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-sm text-red-700">{holiday.label}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveHoliday(holiday.date)}
                      className="p-1 text-red-400 hover:text-red-600 transition-colors"
                      disabled={isLoading}
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Working days per week:</span>
                <span className="ml-2 font-medium">
                  {Object.values(calendar.workingDays).filter(Boolean).length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Total working hours per week:</span>
                <span className="ml-2 font-medium">
                  {Object.values(calendar.workingHours).reduce((sum, hours) => sum + hours, 0)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Holidays configured:</span>
                <span className="ml-2 font-medium">{calendar.holidays.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Next holiday:</span>
                <span className="ml-2 font-medium">
                  {calendar.holidays.length > 0 
                    ? new Date(calendar.holidays[0].date).toLocaleDateString()
                    : 'None'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Calendar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkingTimeDialog;
