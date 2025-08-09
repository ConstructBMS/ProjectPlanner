import React, { useState } from 'react';
import { useCalendarContext } from '../../context/CalendarContext';
import { createCalendar } from '../../utils/calendarUtils';
import {
  CalendarIcon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const CalendarsPanel = () => {
  const {
    globalCalendar,
    updateWorkingDays,
    addHoliday,
    removeHoliday,
    resetGlobalCalendar,
  } = useCalendarContext();

  const [newHoliday, setNewHoliday] = useState('');

  const dayNames = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  const handleWorkingDayToggle = (dayKey) => {
    const updatedWorkingDays = {
      ...globalCalendar.workingDays,
      [dayKey]: !globalCalendar.workingDays[dayKey],
    };
    updateWorkingDays(updatedWorkingDays);
  };

  const handleAddHoliday = () => {
    if (newHoliday && /^\d{4}-\d{2}-\d{2}$/.test(newHoliday)) {
      addHoliday(newHoliday);
      setNewHoliday('');
    }
  };

  const handleRemoveHoliday = (dateString) => {
    removeHoliday(dateString);
  };

  const formatHolidayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Working Calendar</h2>
        </div>
        <button
          onClick={resetGlobalCalendar}
          className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Reset to Default</span>
        </button>
      </div>

      {/* Working Days Section */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Working Days</h3>
        <div className="grid grid-cols-2 gap-3">
          {dayNames.map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={globalCalendar.workingDays[key]}
                onChange={() => handleWorkingDayToggle(key)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Holidays Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Holidays</h3>
        
        {/* Add Holiday Form */}
        <div className="flex space-x-2 mb-4">
          <input
            type="date"
            value={newHoliday}
            onChange={(e) => setNewHoliday(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Select date"
          />
          <button
            onClick={handleAddHoliday}
            disabled={!newHoliday}
            className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

        {/* Holidays List */}
        <div className="space-y-2">
          {globalCalendar.holidays.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No holidays configured</p>
          ) : (
            globalCalendar.holidays.map((dateString) => (
              <div
                key={dateString}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-700">
                  {formatHolidayDate(dateString)}
                </span>
                <button
                  onClick={() => handleRemoveHoliday(dateString)}
                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Calendar Summary</h4>
        <div className="text-sm text-blue-800">
          <p>
            <strong>Working days per week:</strong>{' '}
            {Object.values(globalCalendar.workingDays).filter(Boolean).length}
          </p>
          <p>
            <strong>Total holidays:</strong> {globalCalendar.holidays.length}
          </p>
          <p>
            <strong>Calendar name:</strong> {globalCalendar.name}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CalendarsPanel;
