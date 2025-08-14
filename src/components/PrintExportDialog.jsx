// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from 'react';
import { useTaskContext } from '../modules/ProgrammeManager/context/TaskContext';
import { useViewContext } from '../modules/ProgrammeManager/context/ViewContext';
import { useCalendarContext } from '../modules/ProgrammeManager/context/CalendarContext';
import {
  XMarkIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  PhotoIcon,
  TableCellsIcon,
  DocumentTextIcon,
  CalendarIcon,
  ScaleIcon,
  ArrowsPointingOutIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';

const PrintExportDialog = ({ isOpen, onClose, onPrint, onExport }) => {
  const { tasks, taskLinks } = useTaskContext();
  const { viewState } = useViewContext();
  const { globalCalendar } = useCalendarContext();

  const [activeTab, setActiveTab] = useState('print');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Print settings
  const [printSettings, setPrintSettings] = useState({
    pageRange: 'all', // 'all', 'current', 'custom'
    customPageRange: { start: 1, end: 1 },
    dateRange: 'all', // 'all', 'visible', 'custom'
    customDateRange: { start: new Date(), end: new Date() },
    scaling: 100, // percentage
    orientation: 'landscape', // 'portrait', 'landscape'
    includeGrid: true,
    includeGantt: true,
    includeHeaders: true,
    includeFooters: true,
    pageSize: 'a4', // 'a4', 'a3', 'letter', 'legal'
    margins: { top: 20, right: 20, bottom: 20, left: 20 }, // mm
    showPageNumbers: true,
    showDateRange: true,
    showProjectInfo: true,
  });

  // Export settings
  const [exportSettings, setExportSettings] = useState({
    format: 'pdf', // 'pdf', 'png', 'xlsx'
    quality: 'high', // 'low', 'medium', 'high'
    includeData: true,
    includeCharts: true,
    dateRange: 'all',
    customDateRange: { start: new Date(), end: new Date() },
    scaling: 100,
    orientation: 'landscape',
  });

  const dialogRef = useRef(null);

  // Page size options
  const pageSizes = [
    { value: 'a4', label: 'A4 (210 × 297 mm)', width: 210, height: 297 },
    { value: 'a3', label: 'A3 (297 × 420 mm)', width: 297, height: 420 },
    { value: 'letter', label: 'Letter (8.5 × 11 in)', width: 216, height: 279 },
    { value: 'legal', label: 'Legal (8.5 × 14 in)', width: 216, height: 356 },
  ];

  // Export format options
  const exportFormats = [
    {
      value: 'pdf',
      label: 'PDF Document',
      icon: DocumentTextIcon,
      description: 'High-quality vector format',
    },
    {
      value: 'png',
      label: 'PNG Image',
      icon: PhotoIcon,
      description: 'High-resolution image format',
    },
    {
      value: 'xlsx',
      label: 'Excel Spreadsheet',
      icon: TableCellsIcon,
      description: 'Data in Excel format',
    },
  ];

  // Quality options
  const qualityOptions = [
    {
      value: 'low',
      label: 'Low (Fast)',
      description: 'Smaller file size, faster processing',
    },
    {
      value: 'medium',
      label: 'Medium',
      description: 'Balanced quality and performance',
    },
    {
      value: 'high',
      label: 'High (Slow)',
      description: 'Best quality, larger file size',
    },
  ];

  // Handle print settings change
  const handlePrintSettingChange = (key, value) => {
    setPrintSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle export settings change
  const handleExportSettingChange = (key, value) => {
    setExportSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle print
  const handlePrint = async () => {
    try {
      setIsProcessing(true);
      setError('');

      // Validate settings
      if (printSettings.pageRange === 'custom') {
        if (
          printSettings.customPageRange.start >
          printSettings.customPageRange.end
        ) {
          setError('Start page cannot be greater than end page');
          return;
        }
      }

      if (printSettings.dateRange === 'custom') {
        if (
          printSettings.customDateRange.start >
          printSettings.customDateRange.end
        ) {
          setError('Start date cannot be after end date');
          return;
        }
      }

      // Call print function
      if (onPrint) {
        await onPrint(printSettings);
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to print');
      console.error('Print error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      setIsProcessing(true);
      setError('');

      // Validate settings
      if (exportSettings.dateRange === 'custom') {
        if (
          exportSettings.customDateRange.start >
          exportSettings.customDateRange.end
        ) {
          setError('Start date cannot be after end date');
          return;
        }
      }

      // Call export function
      if (onExport) {
        await onExport(exportSettings);
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to export');
      console.error('Export error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Close dialog when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = event => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
        {/* Background overlay */}
        <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />

        {/* Dialog */}
        <div
          ref={dialogRef}
          className='inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full'
        >
          {/* Header */}
          <div className='bg-gray-50 px-6 py-4 border-b border-gray-200'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Print & Export Options
              </h3>
              <button
                onClick={onClose}
                className='text-gray-400 hover:text-gray-600 transition-colors'
              >
                <XMarkIcon className='w-6 h-6' />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className='border-b border-gray-200'>
            <nav className='-mb-px flex space-x-8 px-6'>
              <button
                onClick={() => setActiveTab('print')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'print'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <PrinterIcon className='w-5 h-5 inline mr-2' />
                Print
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'export'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <DocumentArrowDownIcon className='w-5 h-5 inline mr-2' />
                Export
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className='px-6 py-6'>
            {activeTab === 'print' ? (
              <div className='space-y-6'>
                {/* Page Range */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Page Range
                  </label>
                  <div className='space-y-2'>
                    <label className='flex items-center'>
                      <input
                        type='radio'
                        value='all'
                        checked={printSettings.pageRange === 'all'}
                        onChange={e =>
                          handlePrintSettingChange('pageRange', e.target.value)
                        }
                        className='mr-2'
                      />
                      All pages
                    </label>
                    <label className='flex items-center'>
                      <input
                        type='radio'
                        value='current'
                        checked={printSettings.pageRange === 'current'}
                        onChange={e =>
                          handlePrintSettingChange('pageRange', e.target.value)
                        }
                        className='mr-2'
                      />
                      Current page
                    </label>
                    <label className='flex items-center'>
                      <input
                        type='radio'
                        value='custom'
                        checked={printSettings.pageRange === 'custom'}
                        onChange={e =>
                          handlePrintSettingChange('pageRange', e.target.value)
                        }
                        className='mr-2'
                      />
                      Custom range
                    </label>
                    {printSettings.pageRange === 'custom' && (
                      <div className='ml-6 flex items-center space-x-2'>
                        <input
                          type='number'
                          min='1'
                          value={printSettings.customPageRange.start}
                          onChange={e =>
                            handlePrintSettingChange('customPageRange', {
                              ...printSettings.customPageRange,
                              start: parseInt(e.target.value) || 1,
                            })
                          }
                          className='w-20 px-2 py-1 border border-gray-300 rounded text-sm'
                        />
                        <span>to</span>
                        <input
                          type='number'
                          min='1'
                          value={printSettings.customPageRange.end}
                          onChange={e =>
                            handlePrintSettingChange('customPageRange', {
                              ...printSettings.customPageRange,
                              end: parseInt(e.target.value) || 1,
                            })
                          }
                          className='w-20 px-2 py-1 border border-gray-300 rounded text-sm'
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Date Range
                  </label>
                  <div className='space-y-2'>
                    <label className='flex items-center'>
                      <input
                        type='radio'
                        value='all'
                        checked={printSettings.dateRange === 'all'}
                        onChange={e =>
                          handlePrintSettingChange('dateRange', e.target.value)
                        }
                        className='mr-2'
                      />
                      All dates
                    </label>
                    <label className='flex items-center'>
                      <input
                        type='radio'
                        value='visible'
                        checked={printSettings.dateRange === 'visible'}
                        onChange={e =>
                          handlePrintSettingChange('dateRange', e.target.value)
                        }
                        className='mr-2'
                      />
                      Visible date range
                    </label>
                    <label className='flex items-center'>
                      <input
                        type='radio'
                        value='custom'
                        checked={printSettings.dateRange === 'custom'}
                        onChange={e =>
                          handlePrintSettingChange('dateRange', e.target.value)
                        }
                        className='mr-2'
                      />
                      Custom date range
                    </label>
                    {printSettings.dateRange === 'custom' && (
                      <div className='ml-6 space-y-2'>
                        <div className='flex items-center space-x-2'>
                          <label className='text-sm text-gray-600 w-16'>
                            From:
                          </label>
                          <input
                            type='date'
                            value={
                              printSettings.customDateRange.start
                                .toISOString()
                                .split('T')[0]
                            }
                            onChange={e =>
                              handlePrintSettingChange('customDateRange', {
                                ...printSettings.customDateRange,
                                start: new Date(e.target.value),
                              })
                            }
                            className='px-2 py-1 border border-gray-300 rounded text-sm'
                          />
                        </div>
                        <div className='flex items-center space-x-2'>
                          <label className='text-sm text-gray-600 w-16'>
                            To:
                          </label>
                          <input
                            type='date'
                            value={
                              printSettings.customDateRange.end
                                .toISOString()
                                .split('T')[0]
                            }
                            onChange={e =>
                              handlePrintSettingChange('customDateRange', {
                                ...printSettings.customDateRange,
                                end: new Date(e.target.value),
                              })
                            }
                            className='px-2 py-1 border border-gray-300 rounded text-sm'
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Layout Options */}
                <div className='grid grid-cols-2 gap-6'>
                  {/* Page Size */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Page Size
                    </label>
                    <select
                      value={printSettings.pageSize}
                      onChange={e =>
                        handlePrintSettingChange('pageSize', e.target.value)
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                      {pageSizes.map(size => (
                        <option key={size.value} value={size.value}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Orientation */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Orientation
                    </label>
                    <div className='space-y-2'>
                      <label className='flex items-center'>
                        <input
                          type='radio'
                          value='portrait'
                          checked={printSettings.orientation === 'portrait'}
                          onChange={e =>
                            handlePrintSettingChange(
                              'orientation',
                              e.target.value
                            )
                          }
                          className='mr-2'
                        />
                        Portrait
                      </label>
                      <label className='flex items-center'>
                        <input
                          type='radio'
                          value='landscape'
                          checked={printSettings.orientation === 'landscape'}
                          onChange={e =>
                            handlePrintSettingChange(
                              'orientation',
                              e.target.value
                            )
                          }
                          className='mr-2'
                        />
                        Landscape
                      </label>
                    </div>
                  </div>
                </div>

                {/* Scaling */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Scaling ({printSettings.scaling}%)
                  </label>
                  <input
                    type='range'
                    min='25'
                    max='200'
                    step='25'
                    value={printSettings.scaling}
                    onChange={e =>
                      handlePrintSettingChange(
                        'scaling',
                        parseInt(e.target.value)
                      )
                    }
                    className='w-full'
                  />
                  <div className='flex justify-between text-xs text-gray-500 mt-1'>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                    <span>125%</span>
                    <span>150%</span>
                    <span>175%</span>
                    <span>200%</span>
                  </div>
                </div>

                {/* Content Options */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Content Options
                  </label>
                  <div className='space-y-2'>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={printSettings.includeGrid}
                        onChange={e =>
                          handlePrintSettingChange(
                            'includeGrid',
                            e.target.checked
                          )
                        }
                        className='mr-2'
                      />
                      Include Task Grid
                    </label>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={printSettings.includeGantt}
                        onChange={e =>
                          handlePrintSettingChange(
                            'includeGantt',
                            e.target.checked
                          )
                        }
                        className='mr-2'
                      />
                      Include Gantt Chart
                    </label>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={printSettings.includeHeaders}
                        onChange={e =>
                          handlePrintSettingChange(
                            'includeHeaders',
                            e.target.checked
                          )
                        }
                        className='mr-2'
                      />
                      Include Headers
                    </label>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={printSettings.includeFooters}
                        onChange={e =>
                          handlePrintSettingChange(
                            'includeFooters',
                            e.target.checked
                          )
                        }
                        className='mr-2'
                      />
                      Include Footers
                    </label>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={printSettings.showPageNumbers}
                        onChange={e =>
                          handlePrintSettingChange(
                            'showPageNumbers',
                            e.target.checked
                          )
                        }
                        className='mr-2'
                      />
                      Show Page Numbers
                    </label>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={printSettings.showDateRange}
                        onChange={e =>
                          handlePrintSettingChange(
                            'showDateRange',
                            e.target.checked
                          )
                        }
                        className='mr-2'
                      />
                      Show Date Range
                    </label>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={printSettings.showProjectInfo}
                        onChange={e =>
                          handlePrintSettingChange(
                            'showProjectInfo',
                            e.target.checked
                          )
                        }
                        className='mr-2'
                      />
                      Show Project Information
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div className='space-y-6'>
                {/* Export Format */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Export Format
                  </label>
                  <div className='grid grid-cols-1 gap-3'>
                    {exportFormats.map(format => (
                      <label
                        key={format.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          exportSettings.format === format.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type='radio'
                          value={format.value}
                          checked={exportSettings.format === format.value}
                          onChange={e =>
                            handleExportSettingChange('format', e.target.value)
                          }
                          className='mr-3'
                        />
                        <format.icon className='w-6 h-6 text-gray-600 mr-3' />
                        <div>
                          <div className='font-medium text-gray-900'>
                            {format.label}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {format.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Quality (for PNG) */}
                {exportSettings.format === 'png' && (
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Quality
                    </label>
                    <div className='space-y-2'>
                      {qualityOptions.map(quality => (
                        <label
                          key={quality.value}
                          className='flex items-center'
                        >
                          <input
                            type='radio'
                            value={quality.value}
                            checked={exportSettings.quality === quality.value}
                            onChange={e =>
                              handleExportSettingChange(
                                'quality',
                                e.target.value
                              )
                            }
                            className='mr-2'
                          />
                          <div>
                            <div className='font-medium'>{quality.label}</div>
                            <div className='text-sm text-gray-500'>
                              {quality.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date Range */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Date Range
                  </label>
                  <div className='space-y-2'>
                    <label className='flex items-center'>
                      <input
                        type='radio'
                        value='all'
                        checked={exportSettings.dateRange === 'all'}
                        onChange={e =>
                          handleExportSettingChange('dateRange', e.target.value)
                        }
                        className='mr-2'
                      />
                      All dates
                    </label>
                    <label className='flex items-center'>
                      <input
                        type='radio'
                        value='visible'
                        checked={exportSettings.dateRange === 'visible'}
                        onChange={e =>
                          handleExportSettingChange('dateRange', e.target.value)
                        }
                        className='mr-2'
                      />
                      Visible date range
                    </label>
                    <label className='flex items-center'>
                      <input
                        type='radio'
                        value='custom'
                        checked={exportSettings.dateRange === 'custom'}
                        onChange={e =>
                          handleExportSettingChange('dateRange', e.target.value)
                        }
                        className='mr-2'
                      />
                      Custom date range
                    </label>
                    {exportSettings.dateRange === 'custom' && (
                      <div className='ml-6 space-y-2'>
                        <div className='flex items-center space-x-2'>
                          <label className='text-sm text-gray-600 w-16'>
                            From:
                          </label>
                          <input
                            type='date'
                            value={
                              exportSettings.customDateRange.start
                                .toISOString()
                                .split('T')[0]
                            }
                            onChange={e =>
                              handleExportSettingChange('customDateRange', {
                                ...exportSettings.customDateRange,
                                start: new Date(e.target.value),
                              })
                            }
                            className='px-2 py-1 border border-gray-300 rounded text-sm'
                          />
                        </div>
                        <div className='flex items-center space-x-2'>
                          <label className='text-sm text-gray-600 w-16'>
                            To:
                          </label>
                          <input
                            type='date'
                            value={
                              exportSettings.customDateRange.end
                                .toISOString()
                                .split('T')[0]
                            }
                            onChange={e =>
                              handleExportSettingChange('customDateRange', {
                                ...exportSettings.customDateRange,
                                end: new Date(e.target.value),
                              })
                            }
                            className='px-2 py-1 border border-gray-300 rounded text-sm'
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Export Options */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Export Options
                  </label>
                  <div className='space-y-2'>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={exportSettings.includeData}
                        onChange={e =>
                          handleExportSettingChange(
                            'includeData',
                            e.target.checked
                          )
                        }
                        className='mr-2'
                      />
                      Include Task Data
                    </label>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={exportSettings.includeCharts}
                        onChange={e =>
                          handleExportSettingChange(
                            'includeCharts',
                            e.target.checked
                          )
                        }
                        className='mr-2'
                      />
                      Include Charts
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-md'>
                <div className='text-sm text-red-600'>{error}</div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3'>
            <button
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              Cancel
            </button>
            {activeTab === 'print' ? (
              <button
                onClick={handlePrint}
                disabled={isProcessing}
                className='inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <PrinterIcon className='w-4 h-4 mr-2' />
                {isProcessing ? 'Printing...' : 'Print'}
              </button>
            ) : (
              <button
                onClick={handleExport}
                disabled={isProcessing}
                className='inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <DocumentArrowDownIcon className='w-4 h-4 mr-2' />
                {isProcessing ? 'Exporting...' : 'Export'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintExportDialog;
