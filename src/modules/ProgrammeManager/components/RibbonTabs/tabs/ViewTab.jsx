import { useState, useRef, useEffect } from 'react';
import { useViewContext } from '../../../context/ViewContext';
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
  HomeIcon,
  CalendarDaysIcon,
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
  const { viewState, updateViewState, goToToday } = useViewContext();

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
      <button
        onClick={goToToday}
        className='w-[48px] h-[48px] bg-gray-100 rounded flex items-center justify-center hover:bg-blue-100 transition-colors duration-150'
        title='Go to Today'
        aria-label='Go to Today'
      >
        <HomeIcon className='w-4 h-4 text-gray-700' />
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

const TaskFiltersDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();
  const { viewState, updateViewState } = useViewContext();

  // Load saved filter on mount
  useEffect(() => {
    if (viewState.taskFilter) {
      // Filter is already loaded from viewState
    }
  }, [viewState.taskFilter]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = filter => {
    updateViewState({ taskFilter: filter });
    console.log('Task Filter:', filter);
    setIsOpen(false);
  };

  const filterOptions = [
    { value: 'Show All', label: 'Show All', icon: '👁️' },
    { value: 'Critical Tasks', label: 'Critical Tasks', icon: '🚨' },
    { value: 'Milestones', label: 'Milestones', icon: '🎯' },
    { value: 'Delayed Tasks', label: 'Delayed Tasks', icon: '⏰' },
    { value: 'Grouped by Phase', label: 'Grouped by Phase', icon: '📊' },
  ];

  // Filter options are available for future use

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-[48px] h-[48px] rounded flex items-center justify-center transition-colors duration-150 ${
          viewState.taskFilter !== 'Show All'
            ? 'bg-blue-50 border-2 border-blue-500'
            : 'bg-gray-100 hover:bg-blue-100 border-2 border-transparent'
        }`}
        title='Filter tasks by category or status'
      >
        <FunnelIcon className='w-4 h-4 text-gray-700' />
      </button>

      {isOpen && (
        <div className='absolute top-full left-0 mt-1 z-10 w-[160px] bg-white shadow-md rounded border border-gray-200'>
          {filterOptions.map(option => (
            <div
              key={option.value}
              className={`px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors duration-150 flex items-center gap-2 ${
                viewState.taskFilter === option.value ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleSelect(option.value)}
            >
              <span className='text-sm'>{option.icon}</span>
              <span className='text-xs text-gray-700'>{option.label}</span>
              {viewState.taskFilter === option.value && (
                <div className='ml-auto w-2 h-2 bg-blue-500 rounded-full' />
              )}
            </div>
          ))}
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

const ViewTab = () => {
  return (
    <div className='flex flex-nowrap gap-0 p-2 bg-white w-full min-w-0'>
      {/* Timeline Zoom Group */}
      <RibbonGroup title='Timeline Zoom'>
        <TimelineZoomDropdown />
      </RibbonGroup>

      {/* Zoom Group */}
      <RibbonGroup title='Zoom'>
        <ZoomGroup />
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
        <TaskFiltersDropdown />
      </RibbonGroup>

      {/* View Group */}
      <RibbonGroup title='View'>
        <RibbonButton
          icon={<EyeIcon className='w-4 h-4 text-gray-700' />}
          label='View Options'
        />
        <StatusHighlightingToggle />
      </RibbonGroup>

      {/* Resource Group */}
      <RibbonGroup title='Resource'>
        <RibbonButton
          icon={<CalendarDaysIcon className='w-4 h-4 text-blue-600' />}
          label='Resource Calendar'
          onClick={() => console.log('Resource Calendar clicked')}
          tooltip='View resource availability and workload calendar'
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
  );
};

export default ViewTab;
