import React, { useState, useEffect, useCallback } from 'react';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  InformationCircleIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  createCalendarException,
  createDateRangeException,
  validateCalendarException,
  validateDateRange,
  addExceptionToCalendar,
  addDateRangeExceptionsToCalendar,
  removeExceptionFromCalendar,
  updateExceptionInCalendar,
  getExceptionStatistics,
  exportExceptions,
  importExceptions,
  DEFAULT_EXCEPTION_CONFIG,
} from '../../utils/calendarExceptionUtils';

const CalendarExceptionManager = ({ isOpen, onClose, calendar, onCalendarUpdate }) => {
  const [exceptions, setExceptions] = useState(calendar?.exceptions || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRangeForm, setShowRangeForm] = useState(false);
  const [editingException, setEditingException] = useState(null);
  const [selectedExceptions, setSelectedExceptions] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState('');
  const [importFormat, setImportFormat] = useState('json');

  // Form state for single exception
  const [singleExceptionForm, setSingleExceptionForm] = useState({
    date: '',
    type: DEFAULT_EXCEPTION_CONFIG.exceptionTypes.HOLIDAY,
    reason: '',
    description: '',
    isWorkingDay: false,
    workingHours: 0,
  });

  // Form state for date range
  const [rangeExceptionForm, setRangeExceptionForm] = useState({
    startDate: '',
    endDate: '',
    type: DEFAULT_EXCEPTION_CONFIG.exceptionTypes.HOLIDAY,
    reason: '',
    description: '',
    isWorkingDay: false,
    workingHours: 0,
  });

  // Validation state
  const [validation, setValidation] = useState({ isValid: true, errors: [], warnings: [] });

  // Update exceptions when calendar changes
  useEffect(() => {
    setExceptions(calendar?.exceptions || []);
  }, [calendar]);

  // Validate single exception form
  useEffect(() => {
    if (showAddForm) {
      const validation = validateCalendarException(singleExceptionForm, exceptions);
      setValidation(validation);
    }
  }, [singleExceptionForm, exceptions, showAddForm]);

  // Validate range exception form
  useEffect(() => {
    if (showRangeForm && rangeExceptionForm.startDate && rangeExceptionForm.endDate) {
      const validation = validateDateRange(
        rangeExceptionForm.startDate,
        rangeExceptionForm.endDate,
        exceptions
      );
      setValidation(validation);
    }
  }, [rangeExceptionForm, exceptions, showRangeForm]);

  // Handle single exception form change
  const handleSingleExceptionChange = (field, value) => {
    setSingleExceptionForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle range exception form change
  const handleRangeExceptionChange = (field, value) => {
    setRangeExceptionForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add single exception
  const handleAddSingleException = useCallback(async () => {
    if (!validation.isValid) return;

    try {
      const exception = createCalendarException(
        singleExceptionForm.date,
        singleExceptionForm.type,
        singleExceptionForm.reason,
        singleExceptionForm.description
      );

      const updatedCalendar = addExceptionToCalendar(calendar, exception);
      await onCalendarUpdate(updatedCalendar);
      
      setSingleExceptionForm({
        date: '',
        type: DEFAULT_EXCEPTION_CONFIG.exceptionTypes.HOLIDAY,
        reason: '',
        description: '',
        isWorkingDay: false,
        workingHours: 0,
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add exception:', error);
      alert(`Failed to add exception: ${error.message}`);
    }
  }, [singleExceptionForm, validation.isValid, calendar, onCalendarUpdate]);

  // Add date range exceptions
  const handleAddRangeExceptions = useCallback(async () => {
    if (!validation.isValid) return;

    try {
      const updatedCalendar = addDateRangeExceptionsToCalendar(
        calendar,
        rangeExceptionForm.startDate,
        rangeExceptionForm.endDate,
        rangeExceptionForm.type,
        rangeExceptionForm.reason,
        rangeExceptionForm.description
      );

      await onCalendarUpdate(updatedCalendar);
      
      setRangeExceptionForm({
        startDate: '',
        endDate: '',
        type: DEFAULT_EXCEPTION_CONFIG.exceptionTypes.HOLIDAY,
        reason: '',
        description: '',
        isWorkingDay: false,
        workingHours: 0,
      });
      setShowRangeForm(false);
    } catch (error) {
      console.error('Failed to add range exceptions:', error);
      alert(`Failed to add range exceptions: ${error.message}`);
    }
  }, [rangeExceptionForm, validation.isValid, calendar, onCalendarUpdate]);

  // Edit exception
  const handleEditException = useCallback(async (exceptionId, updates) => {
    try {
      const updatedCalendar = updateExceptionInCalendar(calendar, exceptionId, updates);
      await onCalendarUpdate(updatedCalendar);
      setEditingException(null);
    } catch (error) {
      console.error('Failed to update exception:', error);
      alert(`Failed to update exception: ${error.message}`);
    }
  }, [calendar, onCalendarUpdate]);

  // Delete exception
  const handleDeleteException = useCallback(async (exceptionId) => {
    if (!confirm('Are you sure you want to delete this exception?')) return;

    try {
      const updatedCalendar = removeExceptionFromCalendar(calendar, exceptionId);
      await onCalendarUpdate(updatedCalendar);
    } catch (error) {
      console.error('Failed to delete exception:', error);
      alert(`Failed to delete exception: ${error.message}`);
    }
  }, [calendar, onCalendarUpdate]);

  // Delete multiple exceptions
  const handleDeleteSelected = useCallback(async () => {
    if (selectedExceptions.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedExceptions.length} exceptions?`)) return;

    try {
      let updatedCalendar = { ...calendar };
      for (const exceptionId of selectedExceptions) {
        updatedCalendar = removeExceptionFromCalendar(updatedCalendar, exceptionId);
      }
      await onCalendarUpdate(updatedCalendar);
      setSelectedExceptions([]);
    } catch (error) {
      console.error('Failed to delete exceptions:', error);
      alert(`Failed to delete exceptions: ${error.message}`);
    }
  }, [selectedExceptions, calendar, onCalendarUpdate]);

  // Export exceptions
  const handleExport = useCallback((format = 'json') => {
    try {
      const data = exportExceptions(exceptions, format);
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calendar-exceptions.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export exceptions:', error);
      alert(`Failed to export exceptions: ${error.message}`);
    }
  }, [exceptions]);

  // Import exceptions
  const handleImport = useCallback(async () => {
    if (!importData.trim()) return;

    try {
      const importedExceptions = importExceptions(importData, importFormat);
      
      // Add each imported exception
      let updatedCalendar = { ...calendar };
      for (const exception of importedExceptions) {
        updatedCalendar = addExceptionToCalendar(updatedCalendar, exception);
      }
      
      await onCalendarUpdate(updatedCalendar);
      setImportData('');
      setShowImport(false);
    } catch (error) {
      console.error('Failed to import exceptions:', error);
      alert(`Failed to import exceptions: ${error.message}`);
    }
  }, [importData, importFormat, calendar, onCalendarUpdate]);

  // Filter and search exceptions
  const filteredExceptions = exceptions.filter(exception => {
    const matchesType = filterType === 'all' || exception.type === filterType;
    const matchesSearch = !searchTerm || 
      exception.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exception.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  // Get statistics
  const stats = getExceptionStatistics(exceptions);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Calendar Exception Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Add Forms */}
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            {/* Statistics */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium ml-2">{stats.total}</span>
                </div>
                <div>
                  <span className="text-gray-600">Non-working:</span>
                  <span className="font-medium ml-2">{stats.nonWorkingDays}</span>
                </div>
                <div>
                  <span className="text-gray-600">Working:</span>
                  <span className="font-medium ml-2">{stats.workingDays}</span>
                </div>
                <div>
                  <span className="text-gray-600">Types:</span>
                  <span className="font-medium ml-2">{Object.keys(stats.byType).length}</span>
                </div>
              </div>
            </div>

            {/* Add Single Exception */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900">Add Single Exception</h3>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  {showAddForm ? 'Hide' : 'Show'}
                </button>
              </div>

              {showAddForm && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={singleExceptionForm.date}
                      onChange={(e) => handleSingleExceptionChange('date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={singleExceptionForm.type}
                      onChange={(e) => handleSingleExceptionChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={DEFAULT_EXCEPTION_CONFIG.exceptionTypes.HOLIDAY}>Holiday</option>
                      <option value={DEFAULT_EXCEPTION_CONFIG.exceptionTypes.SITE_SHUTDOWN}>Site Shutdown</option>
                      <option value={DEFAULT_EXCEPTION_CONFIG.exceptionTypes.MAINTENANCE}>Maintenance</option>
                      <option value={DEFAULT_EXCEPTION_CONFIG.exceptionTypes.WEATHER}>Weather</option>
                      <option value={DEFAULT_EXCEPTION_CONFIG.exceptionTypes.CUSTOM}>Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason
                    </label>
                    <input
                      type="text"
                      value={singleExceptionForm.reason}
                      onChange={(e) => handleSingleExceptionChange('reason', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Christmas Day"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={singleExceptionForm.description}
                      onChange={(e) => handleSingleExceptionChange('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Additional details..."
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="singleIsWorkingDay"
                      checked={singleExceptionForm.isWorkingDay}
                      onChange={(e) => handleSingleExceptionChange('isWorkingDay', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="singleIsWorkingDay" className="text-sm text-gray-700">
                      Is Working Day
                    </label>
                  </div>

                  {singleExceptionForm.isWorkingDay && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Working Hours
                      </label>
                      <input
                        type="number"
                        value={singleExceptionForm.workingHours}
                        onChange={(e) => handleSingleExceptionChange('workingHours', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max="24"
                        step="0.5"
                      />
                    </div>
                  )}

                  {/* Validation */}
                  {!validation.isValid && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
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
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
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

                  <button
                    onClick={handleAddSingleException}
                    disabled={!validation.isValid}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Exception
                  </button>
                </div>
              )}
            </div>

            {/* Add Date Range */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900">Add Date Range</h3>
                <button
                  onClick={() => setShowRangeForm(!showRangeForm)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  {showRangeForm ? 'Hide' : 'Show'}
                </button>
              </div>

              {showRangeForm && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={rangeExceptionForm.startDate}
                      onChange={(e) => handleRangeExceptionChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={rangeExceptionForm.endDate}
                      onChange={(e) => handleRangeExceptionChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={rangeExceptionForm.type}
                      onChange={(e) => handleRangeExceptionChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={DEFAULT_EXCEPTION_CONFIG.exceptionTypes.HOLIDAY}>Holiday</option>
                      <option value={DEFAULT_EXCEPTION_CONFIG.exceptionTypes.SITE_SHUTDOWN}>Site Shutdown</option>
                      <option value={DEFAULT_EXCEPTION_CONFIG.exceptionTypes.MAINTENANCE}>Maintenance</option>
                      <option value={DEFAULT_EXCEPTION_CONFIG.exceptionTypes.WEATHER}>Weather</option>
                      <option value={DEFAULT_EXCEPTION_CONFIG.exceptionTypes.CUSTOM}>Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason
                    </label>
                    <input
                      type="text"
                      value={rangeExceptionForm.reason}
                      onChange={(e) => handleRangeExceptionChange('reason', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Christmas Break"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={rangeExceptionForm.description}
                      onChange={(e) => handleRangeExceptionChange('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Additional details..."
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="rangeIsWorkingDay"
                      checked={rangeExceptionForm.isWorkingDay}
                      onChange={(e) => handleRangeExceptionChange('isWorkingDay', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="rangeIsWorkingDay" className="text-sm text-gray-700">
                      Is Working Day
                    </label>
                  </div>

                  {rangeExceptionForm.isWorkingDay && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Working Hours
                      </label>
                      <input
                        type="number"
                        value={rangeExceptionForm.workingHours}
                        onChange={(e) => handleRangeExceptionChange('workingHours', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max="24"
                        step="0.5"
                      />
                    </div>
                  )}

                  {/* Validation */}
                  {!validation.isValid && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
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
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
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

                  <button
                    onClick={handleAddRangeExceptions}
                    disabled={!validation.isValid}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Range
                  </button>
                </div>
              )}
            </div>

            {/* Import/Export */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('json')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                >
                  <DocumentArrowDownIcon className="w-4 h-4" />
                  Export JSON
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                >
                  <DocumentArrowDownIcon className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
              
              <button
                onClick={() => setShowImport(!showImport)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                <DocumentArrowUpIcon className="w-4 h-4" />
                Import Exceptions
              </button>

              {showImport && (
                <div className="space-y-3">
                  <select
                    value={importFormat}
                    onChange={(e) => setImportFormat(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                  </select>
                  
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    rows="4"
                    placeholder="Paste import data here..."
                  />
                  
                  <button
                    onClick={handleImport}
                    disabled={!importData.trim()}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <DocumentArrowUpIcon className="w-4 h-4" />
                    Import
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Exception List */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Calendar Exceptions</h3>
              
              <div className="flex items-center gap-4">
                {/* Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value={DEFAULT_EXCEPTION_CONFIG.exceptionTypes.HOLIDAY}>Holiday</option>
                  <option value={DEFAULT_EXCEPTION_CONFIG.exceptionTypes.SITE_SHUTDOWN}>Site Shutdown</option>
                  <option value={DEFAULT_EXCEPTION_CONFIG.exceptionTypes.MAINTENANCE}>Maintenance</option>
                  <option value={DEFAULT_EXCEPTION_CONFIG.exceptionTypes.WEATHER}>Weather</option>
                  <option value={DEFAULT_EXCEPTION_CONFIG.exceptionTypes.CUSTOM}>Custom</option>
                </select>

                {/* Search */}
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search exceptions..."
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />

                {/* Bulk Actions */}
                {selectedExceptions.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete Selected ({selectedExceptions.length})
                  </button>
                )}
              </div>
            </div>

            {/* Exception List */}
            <div className="space-y-3">
              {filteredExceptions.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <InformationCircleIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">No Exceptions Found</p>
                  <p className="text-sm">
                    {exceptions.length === 0 
                      ? 'No calendar exceptions have been added yet.'
                      : 'No exceptions match the current filter.'
                    }
                  </p>
                </div>
              ) : (
                filteredExceptions.map((exception) => (
                  <div
                    key={exception.id}
                    className={`bg-white border rounded-lg p-4 ${
                      selectedExceptions.includes(exception.id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <input
                            type="checkbox"
                            checked={selectedExceptions.includes(exception.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedExceptions(prev => [...prev, exception.id]);
                              } else {
                                setSelectedExceptions(prev => prev.filter(id => id !== exception.id));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          
                          <span className="font-medium text-gray-900">
                            {exception.reason}
                          </span>
                          
                          <span className={`text-xs px-2 py-1 rounded ${
                            exception.isWorkingDay 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {exception.isWorkingDay ? 'Working Day' : 'Non-working Day'}
                          </span>
                          
                          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">
                            {exception.type}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{new Date(exception.date).toLocaleDateString()}</span>
                          </div>
                          
                          {exception.description && (
                            <p className="text-gray-500">{exception.description}</p>
                          )}
                          
                          {exception.isWorkingDay && exception.workingHours > 0 && (
                            <div className="flex items-center gap-2">
                              <ClockIcon className="w-4 h-4" />
                              <span>{exception.workingHours} hours</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => setEditingException(editingException === exception.id ? null : exception.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteException(exception.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Edit Form */}
                    {editingException === exception.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Reason
                            </label>
                            <input
                              type="text"
                              defaultValue={exception.reason}
                              onBlur={(e) => handleEditException(exception.id, { reason: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Type
                            </label>
                            <select
                              defaultValue={exception.type}
                              onChange={(e) => handleEditException(exception.id, { type: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                              <option value={DEFAULT_EXCEPTION_CONFIG.exceptionTypes.HOLIDAY}>Holiday</option>
                              <option value={DEFAULT_EXCEPTION_CONFIG.exceptionTypes.SITE_SHUTDOWN}>Site Shutdown</option>
                              <option value={DEFAULT_EXCEPTION_CONFIG.exceptionTypes.MAINTENANCE}>Maintenance</option>
                              <option value={DEFAULT_EXCEPTION_CONFIG.exceptionTypes.WEATHER}>Weather</option>
                              <option value={DEFAULT_EXCEPTION_CONFIG.exceptionTypes.CUSTOM}>Custom</option>
                            </select>
                          </div>
                          
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              defaultValue={exception.description}
                              onBlur={(e) => handleEditException(exception.id, { description: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              rows="2"
                            />
                          </div>
                          
                          <div className="col-span-2">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  defaultChecked={exception.isWorkingDay}
                                  onChange={(e) => handleEditException(exception.id, { isWorkingDay: e.target.checked })}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label className="text-sm text-gray-700">Is Working Day</label>
                              </div>
                              
                              {exception.isWorkingDay && (
                                <div className="flex items-center gap-2">
                                  <label className="text-sm text-gray-700">Hours:</label>
                                  <input
                                    type="number"
                                    defaultValue={exception.workingHours}
                                    onBlur={(e) => handleEditException(exception.id, { workingHours: parseFloat(e.target.value) || 0 })}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    min="0"
                                    max="24"
                                    step="0.5"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarExceptionManager;
