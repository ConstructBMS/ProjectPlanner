import React, { useState, useCallback } from 'react';
import {
  CalendarIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  ClockIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useCalendarContext } from '../context/CalendarContext';
import CalendarExceptionManager from './modals/CalendarExceptionManager';
import {
  validateCalendar,
  isWorkingDay,
  getWorkingHours,
} from '../utils/calendarUtils';

const CalendarEditor = () => {
  const {
    globalCalendar,
    updateGlobalCalendar,
    updateWorkingDays,
    addHoliday,
    removeHoliday,
    resetGlobalCalendar,
  } = useCalendarContext();

  const [showExceptionManager, setShowExceptionManager] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState({ ...globalCalendar });
  const [validation, setValidation] = useState({ isValid: true, errors: [], warnings: [] });

  // Validate calendar when it changes
  React.useEffect(() => {
    const validation = validateCalendar(editingCalendar);
    setValidation(validation);
  }, [editingCalendar]);

  // Handle working days change
  const handleWorkingDaysChange = useCallback((day, value) => {
    setEditingCalendar(prev => ({
      ...prev,
      workingDays: {
        ...prev.workingDays,
        [day]: value,
      },
    }));
  }, []);

  // Handle working hours change
  const handleWorkingHoursChange = useCallback((day, value) => {
    setEditingCalendar(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: parseFloat(value) || 0,
      },
    }));
  }, []);

  // Handle calendar name change
  const handleNameChange = useCallback((name) => {
    setEditingCalendar(prev => ({
      ...prev,
      name,
    }));
  }, []);

  // Save calendar changes
  const handleSave = useCallback(() => {
    if (!validation.isValid) return;

    updateGlobalCalendar(editingCalendar);
  }, [editingCalendar, validation.isValid, updateGlobalCalendar]);

  // Reset to defaults
  const handleReset = useCallback(() => {
    if (confirm('Are you sure you want to reset the calendar to defaults?')) {
      resetGlobalCalendar();
      setEditingCalendar({ ...globalCalendar });
    }
  }, [resetGlobalCalendar, globalCalendar]);

  // Add holiday
  const handleAddHoliday = useCallback((dateString) => {
    addHoliday(dateString);
    setEditingCalendar(prev => ({
      ...prev,
      holidays: [...prev.holidays, dateString].sort(),
    }));
  }, [addHoliday]);

  // Remove holiday
  const handleRemoveHoliday = useCallback((dateString) => {
    removeHoliday(dateString);
    setEditingCalendar(prev => ({
      ...prev,
      holidays: prev.holidays.filter(h => h !== dateString),
    }));
  }, [removeHoliday]);

  // Handle calendar update from exception manager
  const handleCalendarUpdate = useCallback((updatedCalendar) => {
    updateGlobalCalendar(updatedCalendar);
    setEditingCalendar(updatedCalendar);
  }, [updateGlobalCalendar]);

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Calendar Editor</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExceptionManager(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add Exception
          </button>
          
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Calendar Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Calendar Name
        </label>
        <input
          type="text"
          value={editingCalendar.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter calendar name"
        />
      </div>

      {/* Working Days Configuration */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Working Days Configuration</h3>
        
        <div className="space-y-3">
          {daysOfWeek.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={key}
                  checked={editingCalendar.workingDays[key]}
                  onChange={(e) => handleWorkingDaysChange(key, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={key} className="text-sm font-medium text-gray-700">
                  {label}
                </label>
              </div>
              
              {editingCalendar.workingDays[key] && (
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={editingCalendar.workingHours[key] || 0}
                    onChange={(e) => handleWorkingHoursChange(key, e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    min="0"
                    max="24"
                    step="0.5"
                  />
                  <span className="text-sm text-gray-500">hours</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Holidays */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Holidays</h3>
          <button
            onClick={() => {
              const date = prompt('Enter holiday date (YYYY-MM-DD):');
              if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
                handleAddHoliday(date);
              }
            }}
            className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
          >
            <PlusIcon className="w-3 h-3" />
            Add Holiday
          </button>
        </div>
        
        {editingCalendar.holidays.length === 0 ? (
          <p className="text-sm text-gray-500">No holidays configured</p>
        ) : (
          <div className="space-y-2">
            {editingCalendar.holidays.map((holiday) => (
              <div key={holiday} className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded">
                <span className="text-sm text-red-800">
                  {new Date(holiday).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleRemoveHoliday(holiday)}
                  className="p-1 text-red-400 hover:text-red-600 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calendar Exceptions Summary */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Calendar Exceptions</h3>
          <button
            onClick={() => setShowExceptionManager(true)}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            <PlusIcon className="w-3 h-3" />
            Manage Exceptions
          </button>
        </div>
        
        {(!editingCalendar.exceptions || editingCalendar.exceptions.length === 0) ? (
          <p className="text-sm text-gray-500">No calendar exceptions configured</p>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="font-medium text-blue-900">Total Exceptions</div>
                <div className="text-2xl font-bold text-blue-600">{editingCalendar.exceptions.length}</div>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <div className="font-medium text-red-900">Non-working Days</div>
                <div className="text-2xl font-bold text-red-600">
                  {editingCalendar.exceptions.filter(e => !e.isWorkingDay).length}
                </div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="font-medium text-green-900">Working Days</div>
                <div className="text-2xl font-bold text-green-600">
                  {editingCalendar.exceptions.filter(e => e.isWorkingDay).length}
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              Click "Manage Exceptions" to add holidays, site shutdowns, and other calendar exceptions.
            </div>
          </div>
        )}
      </div>

      {/* Validation */}
      {!validation.isValid && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
          <div className="flex items-center gap-2 mb-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-900">Validation Errors</span>
          </div>
          <ul className="text-xs text-red-700 space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-center gap-2 mb-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Warnings</span>
          </div>
          <ul className="text-xs text-yellow-700 space-y-1">
            {validation.warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {validation.isValid && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckIcon className="w-4 h-4" />
              <span className="text-sm">Calendar configuration is valid</span>
            </div>
          )}
        </div>
        
        <button
          onClick={handleSave}
          disabled={!validation.isValid}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Calendar
        </button>
      </div>

      {/* Calendar Exception Manager Modal */}
      <CalendarExceptionManager
        isOpen={showExceptionManager}
        onClose={() => setShowExceptionManager(false)}
        calendar={editingCalendar}
        onCalendarUpdate={handleCalendarUpdate}
      />
    </div>
  );
};

export default CalendarEditor;
