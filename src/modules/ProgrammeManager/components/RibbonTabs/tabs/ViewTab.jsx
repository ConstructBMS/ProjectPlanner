 
import { useState, useRef, useEffect } from 'react';
import { getStorage, setStorage } from '../../../utils/persistentStorage.js';
import { useViewContext } from '../../../context/ViewContext';
import { useTaskContext } from '../../../context/TaskContext';
import { useFilterContext } from '../../../context/FilterContext';
import { useLayoutContext } from '../../../context/LayoutContext';
import { usePlannerStore } from '../../../state/plannerStore';
import { getSavedFilters, saveFilter, deleteFilter, getLastFilterId } from '../../../utils/prefs';
import PrintExportDialog from '../../PrintExportDialog';
import ResourceHistogram from '../../ResourceHistogram';
import ColumnChooserDialog from '../../modals/ColumnChooserDialog';
import RibbonButton from '../shared/RibbonButton';
import RibbonGroup from '../shared/RibbonGroup';
import {
  EyeIcon,
  ScissorsIcon,
  DocumentDuplicateIcon,
  PaperClipIcon,
  ChevronDownIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  FunnelIcon,
  PaintBrushIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  XMarkIcon,
  ClockIcon,
  TableCellsIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';

const TimelineZoomDropdown = () => {
  const [selectedScale, setSelectedScale] = useState('Week');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();
  const { viewState, updateViewState } = useViewContext();

  // Load saved zoom level on mount
  useEffect(() => {
    if (viewState.zoomLevel) {
      setSelectedScale(viewState.zoomLevel);
    }
  }, [viewState.zoomLevel]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = scale => {
    setSelectedScale(scale);
    updateViewState({ zoomLevel: scale });
    console.log(`Zoom set to ${scale}`);
    setIsOpen(false);
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-[60px] h-[48px] bg-gray-100 rounded flex items-center justify-between px-2 hover:bg-blue-100 transition-colors duration-150'
        title='Timeline zoom (Hour/Half-Day/Day/Week/Month)'
      >
        <span className='text-xs font-medium text-gray-700'>
          {selectedScale}
        </span>
        <ChevronDownIcon className='w-3 h-3 text-gray-500' />
      </button>

      {isOpen && (
        <div className='absolute top-full left-0 mt-1 z-10 w-[60px] bg-white shadow-md rounded border border-gray-200'>
          {['Hour', 'Half-Day', 'Day', 'Week', 'Month'].map(scale => (
            <div
              key={scale}
              className='px-2 py-1 text-xs hover:bg-blue-50 cursor-pointer transition-colors duration-150'
              onClick={() => handleSelect(scale)}
            >
              {scale}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ViewScaleDropdown = () => {
  const [selectedScale, setSelectedScale] = useState('Day');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();
  const { viewState, updateViewScale } = useViewContext();

  // Load saved view scale on mount
  useEffect(() => {
    if (viewState.viewScale) {
      setSelectedScale(viewState.viewScale);
    }
  }, [viewState.viewScale]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = scale => {
    setSelectedScale(scale);
    updateViewScale(scale);
    setIsOpen(false);
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-[60px] h-[48px] bg-gray-100 rounded flex items-center justify-between px-2 hover:bg-blue-100 transition-colors duration-150'
        title='View scale (Day/Week/Month)'
      >
        <span className='text-xs font-medium text-gray-700'>
          {selectedScale}
        </span>
        <ChevronDownIcon className='w-3 h-3 text-gray-500' />
      </button>

      {isOpen && (
        <div className='absolute top-full left-0 mt-1 z-10 w-[60px] bg-white shadow-md rounded border border-gray-200'>
          {['Day', 'Week', 'Month'].map(scale => (
            <div
              key={scale}
              className='px-2 py-1 text-xs hover:bg-blue-50 cursor-pointer transition-colors duration-150'
              onClick={() => handleSelect(scale)}
            >
              {scale}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CalendarViewGroup = () => {
  const [selectedView, setSelectedView] = useState('Workweek');
  const { viewState, updateViewState } = useViewContext();

  // Load saved calendar view on mount
  useEffect(() => {
    if (viewState.calendarView) {
      setSelectedView(viewState.calendarView);
    }
  }, [viewState.calendarView]);

  const handleViewSelect = view => {
    setSelectedView(view);
    updateViewState({ calendarView: view });
    console.log('Calendar View:', view);
  };

  const ViewButton = ({ view, label, tooltip }) => (
    <button
      onClick={() => handleViewSelect(view)}
      className={`w-[48px] h-[48px] rounded flex items-center justify-center transition-colors duration-150 ${
        selectedView === view
          ? 'bg-blue-50 border-2 border-blue-500'
          : 'bg-gray-100 hover:bg-blue-100 border-2 border-transparent'
      }`}
      title={tooltip}
    >
      <span className='text-xs font-medium text-gray-700'>{label}</span>
    </button>
  );

  return (
    <div className='flex gap-1'>
      <ViewButton
        view='Workweek'
        label='M–F'
        tooltip='Display Monday–Friday only'
      />
      <ViewButton view='Full Week' label='M–S' tooltip='Include weekend days' />
      <ViewButton
        view='30-Day'
        label='30d'
        tooltip='Show sliding 30‑day window'
      />
    </div>
  );
};

const ZoomGroup = () => {
  const { viewState, updateViewState } = useViewContext();

  const maxZoom = 3.0;
  const minZoom = 0.3;
  const isMaxZoom = viewState.timelineZoom >= maxZoom;
  const isMinZoom = viewState.timelineZoom <= minZoom;

  const handleZoomIn = () => {
    if (isMaxZoom) return;
    const newZoom = Math.min(viewState.timelineZoom * 1.2, maxZoom);
    updateViewState({ timelineZoom: newZoom });
    console.log('Zoom In:', newZoom.toFixed(2));
  };

  const handleZoomOut = () => {
    if (isMinZoom) return;
    const newZoom = Math.max(viewState.timelineZoom / 1.2, minZoom);
    updateViewState({ timelineZoom: newZoom });
    console.log('Zoom Out:', newZoom.toFixed(2));
  };

  const handleFitToView = () => {
    // Reset zoom to fit all tasks in view
    updateViewState({ timelineZoom: 1.0 });
    console.log('Fit to View: Reset zoom to 1.0');
  };

  return (
    <div className='flex gap-1'>
      <button
        onClick={handleZoomIn}
        disabled={isMaxZoom}
        className={`w-[48px] h-[48px] rounded flex items-center justify-center transition-colors duration-150 ${
          isMaxZoom
            ? 'bg-gray-200 cursor-not-allowed opacity-50'
            : 'bg-gray-100 hover:bg-blue-100'
        }`}
        title={isMaxZoom ? 'Maximum zoom reached' : 'Zoom into the timeline'}
      >
        <MagnifyingGlassPlusIcon
          className={`w-4 h-4 ${isMaxZoom ? 'text-gray-400' : 'text-gray-700'}`}
        />
      </button>
      <button
        onClick={handleZoomOut}
        disabled={isMinZoom}
        className={`w-[48px] h-[48px] rounded flex items-center justify-center transition-colors duration-150 ${
          isMinZoom
            ? 'bg-gray-200 cursor-not-allowed opacity-50'
            : 'bg-gray-100 hover:bg-blue-100'
        }`}
        title={isMinZoom ? 'Minimum zoom reached' : 'Zoom out of the timeline'}
      >
        <MagnifyingGlassMinusIcon
          className={`w-4 h-4 ${isMinZoom ? 'text-gray-400' : 'text-gray-700'}`}
        />
      </button>
      <button
        onClick={handleFitToView}
        className='w-[48px] h-[48px] bg-gray-100 rounded flex items-center justify-center hover:bg-blue-100 transition-colors duration-150'
        title='Fit all tasks to visible area'
      >
        <ArrowsPointingOutIcon className='w-4 h-4 text-gray-700' />
      </button>
      {/* Zoom Level Indicator */}
      <div className='flex items-center px-2 text-xs text-gray-600 font-medium'>
        {Math.round(viewState.timelineZoom * 100)}%
      </div>
    </div>
  );
};

const CriticalPathStyleDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = style => {
    console.log('Critical Path Style:', style);
    setIsOpen(false);
  };

  const styleOptions = [
    { name: 'Red outline', color: 'bg-red-500' },
    { name: 'Red fill', color: 'bg-red-600' },
    { name: 'Dotted outline (black)', color: 'bg-black' },
    {
      name: 'Custom color…',
      color: 'bg-gradient-to-r from-purple-400 to-pink-400',
    },
  ];

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-[48px] h-[48px] bg-gray-100 rounded flex items-center justify-center hover:bg-blue-100 transition-colors duration-150'
        title='Critical Path Styling Options'
      >
        <div className='flex flex-col items-center'>
          <span className='text-lg'>🔴</span>
          <ChevronDownIcon className='w-2 h-2 text-gray-500 mt-0.5' />
        </div>
      </button>

      {isOpen && (
        <div className='absolute top-full left-0 mt-1 z-10 w-[160px] bg-white shadow-md rounded border border-gray-200'>
          {styleOptions.map(option => (
            <div
              key={option.name}
              className='px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors duration-150 flex items-center gap-2'
              onClick={() => handleSelect(option.name)}
            >
              <div className={`w-3 h-3 rounded ${option.color}`} />
              <span className='text-xs text-gray-700'>{option.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const QuickFiltersDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    status: true,
    resource: true,
    dateRange: true,
  });
  const dropdownRef = useRef();

  const { viewState } = useViewContext();
  const { tasks } = useTaskContext();
  const {
    filters,
    setStatusFilter,
    setResourceFilter,
    setDateRangeFilter,
    clearAllFilters,
    hasActiveFilters,
    getActiveFilterCount,
    getAvailableResources,
    getAvailableStatuses,
  } = useFilterContext();

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSection = section => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleStatusSelect = status => {
    setStatusFilter(status);
  };

  const handleResourceSelect = resource => {
    setResourceFilter(resource);
  };

  const handleDateRangeChange = (type, value) => {
    if (type === 'start') {
      setDateRangeFilter(value, filters.dateRange.end);
    } else {
      setDateRangeFilter(filters.dateRange.start, value);
    }
  };

  const availableResources = getAvailableResources(tasks);
  const availableStatuses = getAvailableStatuses();
  const activeFilterCount = getActiveFilterCount();

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-[48px] h-[48px] rounded flex items-center justify-center transition-colors duration-150 ${
          hasActiveFilters()
            ? 'bg-blue-50 border-2 border-blue-500'
            : 'bg-gray-100 hover:bg-blue-100 border-2 border-transparent'
        }`}
        title='Quick Filters: Status, Resource, Date Range'
      >
        <FunnelIcon className='w-4 h-4 text-gray-700' />
        {activeFilterCount > 0 && (
          <div className='absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center'>
            {activeFilterCount}
          </div>
        )}
      </button>

      {isOpen && (
        <div className='absolute top-full left-0 mt-1 z-10 w-[280px] bg-white shadow-lg rounded-lg border border-gray-200 max-h-96 overflow-y-auto'>
          {/* Header */}
          <div className='px-4 py-3 border-b border-gray-200 bg-gray-50'>
            <div className='flex items-center justify-between'>
              <h3 className='text-sm font-semibold text-gray-700'>
                Quick Filters
              </h3>
              {hasActiveFilters() && (
                <button
                  onClick={clearAllFilters}
                  className='text-xs text-blue-600 hover:text-blue-800 font-medium'
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Status Filter Section */}
          <div className='border-b border-gray-100'>
            <button
              onClick={() => toggleSection('status')}
              className='w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50'
            >
              <span className='text-sm font-medium text-gray-700'>Status</span>
              <ChevronDownIcon
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  expandedSections.status ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedSections.status && (
              <div className='px-4 pb-3 space-y-1'>
                {availableStatuses.map(status => (
                  <label
                    key={status}
                    className='flex items-center space-x-2 cursor-pointer'
                  >
                    <input
                      type='radio'
                      name='status'
                      value={status}
                      checked={filters.status === status}
                      onChange={() => handleStatusSelect(status)}
                      className='w-3 h-3 text-blue-600'
                    />
                    <span className='text-xs text-gray-700'>{status}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Resource Filter Section */}
          <div className='border-b border-gray-100'>
            <button
              onClick={() => toggleSection('resource')}
              className='w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50'
            >
              <span className='text-sm font-medium text-gray-700'>
                Resource
              </span>
              <ChevronDownIcon
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  expandedSections.resource ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedSections.resource && (
              <div className='px-4 pb-3 space-y-1'>
                <label className='flex items-center space-x-2 cursor-pointer'>
                  <input
                    type='radio'
                    name='resource'
                    value='All'
                    checked={filters.resource === 'All'}
                    onChange={() => handleResourceSelect('All')}
                    className='w-3 h-3 text-blue-600'
                  />
                  <span className='text-xs text-gray-700'>All Resources</span>
                </label>
                {availableResources.map(resource => (
                  <label
                    key={resource}
                    className='flex items-center space-x-2 cursor-pointer'
                  >
                    <input
                      type='radio'
                      name='resource'
                      value={resource}
                      checked={filters.resource === resource}
                      onChange={() => handleResourceSelect(resource)}
                      className='w-3 h-3 text-blue-600'
                    />
                    <span className='text-xs text-gray-700'>{resource}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Date Range Filter Section */}
          <div className='border-b border-gray-100'>
            <button
              onClick={() => toggleSection('dateRange')}
              className='w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50'
            >
              <span className='text-sm font-medium text-gray-700'>
                Date Range
              </span>
              <ChevronDownIcon
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  expandedSections.dateRange ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedSections.dateRange && (
              <div className='px-4 pb-3 space-y-2'>
                <div>
                  <label className='block text-xs text-gray-600 mb-1'>
                    Start Date
                  </label>
                  <input
                    type='date'
                    value={
                      filters.dateRange.start
                        ? filters.dateRange.start.split('T')[0]
                        : ''
                    }
                    onChange={e =>
                      handleDateRangeChange('start', e.target.value)
                    }
                    className='w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
                  />
                </div>
                <div>
                  <label className='block text-xs text-gray-600 mb-1'>
                    End Date
                  </label>
                  <input
                    type='date'
                    value={
                      filters.dateRange.end
                        ? filters.dateRange.end.split('T')[0]
                        : ''
                    }
                    onChange={e => handleDateRangeChange('end', e.target.value)}
                    className='w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='px-4 py-2 bg-gray-50 text-xs text-gray-500'>
            {activeFilterCount > 0
              ? `${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} active`
              : 'No filters applied'}
          </div>
        </div>
      )}
    </div>
  );
};

const SaveLayoutPresetButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const dropdownRef = useRef();

  const { savePreset, savedPresets } = useLayoutContext();

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowNameInput(false);
        setPresetName('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSavePreset = () => {
    if (presetName.trim()) {
      savePreset(presetName.trim());
      setPresetName('');
      setShowNameInput(false);
      setIsOpen(false);
    }
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleSavePreset();
    } else if (e.key === 'Escape') {
      setShowNameInput(false);
      setPresetName('');
    }
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-[48px] h-[48px] bg-gray-100 hover:bg-blue-100 rounded flex items-center justify-center transition-colors duration-150 border-2 border-transparent'
        title='Save current layout as preset'
      >
        <DocumentDuplicateIcon className='w-4 h-4 text-gray-700' />
      </button>

      {isOpen && (
        <div className='absolute top-full left-0 mt-1 z-10 w-[240px] bg-white shadow-lg rounded-lg border border-gray-200'>
          <div className='px-4 py-3 border-b border-gray-200 bg-gray-50'>
            <h3 className='text-sm font-semibold text-gray-700'>
              Save Layout Preset
            </h3>
          </div>

          <div className='p-4 space-y-3'>
            {showNameInput ? (
              <div className='space-y-2'>
                <input
                  type='text'
                  value={presetName}
                  onChange={e => setPresetName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder='Enter preset name...'
                  className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
                  autoFocus
                />
                <div className='flex space-x-2'>
                  <button
                    onClick={handleSavePreset}
                    disabled={!presetName.trim()}
                    className='px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowNameInput(false);
                      setPresetName('');
                    }}
                    className='px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNameInput(true)}
                className='w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
              >
                Save Current Layout
              </button>
            )}

            {savedPresets.length > 0 && (
              <div className='pt-2 border-t border-gray-200'>
                <p className='text-xs text-gray-500 mb-2'>
                  Saved Presets ({savedPresets.length})
                </p>
                <div className='space-y-1 max-h-32 overflow-y-auto'>
                  {savedPresets.map(preset => (
                    <div
                      key={preset.id}
                      className='text-xs text-gray-600 px-2 py-1 bg-gray-50 rounded'
                    >
                      {preset.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const PrintExportButton = ({ contentRef }) => {
  const [showDialog, setShowDialog] = useState(false);

  const handlePrintExport = () => {
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  return (
    <>
      <RibbonButton
        icon={<DocumentArrowDownIcon className='w-4 h-4' />}
        label='Print/Export'
        onClick={handlePrintExport}
        tooltip='Print or export as PDF with scaling and date range options'
      />
      <PrintExportDialog
        isOpen={showDialog}
        onClose={handleCloseDialog}
        contentRef={contentRef}
      />
    </>
  );
};

const LoadLayoutPresetDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  const { savedPresets, loadPreset, deletePreset, resetToDefault } =
    useLayoutContext();

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLoadPreset = presetId => {
    loadPreset(presetId);
    setIsOpen(false);
  };

  const handleDeletePreset = (e, presetId) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this preset?')) {
      deletePreset(presetId);
    }
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-[48px] h-[48px] bg-gray-100 hover:bg-blue-100 rounded flex items-center justify-center transition-colors duration-150 border-2 border-transparent'
        title='Load saved layout preset'
      >
        <PaperClipIcon className='w-4 h-4 text-gray-700' />
      </button>

      {isOpen && (
        <div className='absolute top-full left-0 mt-1 z-10 w-[280px] bg-white shadow-lg rounded-lg border border-gray-200 max-h-80 overflow-y-auto'>
          <div className='px-4 py-3 border-b border-gray-200 bg-gray-50'>
            <h3 className='text-sm font-semibold text-gray-700'>
              Load Layout Preset
            </h3>
          </div>

          <div className='p-2'>
            {savedPresets.length === 0 ? (
              <div className='px-3 py-4 text-center text-sm text-gray-500'>
                No saved presets
              </div>
            ) : (
              <div className='space-y-1'>
                {savedPresets.map(preset => (
                  <div
                    key={preset.id}
                    onClick={() => handleLoadPreset(preset.id)}
                    className='px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors rounded flex items-center justify-between group'
                  >
                    <div>
                      <div className='text-sm font-medium text-gray-700'>
                        {preset.name}
                      </div>
                      <div className='text-xs text-gray-500'>
                        Saved {formatDate(preset.createdAt)}
                      </div>
                    </div>
                    <button
                      onClick={e => handleDeletePreset(e, preset.id)}
                      className='opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-opacity'
                      title='Delete preset'
                    >
                      <svg
                        className='w-3 h-3'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className='mt-3 pt-3 border-t border-gray-200'>
              <button
                onClick={() => {
                  resetToDefault();
                  setIsOpen(false);
                }}
                className='w-full px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors'
              >
                Reset to Default Layout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusHighlightingToggle = () => {
  const { viewState, updateViewState } = useViewContext();

  const handleToggle = () => {
    updateViewState({ statusHighlighting: !viewState.statusHighlighting });
    console.log('Status highlighting:', !viewState.statusHighlighting);
  };

  return (
    <RibbonButton
      icon={<PaintBrushIcon className='w-4 h-4' />}
      label='Status Highlighting'
      onClick={handleToggle}
      tooltip='Toggle status-based row highlighting'
      className={
        viewState.statusHighlighting ? 'bg-blue-50 border-blue-500' : ''
      }
    />
  );
};

const ShowWeekendsToggle = () => {
  const { viewState, toggleWeekends } = useViewContext();

  const handleToggle = () => {
    toggleWeekends();
  };

  return (
    <div className='flex items-center space-x-2 px-2 py-1'>
      <label className='flex items-center space-x-2 cursor-pointer'>
        <input
          type='checkbox'
          checked={viewState.showWeekends}
          onChange={handleToggle}
          className='w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2'
        />
        <span className='text-xs text-gray-700 font-medium'>Show Weekends</span>
      </label>
    </div>
  );
};

const ShowGridlinesToggle = () => {
  const { viewState, toggleGridlines } = useViewContext();

  const handleToggle = () => {
    toggleGridlines();
  };

  return (
    <div className='flex items-center space-x-2 px-2 py-1'>
      <label className='flex items-center space-x-2 cursor-pointer'>
        <input
          type='checkbox'
          checked={viewState.showGridlines}
          onChange={handleToggle}
          className='w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2'
        />
        <span className='text-xs text-gray-700 font-medium'>
          Show Gridlines
        </span>
      </label>
    </div>
  );
};

const ShowCriticalPathToggle = () => {
  const { showCriticalPath, toggleCriticalPath } = usePlannerStore();

  const handleToggle = () => {
    toggleCriticalPath();
  };

  return (
    <div className='flex items-center space-x-2 px-2 py-1'>
      <label className='flex items-center space-x-2 cursor-pointer'>
        <input
          type='checkbox'
          checked={showCriticalPath}
          onChange={handleToggle}
          className='w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2'
        />
        <span className='text-xs text-gray-700 font-medium'>
          Show Critical Path
        </span>
      </label>
    </div>
  );
};

const ShowSlackToggle = () => {
  const { viewState, toggleSlack } = useViewContext();

  const handleToggle = () => {
    toggleSlack();
  };

  return (
    <div className='flex items-center space-x-2 px-2 py-1'>
      <label className='flex items-center space-x-2 cursor-pointer'>
        <input
          type='checkbox'
          checked={viewState.showSlack}
          onChange={handleToggle}
          className='w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2'
        />
        <span className='text-xs text-gray-700 font-medium'>Show Slack</span>
      </label>
    </div>
  );
};

const ShowBaselineToggle = () => {
  const { viewState, toggleBaseline } = useViewContext();

  const handleToggle = () => {
    toggleBaseline();
  };

  return (
    <div className='flex items-center space-x-2 px-2 py-1'>
      <label className='flex items-center space-x-2 cursor-pointer'>
        <input
          type='checkbox'
          checked={viewState.showBaseline}
          onChange={handleToggle}
          className='w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2'
        />
        <span className='text-xs text-gray-700 font-medium'>Show Baseline</span>
      </label>
    </div>
  );
};

const BaselineDropdown = () => {
  const { viewState, setActiveBaseline, updateBaselines } = useViewContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  // Load baselines from persistent storage and sync with ProjectTab
  useEffect(() => {
    const loadBaselines = async () => {
      const savedBaselines = await getStorage('project.baselines');
      if (savedBaselines) {
        updateBaselines(savedBaselines);
      }
    };

    // Load initially
    loadBaselines();
  }, [updateBaselines]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBaselineSelect = baselineId => {
    setActiveBaseline(baselineId);
    setIsOpen(false);
  };

  const handleClearBaseline = () => {
    setActiveBaseline(null);
    setIsOpen(false);
  };

  const getSelectedBaselineName = () => {
    if (!viewState.activeBaselineId) return 'Select Baseline';
    const baseline = viewState.baselines.find(
      b => b.id === viewState.activeBaselineId
    );
    return baseline ? baseline.name : 'Select Baseline';
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        title='Select baseline for comparison'
      >
        <ChartBarIcon className='w-4 h-4 text-gray-500' />
        <span className='text-gray-700'>{getSelectedBaselineName()}</span>
        <ChevronDownIcon className='w-3 h-3 text-gray-500' />
      </button>

      {isOpen && (
        <div className='absolute top-full left-0 mt-1 z-50 bg-white border border-gray-300 rounded-md shadow-lg min-w-48'>
          <div className='py-1'>
            {viewState.baselines.length === 0 ? (
              <div className='px-3 py-2 text-sm text-gray-500'>
                No baselines available
              </div>
            ) : (
              <>
                {viewState.baselines.map(baseline => (
                  <button
                    key={baseline.id}
                    onClick={() => handleBaselineSelect(baseline.id)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      viewState.activeBaselineId === baseline.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700'
                    }`}
                  >
                    <div className='font-medium'>{baseline.name}</div>
                    <div className='text-xs text-gray-500'>
                      {new Date(baseline.createdAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
                <div className='border-t border-gray-200 mt-1'>
                  <button
                    onClick={handleClearBaseline}
                    className='w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors'
                  >
                    Clear Selection
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TimeUnitToggle = () => {
  const { viewState, updateTimeUnit } = useViewContext();

  const handleTimeUnitChange = timeUnit => {
    updateTimeUnit(timeUnit);
  };

  const getTimeUnitLabel = timeUnit => {
    switch (timeUnit) {
      case 'day':
        return 'Days';
      case 'week':
        return 'Weeks';
      case 'month':
        return 'Months';
      default:
        return 'Days';
    }
  };

  return (
    <div className='flex items-center space-x-2 px-2 py-1'>
      <span className='text-xs text-gray-700 font-medium'>Time Unit:</span>
      <div className='flex space-x-1'>
        {['day', 'week', 'month'].map(unit => (
          <button
            key={unit}
            onClick={() => handleTimeUnitChange(unit)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              viewState.timeUnit === unit
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={`Switch to ${getTimeUnitLabel(unit)} view`}
          >
            {getTimeUnitLabel(unit)}
          </button>
        ))}
      </div>
    </div>
  );
};

const TimeScaleDropdown = () => {
  const {
    viewState,
    updateTimeScale,
    updatePrimaryTimeUnit,
    updateSecondaryTimeUnit,
  } = useViewContext();
  const [isOpen, setIsOpen] = useState(false);

  const timeScaleOptions = [
    {
      value: 'single',
      label: 'Single Scale',
      description: 'Show one time unit',
    },
    { value: 'dual', label: 'Dual Scale', description: 'Show two time units' },
  ];

  const timeUnitOptions = [
    { value: 'day', label: 'Days' },
    { value: 'week', label: 'Weeks' },
    { value: 'month', label: 'Months' },
  ];

  const presetCombinations = [
    { primary: 'month', secondary: 'week', label: 'Month/Week' },
    { primary: 'week', secondary: 'day', label: 'Week/Day' },
    { primary: 'day', secondary: 'hour', label: 'Day/Hour' },
  ];

  const handleTimeScaleChange = timeScale => {
    updateTimeScale(timeScale);
    setIsOpen(false);
  };

  const handlePresetSelect = (primary, secondary) => {
    updateTimeScale('dual');
    updatePrimaryTimeUnit(primary);
    updateSecondaryTimeUnit(secondary);
    setIsOpen(false);
  };

  const getCurrentLabel = () => {
    if (viewState.timeScale === 'single') {
      return 'Single Scale';
    } else {
      const primary =
        timeUnitOptions.find(u => u.value === viewState.primaryTimeUnit)
          ?.label || 'Days';
      const secondary =
        timeUnitOptions.find(u => u.value === viewState.secondaryTimeUnit)
          ?.label || 'Weeks';
      return `${primary}/${secondary}`;
    }
  };

  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        title='Select time scale configuration'
      >
        <CalendarDaysIcon className='w-4 h-4 text-gray-500' />
        <span className='text-gray-700'>{getCurrentLabel()}</span>
        <ChevronDownIcon className='w-4 h-4 text-gray-400' />
      </button>

      {isOpen && (
        <div className='absolute top-full left-0 mt-1 z-50 bg-white border border-gray-300 rounded-md shadow-lg p-3 min-w-64'>
          <div className='space-y-3'>
            <div>
              <label className='block text-xs font-medium text-gray-700 mb-2'>
                Scale Type
              </label>
              <div className='space-y-1'>
                {timeScaleOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleTimeScaleChange(option.value)}
                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                      viewState.timeScale === option.value
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className='font-medium'>{option.label}</div>
                    <div className='text-xs text-gray-500'>
                      {option.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {viewState.timeScale === 'dual' && (
              <>
                <div className='border-t border-gray-200 pt-3'>
                  <label className='block text-xs font-medium text-gray-700 mb-2'>
                    Preset Combinations
                  </label>
                  <div className='space-y-1'>
                    {presetCombinations.map(preset => (
                      <button
                        key={preset.label}
                        onClick={() =>
                          handlePresetSelect(preset.primary, preset.secondary)
                        }
                        className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                          viewState.primaryTimeUnit === preset.primary &&
                          viewState.secondaryTimeUnit === preset.secondary
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='border-t border-gray-200 pt-3'>
                  <label className='block text-xs font-medium text-gray-700 mb-2'>
                    Custom Configuration
                  </label>
                  <div className='grid grid-cols-2 gap-2'>
                    <div>
                      <label className='block text-xs text-gray-600 mb-1'>
                        Primary
                      </label>
                      <select
                        value={viewState.primaryTimeUnit}
                        onChange={e => updatePrimaryTimeUnit(e.target.value)}
                        className='w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
                      >
                        {timeUnitOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className='block text-xs text-gray-600 mb-1'>
                        Secondary
                      </label>
                      <select
                        value={viewState.secondaryTimeUnit}
                        onChange={e => updateSecondaryTimeUnit(e.target.value)}
                        className='w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
                      >
                        {timeUnitOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const StatusDatePicker = () => {
  const { viewState, updateViewState } = useViewContext();
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState(
    viewState.statusDate || new Date().toISOString().split('T')[0]
  );

  const handleDateChange = e => {
    setTempDate(e.target.value);
  };

  const handleApply = () => {
    updateViewState({ statusDate: tempDate });
    setIsOpen(false);
  };

  const handleResetToToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setTempDate(today);
    updateViewState({ statusDate: today });
    setIsOpen(false);
  };

  const formatDisplayDate = dateString => {
    if (!dateString) return 'Today';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        title='Set progress line status date'
      >
        <ClockIcon className='w-4 h-4 text-gray-500' />
        <span className='text-gray-700'>
          {formatDisplayDate(viewState.statusDate)}
        </span>
      </button>

      {isOpen && (
        <div className='absolute top-full left-0 mt-1 z-50 bg-white border border-gray-300 rounded-md shadow-lg p-3 min-w-64'>
          <div className='space-y-3'>
            <div>
              <label className='block text-xs font-medium text-gray-700 mb-1'>
                Status Date
              </label>
              <input
                type='date'
                value={tempDate}
                onChange={handleDateChange}
                className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            <div className='flex space-x-2'>
              <button
                onClick={handleApply}
                className='flex-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
              >
                Apply
              </button>
              <button
                onClick={handleResetToToday}
                className='flex-1 px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors'
              >
                Today
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className='flex-1 px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ZoomToFitButton = () => {
  const { tasks } = useTaskContext();

  const handleZoomToFit = () => {
    if (window.__PP_GANTT__?.fitProject) {
      window.__PP_GANTT__.fitProject();
    }
  };

  const isDisabled = tasks.length === 0;

  return (
    <RibbonButton
      icon={<ArrowsPointingOutIcon className='w-4 h-4' />}
      label='Fit Project'
      onClick={handleZoomToFit}
      disabled={isDisabled}
      tooltip={
        isDisabled ? 'No tasks to fit' : 'Fit timeline to show all project tasks'
      }
      className={isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
    />
  );
};

const FitSelectionButton = () => {
  const { selectedTaskIds } = useTaskContext();

  const handleFitSelection = () => {
    if (window.__PP_GANTT__?.fitSelection) {
      window.__PP_GANTT__.fitSelection();
    }
  };

  const isDisabled = selectedTaskIds.size === 0;

  return (
    <RibbonButton
      icon={<MagnifyingGlassPlusIcon className='w-4 h-4' />}
      label='Fit Selection'
      onClick={handleFitSelection}
      disabled={isDisabled}
      tooltip={
        isDisabled ? 'No selection to fit' : 'Fit timeline to show selected tasks'
      }
      className={isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
    />
  );
};

const TodayButton = () => {
  const { goToToday } = useViewContext();

  const handleGoToToday = () => {
    goToToday();
  };

  return (
    <RibbonButton
      icon={<CalendarDaysIcon className='w-4 h-4' />}
      label='Today'
      onClick={handleGoToToday}
      tooltip='Scroll timeline to center current date in viewport'
    />
  );
};

// Grid Options Toggle Components
const FreezeFirstColumnToggle = () => {
  const { gridOptions, updateGridOptions } = useLayoutContext();

  const handleToggle = () => {
    updateGridOptions({ freezeFirstColumn: !gridOptions.freezeFirstColumn });
    console.info('Freeze First Column toggled:', !gridOptions.freezeFirstColumn);
  };

  return (
    <RibbonButton
      icon={<TableCellsIcon className='w-4 h-4' />}
      label='Freeze First'
      onClick={handleToggle}
      tooltip='Freeze the first column in place when scrolling horizontally'
      active={gridOptions.freezeFirstColumn}
    />
  );
};

const RowStripeToggle = () => {
  const { gridOptions, updateGridOptions } = useLayoutContext();

  const handleToggle = () => {
    updateGridOptions({ rowStripe: !gridOptions.rowStripe });
    console.info('Row Stripe toggled:', !gridOptions.rowStripe);
  };

  return (
    <RibbonButton
      icon={<TableCellsIcon className='w-4 h-4' />}
      label='Row Stripe'
      onClick={handleToggle}
      tooltip='Alternate row colors for better readability'
      active={gridOptions.rowStripe}
    />
  );
};

const ShowIdsToggle = () => {
  const { gridOptions, updateGridOptions } = useLayoutContext();

  const handleToggle = () => {
    updateGridOptions({ showIds: !gridOptions.showIds });
    console.info('Show IDs toggled:', !gridOptions.showIds);
  };

  return (
    <RibbonButton
      icon={<TableCellsIcon className='w-4 h-4' />}
      label='Show IDs'
      onClick={handleToggle}
      tooltip='Display task IDs in the grid'
      active={gridOptions.showIds}
    />
  );
};

// Filter & Group Components
const FilterSplitButton = () => {
  const [savedFilters, setSavedFilters] = useState([]);
  const [lastFilterId, setLastFilterId] = useState();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState('');
  const [currentFilterQuery] = useState('');

  useEffect(() => {
    // Load saved filters and last filter ID
    setSavedFilters(getSavedFilters());
    setLastFilterId(getLastFilterId());
  }, []);

  const handleFilterToggle = () => {
    if (lastFilterId) {
      const filter = savedFilters.find(f => f.id === lastFilterId);
      if (filter) {
        // Emit filter apply event
        const event = new window.CustomEvent('VIEW_FILTER_APPLY', { 
          detail: { filterId: lastFilterId, query: filter.query } 
        });
        document.dispatchEvent(event);
        console.info('Applied last filter:', filter.name);
      }
    } else {
      console.info('No last filter to apply');
    }
  };

  const handleSaveCurrentFilter = () => {
    setShowSaveDialog(true);
    setSaveFilterName('');
  };

  const handleSaveFilterConfirm = () => {
    if (saveFilterName.trim()) {
      const newFilter = {
        id: `filter_${Date.now()}`,
        name: saveFilterName.trim(),
        query: currentFilterQuery,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      };
      
      saveFilter(newFilter);
      setSavedFilters(getSavedFilters());
      setLastFilterId(newFilter.id);
      setLastFilterId(newFilter.id);
      setShowSaveDialog(false);
      setSaveFilterName('');
      console.info('Saved filter:', newFilter.name);
    }
  };

  const handleDeleteFilter = (filterId) => {
    const filter = savedFilters.find(f => f.id === filterId);
    if (filter && confirm(`Delete filter "${filter.name}"?`)) {
      deleteFilter(filterId);
      setSavedFilters(getSavedFilters());
      if (lastFilterId === filterId) {
        setLastFilterId(undefined);
        setLastFilterId(undefined);
      }
      console.info('Deleted filter:', filter.name);
    }
  };

  const handleClearFilter = () => {
    const event = new window.CustomEvent('VIEW_FILTER_CLEAR');
    document.dispatchEvent(event);
    setLastFilterId(undefined);
    setLastFilterId(undefined);
    console.info('Cleared all filters');
  };

  const handleApplyFilter = (filterId) => {
    const filter = savedFilters.find(f => f.id === filterId);
    if (filter) {
      // Update last used timestamp
      filter.lastUsed = new Date().toISOString();
      saveFilter(filter);
      setLastFilterId(filterId);
      setLastFilterId(filterId);
      
      // Emit filter apply event
      const event = new window.CustomEvent('VIEW_FILTER_APPLY', { 
        detail: { filterId, query: filter.query } 
      });
      document.dispatchEvent(event);
      console.info('Applied filter:', filter.name);
    }
  };

  const getMenuItems = () => {
    const items = [
      ...savedFilters.map(filter => ({
        id: filter.id,
        label: filter.name,
        onClick: () => handleApplyFilter(filter.id),
        icon: 'filter'
      })),
      { id: 'separator1', type: 'separator' },
      { id: 'save', label: 'Save Current...', onClick: handleSaveCurrentFilter, icon: 'save' },
      { id: 'clear', label: 'Clear Filter', onClick: handleClearFilter, icon: 'clear' }
    ];

    // Add delete options for saved filters
    if (savedFilters.length > 0) {
      items.push({ id: 'separator2', type: 'separator' });
      savedFilters.forEach(filter => {
        items.push({
          id: `delete_${filter.id}`,
          label: `Delete "${filter.name}"`,
          onClick: () => handleDeleteFilter(filter.id),
          icon: 'delete'
        });
      });
    }

    return items;
  };

  const lastFilter = savedFilters.find(f => f.id === lastFilterId);
  const isFilterActive = !!lastFilter;

  return (
    <>
      <RibbonButton
        icon={<FunnelIcon className='w-4 h-4' />}
        label='Filter'
        onClick={handleFilterToggle}
        tooltip={lastFilter ? `Apply ${lastFilter.name}` : 'No saved filters'}
        active={isFilterActive}
        menuItems={getMenuItems()}
        onMenuSelect={(item) => item.onClick()}
      />

      {/* Save Filter Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Save Filter
            </h3>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Filter name..."
                value={saveFilterName}
                onChange={(e) => setSaveFilterName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setShowSaveDialog(false);
                  else if (e.key === 'Enter') handleSaveFilterConfirm();
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFilterConfirm}
                disabled={!saveFilterName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const QuickFilterInput = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery !== '') {
      const event = new window.CustomEvent('VIEW_FILTER_QUERY', { 
        detail: { query: debouncedQuery } 
      });
      document.dispatchEvent(event);
      console.info('Quick filter query:', debouncedQuery);
    }
  }, [debouncedQuery]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setQuery('');
      setDebouncedQuery('');
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder="Quick filter..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-32 h-8 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ×
        </button>
      )}
    </div>
  );
};

const GroupByWBSToggle = () => {
  const [isGrouped, setIsGrouped] = useState(false);

  const handleToggle = () => {
    const newState = !isGrouped;
    setIsGrouped(newState);
    
    const event = new window.CustomEvent('VIEW_GROUP_BY_WBS', { 
      detail: { grouped: newState } 
    });
    document.dispatchEvent(event);
    console.info('Group by WBS toggled:', newState);
  };

  return (
    <RibbonButton
      icon={<FolderIcon className='w-4 h-4' />}
      label='Group WBS'
      onClick={handleToggle}
      tooltip='Group tasks by Work Breakdown Structure'
      active={isGrouped}
    />
  );
};

const ViewTab = ({ contentRef }) => {
  const [showResourceHistogram, setShowResourceHistogram] = useState(false);
  const [showColumnChooser, setShowColumnChooser] = useState(false);
  const { gridConfig, updateGridConfig } = useLayoutContext();
  const { tasks } = useTaskContext();

  return (
    <>
      <div className='flex flex-nowrap gap-0 p-2 bg-white w-full min-w-0'>
        {/* Timeline Zoom Group */}
        <RibbonGroup title='Timeline Zoom'>
          <TimelineZoomDropdown />
          <ViewScaleDropdown />
        </RibbonGroup>

        {/* Zoom Group */}
        <RibbonGroup title='Zoom'>
          <ZoomGroup />
          <ZoomToFitButton />
          <FitSelectionButton />
          <TodayButton />
        </RibbonGroup>

        {/* Histogram Zoom Group */}
        <RibbonGroup title='Histogram Zoom'>
          <RibbonButton
            icon={<MagnifyingGlassPlusIcon className='w-4 h-4' />}
            label='Zoom In'
            onClick={() => console.log('Histogram Zoom In')}
            tooltip='Zoom into the resource histogram'
          />
          <RibbonButton
            icon={<MagnifyingGlassMinusIcon className='w-4 h-4' />}
            label='Zoom Out'
            onClick={() => console.log('Histogram Zoom Out')}
            tooltip='Zoom out of the resource histogram'
          />
          <RibbonButton
            icon={<ArrowsPointingOutIcon className='w-4 h-4' />}
            label='Fit to Data'
            onClick={() => console.log('Histogram Fit to Data')}
            tooltip='Fit histogram to show all data'
          />
          <RibbonButton
            icon={<ArrowPathIcon className='w-4 h-4' />}
            label='Reset Zoom'
            onClick={() => console.log('Histogram Reset Zoom')}
            tooltip='Reset histogram zoom to default'
          />
        </RibbonGroup>

        {/* Calendar View Group */}
        <RibbonGroup title='Calendar View'>
          <CalendarViewGroup />
        </RibbonGroup>

        {/* Critical Path Style Group */}
        <RibbonGroup title='Critical Path Style'>
          <CriticalPathStyleDropdown />
        </RibbonGroup>

        {/* Task Filters Group */}
        <RibbonGroup title='Task Filters'>
          <QuickFiltersDropdown />
        </RibbonGroup>

        {/* Layout Presets Group */}
        <RibbonGroup title='Layout Presets'>
          <SaveLayoutPresetButton />
          <LoadLayoutPresetDropdown />
        </RibbonGroup>

        {/* Print & Export Group */}
        <RibbonGroup title='Print & Export'>
          <PrintExportButton contentRef={contentRef} />
        </RibbonGroup>

        {/* View Group */}
        <RibbonGroup title='View'>
          <RibbonButton
            icon={<EyeIcon className='w-4 h-4 text-gray-700' />}
            label='View Options'
          />
          <RibbonButton
            icon={<TableCellsIcon className='w-4 h-4 text-blue-600' />}
            label='Customize Columns'
            onClick={() => setShowColumnChooser(true)}
            tooltip='Add, remove, and reorder grid columns'
          />
          <StatusHighlightingToggle />
          <ShowWeekendsToggle />
          <ShowGridlinesToggle />
          <ShowCriticalPathToggle />
          <ShowSlackToggle />
          <ShowBaselineToggle />
          <BaselineDropdown />
          <TimeUnitToggle />
          <TimeScaleDropdown />
          <StatusDatePicker />
        </RibbonGroup>

        {/* Grid Options Group */}
        <RibbonGroup title='Grid Options'>
          <RibbonButton
            icon={<TableCellsIcon className='w-4 h-4 text-blue-600' />}
            label='Columns...'
            onClick={() => setShowColumnChooser(true)}
            tooltip='Configure grid columns and their visibility'
          />
          <FreezeFirstColumnToggle />
          <RowStripeToggle />
          <ShowIdsToggle />
        </RibbonGroup>

        {/* Filter & Group Group */}
        <RibbonGroup title='Filter & Group'>
          <FilterSplitButton />
          <QuickFilterInput />
          <GroupByWBSToggle />
        </RibbonGroup>

        {/* Resource Group */}
        <RibbonGroup title='Resource'>
          <RibbonButton
            icon={<CalendarDaysIcon className='w-4 h-4 text-blue-600' />}
            label='Resource Calendar'
            onClick={() => console.log('Resource Calendar clicked')}
            tooltip='View resource availability and workload calendar'
          />
          <RibbonButton
            icon={<ChartBarIcon className='w-4 h-4 text-green-600' />}
            label='Resource Histogram'
            onClick={() => setShowResourceHistogram(!showResourceHistogram)}
            tooltip='View resource allocation histogram over time'
          />
        </RibbonGroup>

        {/* Clipboard Group (Disabled) */}
        <RibbonGroup title='Clipboard' disabled={true}>
          <RibbonButton
            icon={<ScissorsIcon className='w-4 h-4 text-gray-700' />}
            label='Cut'
            disabled={true}
          />
          <RibbonButton
            icon={<DocumentDuplicateIcon className='w-4 h-4 text-gray-700' />}
            label='Copy'
            disabled={true}
          />
          <RibbonButton
            icon={<PaperClipIcon className='w-4 h-4 text-gray-700' />}
            label='Paste'
            disabled={true}
          />
        </RibbonGroup>

        {/* Font Group (Disabled) */}
        <RibbonGroup title='Font' disabled={true}>
          <RibbonButton
            icon='B'
            label='Bold'
            disabled={true}
            iconType='text'
            className='font-bold'
          />
          <RibbonButton
            icon='I'
            label='Italic'
            disabled={true}
            iconType='text'
            className='italic'
          />
          <RibbonButton
            icon='U'
            label='Underline'
            disabled={true}
            iconType='text'
            className='underline'
          />
        </RibbonGroup>
      </div>

      {/* Resource Histogram Modal */}
      {showResourceHistogram && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-xl w-11/12 h-5/6 max-w-7xl flex flex-col'>
            <div className='flex items-center justify-between p-4 border-b border-gray-200'>
              <h2 className='text-lg font-semibold text-gray-800'>
                Resource Histogram
              </h2>
              <button
                onClick={() => setShowResourceHistogram(false)}
                className='text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100'
              >
                <XMarkIcon className='w-5 h-5' />
              </button>
            </div>
            <div className='flex-1 p-4 overflow-hidden'>
              <ResourceHistogram />
            </div>
          </div>
        </div>
      )}

      {/* Column Chooser Dialog */}
      <ColumnChooserDialog
        isOpen={showColumnChooser}
        onClose={() => setShowColumnChooser(false)}
        gridConfig={gridConfig}
        onConfigChange={updateGridConfig}
        tasks={tasks}
      />
    </>
  );
};

export default ViewTab;
