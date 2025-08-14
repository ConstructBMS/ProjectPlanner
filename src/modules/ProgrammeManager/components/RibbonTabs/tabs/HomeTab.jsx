import { useState, useCallback, useRef, useEffect } from 'react';
import { getStorage, setStorage } from '../../../utils/persistentStorage.js';
import useTaskManager from '../../../hooks/useTaskManager';
import { useTaskContext } from '../../../context/TaskContext';
import { useViewContext } from '../../../context/ViewContext';
import { useUndoRedoContext } from '../../../context/UndoRedoContext';
import RibbonButton from '../shared/RibbonButton';
import RibbonGroup from '../shared/RibbonGroup';
import RibbonDropdown from '../shared/RibbonDropdown';
import RibbonMenu from '../RibbonMenu';
import SwatchRow from '../ui/SwatchRow';
import ExportDialog from '../ui/ExportDialog';
import MiniModal from '../ui/MiniModal';
import LinkPicker from '../ui/LinkPicker';
import PrintExportDialog from '../../../components/PrintExportDialog';
import {
  exportProject,
  printProject,
} from '../../../../../utils/printExportUtils';

import {
  ClipboardDocumentIcon,
  DocumentDuplicateIcon,
  ScissorsIcon,
  BoldIcon,
  ItalicIcon,
  FlagIcon,
  LinkIcon,
  ArrowPathIcon,
  FolderIcon,
  ChevronDoubleDownIcon,
  ChevronRightIcon,
  UserIcon,
  PlusIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  Squares2X2Icon,
  PaintBrushIcon,
  PencilIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  RectangleStackIcon,
  ClockIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  TrashIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  ChevronDownIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  DocumentArrowUpIcon,
  EyeIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  LinkIcon as LinkIconSolid,
} from '@heroicons/react/24/outline';

export default function HomeTab({ onExpandAll, onCollapseAll }) {
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [showPrintExportDialog, setShowPrintExportDialog] = useState(false);
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);
  const [historyMenuPosition, setHistoryMenuPosition] = useState({ x: 0, y: 0 });
  const historyButtonRef = useRef(null);
  
  // Font formatting state
  const [fontFormat, setFontFormat] = useState({ bold: false, italic: false });
  const [lastTextColor, setLastTextColor] = useState('#000000');
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [colorMenuPosition, setColorMenuPosition] = useState({ x: 0, y: 0 });
  const colorButtonRef = useRef(null);
  
  // Row height state
  const [rowHeight, setRowHeight] = useState('normal'); // eslint-disable-line no-unused-vars
  const [showRowHeightMenu, setShowRowHeightMenu] = useState(false);
  const [rowHeightMenuPosition, setRowHeightMenuPosition] = useState({ x: 0, y: 0 });
  const rowHeightButtonRef = useRef(null);
  
  // Schedule state
  const [constraintFlagActive, setConstraintFlagActive] = useState(false);
  const [showRescheduleMenu, setShowRescheduleMenu] = useState(false);
  const [rescheduleMenuPosition, setRescheduleMenuPosition] = useState({ x: 0, y: 0 });
  const rescheduleButtonRef = useRef(null);
  
  // Hierarchy state
  const [showBreakSummaryDialog, setShowBreakSummaryDialog] = useState(false);
  const [breakSummaryTask, setBreakSummaryTask] = useState(null);
  
  // Task conversion and assignment state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignResourceId, setAssignResourceId] = useState('');
  const [assignResourceSearch, setAssignResourceSearch] = useState('');
  
  // Progress state
  const [currentProgressPercent, setCurrentProgressPercent] = useState(100);
  
  // Appearance state
  const [lastUsedColor, setLastUsedColor] = useState('#3b82f6'); // Default blue
  const [lastUsedBarStyle, setLastUsedBarStyle] = useState('normal');
  const [showBarStyleMenu, setShowBarStyleMenu] = useState(false);
  const [barStyleMenuPosition, setBarStyleMenuPosition] = useState({ x: 0, y: 0 });
  const barStyleButtonRef = useRef(null);
  
  // Print/Export state
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportMenuPosition, setExportMenuPosition] = useState({ x: 0, y: 0 });
  const [exportDialogMode, setExportDialogMode] = useState('export');
  const exportButtonRef = useRef(null);

  // Color swatches (ConstructBMS-friendly colors)
  const colorSwatches = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#ec4899', // Pink
  ];

  // Bar style options
  const barStyleOptions = [
    { id: 'normal', label: 'Normal', icon: '■' },
    { id: 'critical', label: 'Critical', icon: '⚠' },
    { id: 'milestone', label: 'Milestone', icon: '◆' },
    { id: 'summary', label: 'Summary', icon: '▣' },
    { id: 'baseline', label: 'Baseline', icon: '▭' },
    { id: 'deadline', label: 'Deadline', icon: '⚡' },
    { id: 'progress', label: 'Progress', icon: '▰' },
    { id: 'custom', label: 'Custom...', icon: '⚙' },
  ];

  const {
    addMilestone,
    insertTaskBelow,
    insertSummaryTask,
    deleteTask,
  } = useTaskManager();

  // Get undo/redo functions from UndoRedoContext
  const { undo, redo, canUndo, canRedo, undoStack, redoStack } = useUndoRedoContext();

  // Get the current task context for selection state
  const { selectedTaskId, selectedTaskIds } = useTaskContext();

  // Get zoom functions and critical path toggle from view context
  const {
    zoomIn,
    zoomOut,
    zoomToFit,
    goToToday,
    viewState,
    toggleProgressLine,
  } = useViewContext();

  // Get expand milestones function and tasks from task context
  const { expandMilestones, getVisibleTasks, tasks, taskLinks } =
    useTaskContext();



  const handleInsertTaskBelow = () => {
    insertTaskBelow(selectedTaskId);
  };

  const handleInsertSummaryTask = () => {
    insertSummaryTask(selectedTaskIds);
  };

  const handleDeleteTask = () => {
    if (!selectedTaskId) {
      console.warn('No task selected for deletion');
      return;
    }

    // Optional: Add confirmation in the future
    // const confirmed = window.confirm(`Are you sure you want to delete the selected task? This action cannot be undone.`);
    // if (!confirmed) return;

    deleteTask(selectedTaskId);
    console.log('Deleted task:', selectedTaskId);
  };

  // Calculate project start and end dates
  const getProjectDates = () => {
    const tasks = getVisibleTasks(viewState.taskFilter);
    if (tasks.length === 0) {
      return { startDate: null, endDate: null };
    }

    const startDates = tasks.map(task => new Date(task.startDate));
    const endDates = tasks.map(task => new Date(task.endDate));

    const projectStart = new Date(Math.min(...startDates));
    const projectEnd = new Date(Math.max(...endDates));

    return { startDate: projectStart, endDate: projectEnd };
  };

  const formatProjectDate = date => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleExpandCollapseToggle = () => {
    if (isAllExpanded) {
      onCollapseAll();
      setIsAllExpanded(false);
    } else {
      onExpandAll();
      setIsAllExpanded(true);
    }
  };

  // History menu functions
  const handleHistoryMenuToggle = useCallback(() => {
    if (showHistoryMenu) {
      setShowHistoryMenu(false);
    } else {
      const rect = historyButtonRef.current?.getBoundingClientRect();
      if (rect) {
        setHistoryMenuPosition({
          x: rect.left,
          y: rect.bottom + 4
        });
        setShowHistoryMenu(true);
      }
    }
  }, [showHistoryMenu]);

  const handleHistoryMenuClose = useCallback(() => {
    setShowHistoryMenu(false);
  }, []);

  const getRecentActions = useCallback(() => {
    const actions = [];
    
    // Add undo actions (most recent first)
    for (let i = undoStack.length - 1; i >= Math.max(0, undoStack.length - 10); i--) {
      const action = undoStack[i];
      actions.push({
        id: `undo-${i}`,
        label: action.label || `Undo: ${action.type || 'Action'}`,
        disabled: false,
        action: () => {
          console.info('History menu: Undo action selected');
          undo();
          setShowHistoryMenu(false);
        }
      });
    }

    // Add redo actions (most recent first)
    for (let i = redoStack.length - 1; i >= Math.max(0, redoStack.length - 10); i--) {
      const action = redoStack[i];
      actions.push({
        id: `redo-${i}`,
        label: action.label || `Redo: ${action.type || 'Action'}`,
        disabled: false,
        action: () => {
          console.info('History menu: Redo action selected');
          redo();
          setShowHistoryMenu(false);
        }
      });
    }

    return actions.slice(0, 10); // Limit to 10 total actions
  }, [undoStack, redoStack, undo, redo]);

  // Font formatting functions
  const handleBoldToggle = useCallback(() => {
    const newBold = !fontFormat.bold;
    setFontFormat(prev => ({ ...prev, bold: newBold }));
    
    // Emit FORMAT_APPLY event
    const event = new window.CustomEvent('FORMAT_APPLY', {
      detail: { bold: newBold, italic: fontFormat.italic, color: lastTextColor }
    });
    document.dispatchEvent(event);
    
    console.info('Font formatting applied:', { bold: newBold, italic: fontFormat.italic, color: lastTextColor });
  }, [fontFormat.bold, fontFormat.italic, lastTextColor]);

  const handleItalicToggle = useCallback(() => {
    const newItalic = !fontFormat.italic;
    setFontFormat(prev => ({ ...prev, italic: newItalic }));
    
    // Emit FORMAT_APPLY event
    const event = new window.CustomEvent('FORMAT_APPLY', {
      detail: { bold: fontFormat.bold, italic: newItalic, color: lastTextColor }
    });
    document.dispatchEvent(event);
    
    console.info('Font formatting applied:', { bold: fontFormat.bold, italic: newItalic, color: lastTextColor });
  }, [fontFormat.bold, fontFormat.italic, lastTextColor]);

  const handleTextColorApply = useCallback((color) => {
    setLastTextColor(color);
    
    // Emit FORMAT_APPLY event
    const event = new window.CustomEvent('FORMAT_APPLY', {
      detail: { bold: fontFormat.bold, italic: fontFormat.italic, color }
    });
    document.dispatchEvent(event);
    
    console.info('Font formatting applied:', { bold: fontFormat.bold, italic: fontFormat.italic, color });
    setShowColorMenu(false);
  }, [fontFormat.bold, fontFormat.italic]);

  const handleColorMenuToggle = useCallback(() => {
    if (showColorMenu) {
      setShowColorMenu(false);
    } else {
      const rect = colorButtonRef.current?.getBoundingClientRect();
      if (rect) {
        setColorMenuPosition({
          x: rect.left,
          y: rect.bottom + 4
        });
        setShowColorMenu(true);
      }
    }
  }, [showColorMenu]);

  const handleColorMenuClose = useCallback(() => {
    setShowColorMenu(false);
  }, []);

  const getColorMenuItems = useCallback(() => {
    const colors = [
      { id: 'black', label: 'Black', color: '#000000' },
      { id: 'red', label: 'Red', color: '#dc2626' },
      { id: 'blue', label: 'Blue', color: '#2563eb' },
      { id: 'green', label: 'Green', color: '#16a34a' },
      { id: 'orange', label: 'Orange', color: '#ea580c' },
      { id: 'purple', label: 'Purple', color: '#9333ea' },
      { id: 'gray', label: 'Gray', color: '#6b7280' },
      { id: 'brown', label: 'Brown', color: '#a16207' },
    ];

    return [
      ...colors.map(color => ({
        id: color.id,
        label: color.label,
        disabled: false,
        action: () => handleTextColorApply(color.color),
        icon: (
          <div 
            className="w-4 h-4 rounded border border-gray-300" 
            style={{ backgroundColor: color.color }}
          />
        )
      })),
      { id: 'separator', label: '', disabled: true },
      {
        id: 'more',
        label: 'More Colors...',
        disabled: false,
        action: () => {
          console.info('More colors dialog would open');
          setShowColorMenu(false);
        }
      }
    ];
  }, [handleTextColorApply]);

  // Appearance handlers
  const handleColorSelect = useCallback((color) => {
    const selectedTasks = selectedTaskIds || [selectedTaskId].filter(Boolean);
    
    if (selectedTasks.length === 0) {
      console.info('No tasks selected for color change');
      return;
    }
    
    setLastUsedColor(color);
    setShowColorMenu(false);
    
    // Save to persistent storage
    setStorage('pm.style.last.color', color);
    
    // Emit STYLE_COLOR_APPLY event
    const event = new window.CustomEvent('STYLE_COLOR_APPLY', {
      detail: { 
        taskIds: selectedTasks,
        color
      }
    });
    document.dispatchEvent(event);
    
    console.info('Apply color to tasks:', { 
      taskIds: selectedTasks, 
      color
    });
  }, [selectedTaskId, selectedTaskIds]);

  const handleBarStyleSelect = useCallback((styleId) => {
    const selectedTasks = selectedTaskIds || [selectedTaskId].filter(Boolean);
    
    if (selectedTasks.length === 0) {
      console.info('No tasks selected for bar style change');
      return;
    }
    
    setLastUsedBarStyle(styleId);
    setShowBarStyleMenu(false);
    
    // Save to persistent storage
    setStorage('pm.style.last.barStyle', styleId);
    
    // Emit STYLE_BAR_APPLY event
    const event = new window.CustomEvent('STYLE_BAR_APPLY', {
      detail: { 
        taskIds: selectedTasks,
        styleId
      }
    });
    document.dispatchEvent(event);
    
    console.info('Apply bar style to tasks:', { 
      taskIds: selectedTasks, 
      styleId
    });
  }, [selectedTaskId, selectedTaskIds]);

  const getAppearanceColorMenuItems = useCallback(() => [
    {
      id: 'swatches',
      label: 'Color Swatches',
      disabled: false,
      action: () => {}, // Will be handled by custom content
      customContent: (
        <SwatchRow
          colors={colorSwatches}
          onColorSelect={handleColorSelect}
          selectedColor={lastUsedColor}
        />
      )
    }
  ], [colorSwatches, handleColorSelect, lastUsedColor]);

  // Row height functions
  const handleRowHeightChange = useCallback((mode) => {
    setRowHeight(mode);
    
    // Emit GRID_ROW_HEIGHT_SET event
    const event = new window.CustomEvent('GRID_ROW_HEIGHT_SET', {
      detail: { mode }
    });
    document.dispatchEvent(event);
    
    console.info('Row height changed:', mode);
    setShowRowHeightMenu(false);
  }, []);

  const handleRowHeightMenuToggle = useCallback(() => {
    if (showRowHeightMenu) {
      setShowRowHeightMenu(false);
    } else {
      const rect = rowHeightButtonRef.current?.getBoundingClientRect();
      if (rect) {
        setRowHeightMenuPosition({
          x: rect.left,
          y: rect.bottom + 4
        });
        setShowRowHeightMenu(true);
      }
    }
  }, [showRowHeightMenu]);

  const handleRowHeightMenuClose = useCallback(() => {
    setShowRowHeightMenu(false);
  }, []);

  const getRowHeightMenuItems = useCallback(() => [
    {
      id: 'compact',
      label: 'Compact',
      disabled: false,
      action: () => handleRowHeightChange('compact'),
      icon: <ArrowsPointingInIcon className="w-4 h-4" />
    },
    {
      id: 'normal',
      label: 'Normal',
      disabled: false,
      action: () => handleRowHeightChange('normal'),
      icon: <div className="w-4 h-4 flex items-center justify-center">─</div>
    },
    {
      id: 'comfortable',
      label: 'Comfortable',
      disabled: false,
      action: () => handleRowHeightChange('comfortable'),
      icon: <ArrowsPointingOutIcon className="w-4 h-4" />
    }
  ], [handleRowHeightChange]);

  // Schedule functions
  const handleConstraintFlagToggle = useCallback(() => {
    const newConstraintFlag = !constraintFlagActive;
    setConstraintFlagActive(newConstraintFlag);
    
    // Emit TASK_CONSTRAINT_TOGGLE event
    const event = new window.CustomEvent('TASK_CONSTRAINT_TOGGLE', {
      detail: { 
        active: newConstraintFlag,
        selectedTasks: selectedTaskIds || [selectedTaskId].filter(Boolean)
      }
    });
    document.dispatchEvent(event);
    
    console.info('Constraint flag toggled:', { 
      active: newConstraintFlag, 
      selectedTasks: selectedTaskIds || [selectedTaskId].filter(Boolean) 
    });
  }, [constraintFlagActive, selectedTaskId, selectedTaskIds]);

  const handleDeleteLinks = useCallback(() => {
    const selectedTasks = selectedTaskIds || [selectedTaskId].filter(Boolean);
    
    if (selectedTasks.length === 0) {
      console.info('No tasks selected for link deletion');
      return;
    }
    
    // Emit LINKS_DELETE_SELECTED event
    const event = new window.CustomEvent('LINKS_DELETE_SELECTED', {
      detail: { 
        selectedTasks,
        linkTypes: ['FS', 'SS', 'FF', 'SF'] // All link types
      }
    });
    document.dispatchEvent(event);
    
    console.info('Delete links for selected tasks:', { 
      selectedTasks, 
      linkTypes: ['FS', 'SS', 'FF', 'SF'] 
    });
  }, [selectedTaskId, selectedTaskIds]);

  const handleRescheduleToProjectStart = useCallback(() => {
    const selectedTasks = selectedTaskIds || [selectedTaskId].filter(Boolean);
    
    if (selectedTasks.length === 0) {
      console.info('No tasks selected for rescheduling');
      return;
    }
    
    // Emit RESCHEDULE_SELECTED event
    const event = new window.CustomEvent('RESCHEDULE_SELECTED', {
      detail: { 
        selectedTasks,
        target: 'project_start',
        date: null
      }
    });
    document.dispatchEvent(event);
    
    console.info('Reschedule to project start:', { selectedTasks });
    setShowRescheduleMenu(false);
  }, [selectedTaskId, selectedTaskIds]);

  const handleRescheduleToNextWorkingDay = useCallback(() => {
    const selectedTasks = selectedTaskIds || [selectedTaskId].filter(Boolean);
    
    if (selectedTasks.length === 0) {
      console.info('No tasks selected for rescheduling');
      return;
    }
    
    // Emit RESCHEDULE_SELECTED event
    const event = new window.CustomEvent('RESCHEDULE_SELECTED', {
      detail: { 
        selectedTasks,
        target: 'next_working_day',
        date: null
      }
    });
    document.dispatchEvent(event);
    
    console.info('Reschedule to next working day:', { selectedTasks });
    setShowRescheduleMenu(false);
  }, [selectedTaskId, selectedTaskIds]);

  const handleRescheduleToDate = useCallback(() => {
    const selectedTasks = selectedTaskIds || [selectedTaskId].filter(Boolean);
    
    if (selectedTasks.length === 0) {
      console.info('No tasks selected for rescheduling');
      return;
    }
    
    // Prompt for date (ISO format for now)
    const dateInput = window.prompt('Enter target date (YYYY-MM-DD):');
    
    if (!dateInput) {
      console.info('No date entered for rescheduling');
      return;
    }
    
    // Validate ISO date format
    const targetDate = new Date(dateInput);
    if (isNaN(targetDate.getTime())) {
      console.warn('Invalid date format. Please use YYYY-MM-DD');
      return;
    }
    
    // Emit RESCHEDULE_SELECTED event
    const event = new window.CustomEvent('RESCHEDULE_SELECTED', {
      detail: { 
        selectedTasks,
        target: 'specific_date',
        date: dateInput
      }
    });
    document.dispatchEvent(event);
    
    console.info('Reschedule to specific date:', { selectedTasks, date: dateInput });
    setShowRescheduleMenu(false);
  }, [selectedTaskId, selectedTaskIds]);

  const handleRescheduleMenuToggle = useCallback(() => {
    if (showRescheduleMenu) {
      setShowRescheduleMenu(false);
    } else {
      const rect = rescheduleButtonRef.current?.getBoundingClientRect();
      if (rect) {
        setRescheduleMenuPosition({
          x: rect.left,
          y: rect.bottom + 4
        });
        setShowRescheduleMenu(true);
      }
    }
  }, [showRescheduleMenu]);

  const handleRescheduleMenuClose = useCallback(() => {
    setShowRescheduleMenu(false);
  }, []);

  const getRescheduleMenuItems = useCallback(() => [
    {
      id: 'project_start',
      label: 'To Project Start',
      disabled: false,
      action: handleRescheduleToProjectStart,
      icon: <ArrowPathIcon className="w-4 h-4" />
    },
    {
      id: 'next_working_day',
      label: 'To Next Working Day',
      disabled: false,
      action: handleRescheduleToNextWorkingDay,
      icon: <ArrowPathIcon className="w-4 h-4" />
    },
    {
      id: 'specific_date',
      label: 'To Date...',
      disabled: false,
      action: handleRescheduleToDate,
      icon: <ArrowPathIcon className="w-4 h-4" />
    }
  ], [handleRescheduleToProjectStart, handleRescheduleToNextWorkingDay, handleRescheduleToDate]);



  const getBarStyleMenuItems = useCallback(() => 
    barStyleOptions.map(style => ({
      id: style.id,
      label: style.label,
      disabled: false,
      action: () => handleBarStyleSelect(style.id),
      icon: <span className="text-lg">{style.icon}</span>
    }))
  , [barStyleOptions, handleBarStyleSelect]);

  const handleBarStyleMenuClose = useCallback(() => {
    setShowBarStyleMenu(false);
  }, []);

  // Hierarchy functions
  const handlePromote = useCallback(() => {
    const selectedTasks = selectedTaskIds || [selectedTaskId].filter(Boolean);
    
    if (selectedTasks.length === 0) {
      console.info('No tasks selected for promotion');
      return;
    }
    
    // Emit HIERARCHY_PROMOTE event
    const event = new window.CustomEvent('HIERARCHY_PROMOTE', {
      detail: { selectedTasks }
    });
    document.dispatchEvent(event);
    
    console.info('Promote tasks:', { selectedTasks });
  }, [selectedTaskId, selectedTaskIds]);

  const handleDemote = useCallback(() => {
    const selectedTasks = selectedTaskIds || [selectedTaskId].filter(Boolean);
    
    if (selectedTasks.length === 0) {
      console.info('No tasks selected for demotion');
      return;
    }
    
    // Emit HIERARCHY_DEMOTE event
    const event = new window.CustomEvent('HIERARCHY_DEMOTE', {
      detail: { selectedTasks }
    });
    document.dispatchEvent(event);
    
    console.info('Demote tasks:', { selectedTasks });
  }, [selectedTaskId, selectedTaskIds]);

  const handleMakeSummary = useCallback(() => {
    const selectedTasks = selectedTaskIds || [selectedTaskId].filter(Boolean);
    
    if (selectedTasks.length === 0) {
      console.info('No tasks selected for summary creation');
      return;
    }
    
    // Emit HIERARCHY_MAKE_SUMMARY event
    const event = new window.CustomEvent('HIERARCHY_MAKE_SUMMARY', {
      detail: { 
        selectedTasks,
        insertAboveFirst: true // Insert summary above first selected task
      }
    });
    document.dispatchEvent(event);
    
    console.info('Make summary from selected tasks:', { selectedTasks });
  }, [selectedTaskId, selectedTaskIds]);

  const handleBreakSummary = useCallback(() => {
    const selectedTasks = selectedTaskIds || [selectedTaskId].filter(Boolean);
    
    if (selectedTasks.length === 0) {
      console.info('No tasks selected for summary breaking');
      return;
    }
    
    // For now, we'll assume the first selected task is the summary to break
    const summaryTask = selectedTasks[0];
    
    // Check if the task has notes or attributes that would be lost
    const hasNotes = tasks.find(t => t.id === summaryTask)?.notes;
    const hasAttributes = tasks.find(t => t.id === summaryTask)?.attributes;
    
    if (hasNotes || hasAttributes) {
      // Show confirmation dialog
      setBreakSummaryTask(summaryTask);
      setShowBreakSummaryDialog(true);
    } else {
      // Break summary immediately
      performBreakSummary(summaryTask);
    }
  }, [selectedTaskId, selectedTaskIds, tasks]);

  const performBreakSummary = useCallback((summaryTaskId) => {
    // Emit HIERARCHY_BREAK_SUMMARY event
    const event = new window.CustomEvent('HIERARCHY_BREAK_SUMMARY', {
      detail: { 
        summaryTaskId,
        liftChildren: true,
        deleteEmptyParent: true
      }
    });
    document.dispatchEvent(event);
    
    console.info('Break summary:', { summaryTaskId });
    setShowBreakSummaryDialog(false);
    setBreakSummaryTask(null);
  }, []);

  const handleBreakSummaryConfirm = useCallback(() => {
    if (breakSummaryTask) {
      performBreakSummary(breakSummaryTask);
    }
  }, [breakSummaryTask, performBreakSummary]);

  const handleBreakSummaryCancel = useCallback(() => {
    setShowBreakSummaryDialog(false);
    setBreakSummaryTask(null);
  }, []);

  // Helper function to check if selected task is a summary
  const isSelectedTaskSummary = useCallback(() => {
    const taskId = selectedTaskId || (selectedTaskIds && selectedTaskIds[0]);
    if (!taskId) return false;
    
    const task = tasks.find(t => t.id === taskId);
    return task && task.children && task.children.length > 0;
  }, [selectedTaskId, selectedTaskIds, tasks]);

  // Task conversion and assignment functions
  const handleMakeMilestone = useCallback(() => {
    const selectedTasks = selectedTaskIds || [selectedTaskId].filter(Boolean);
    
    if (selectedTasks.length === 0) {
      console.info('No tasks selected for milestone conversion');
      return;
    }
    
    // Emit TASK_CONVERT_TO_MILESTONE event
    const event = new window.CustomEvent('TASK_CONVERT_TO_MILESTONE', {
      detail: { selectedTasks }
    });
    document.dispatchEvent(event);
    
    console.info('Convert tasks to milestones:', { selectedTasks });
  }, [selectedTaskId, selectedTaskIds]);

  const handleMakeTask = useCallback(() => {
    const selectedTasks = selectedTaskIds || [selectedTaskId].filter(Boolean);
    
    if (selectedTasks.length === 0) {
      console.info('No tasks selected for task conversion');
      return;
    }
    
    // Emit TASK_CONVERT_TO_TASK event
    const event = new window.CustomEvent('TASK_CONVERT_TO_TASK', {
      detail: { selectedTasks }
    });
    document.dispatchEvent(event);
    
    console.info('Convert items to tasks:', { selectedTasks });
  }, [selectedTaskId, selectedTaskIds]);

  const handleAssignResource = useCallback(() => {
    const selectedTasks = selectedTaskIds || [selectedTaskId].filter(Boolean);
    
    if (selectedTasks.length === 0) {
      console.info('No tasks selected for resource assignment');
      return;
    }
    
    setShowAssignModal(true);
    setAssignResourceId('');
    setAssignResourceSearch('');
  }, [selectedTaskId, selectedTaskIds]);

  const handleAssignConfirm = useCallback(() => {
    const selectedTasks = selectedTaskIds || [selectedTaskId].filter(Boolean);
    
    if (!assignResourceId.trim()) {
      console.info('No resource selected for assignment');
      return;
    }
    
    // Emit TASK_ASSIGN_RESOURCE event
    const event = new window.CustomEvent('TASK_ASSIGN_RESOURCE', {
      detail: { 
        taskIds: selectedTasks,
        resourceId: assignResourceId.trim()
      }
    });
    document.dispatchEvent(event);
    
    console.info('Assign resource to tasks:', { 
      taskIds: selectedTasks, 
      resourceId: assignResourceId.trim() 
    });
    
    setShowAssignModal(false);
    setAssignResourceId('');
    setAssignResourceSearch('');
  }, [selectedTaskId, selectedTaskIds, assignResourceId]);

  const handleAssignCancel = useCallback(() => {
    setShowAssignModal(false);
    setAssignResourceId('');
    setAssignResourceSearch('');
  }, []);

  const handleAssignKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleAssignCancel();
    } else if (e.key === 'Enter') {
      handleAssignConfirm();
    }
  }, [handleAssignCancel, handleAssignConfirm]);

  // Mock resource data for assignment modal
  const mockResources = [
    { id: 'res-001', name: 'John Smith', type: 'Labour' },
    { id: 'res-002', name: 'Jane Doe', type: 'Labour' },
    { id: 'res-003', name: 'Excavator 1', type: 'Equipment' },
    { id: 'res-004', name: 'Concrete Mix', type: 'Material' },
    { id: 'res-005', name: 'Subcontractor A', type: 'Subcontractor' },
  ];

  const filteredResources = mockResources.filter(resource =>
    resource.name.toLowerCase().includes(assignResourceSearch.toLowerCase()) ||
    resource.type.toLowerCase().includes(assignResourceSearch.toLowerCase())
  );

  // Progress functions
  const handleSetProgressPercent = useCallback((percent) => {
    const selectedTasks = selectedTaskIds || [selectedTaskId].filter(Boolean);
    
    if (selectedTasks.length === 0) {
      console.info('No tasks selected for progress update');
      return;
    }
    
    setCurrentProgressPercent(percent);
    
    // Emit TASK_SET_PROGRESS event
    const event = new window.CustomEvent('TASK_SET_PROGRESS', {
      detail: { 
        taskIds: selectedTasks,
        progressPercent: percent
      }
    });
    document.dispatchEvent(event);
    
    console.info('Set progress for tasks:', { 
      taskIds: selectedTasks, 
      progressPercent: percent 
    });
  }, [selectedTaskId, selectedTaskIds]);

  const handleToggleProgressLine = useCallback(() => {
    // Call the toggle function from ViewContext
    toggleProgressLine();
  }, [toggleProgressLine]);

  const handleBarStyleMenuToggle = useCallback(() => {
    if (barStyleButtonRef.current) {
      const rect = barStyleButtonRef.current.getBoundingClientRect();
      setBarStyleMenuPosition({
        x: rect.left,
        y: rect.bottom + 4
      });
    }
    setShowBarStyleMenu(!showBarStyleMenu);
  }, [showBarStyleMenu]);

  const handleApplyLastColor = useCallback(() => {
    handleColorSelect(lastUsedColor);
  }, [handleColorSelect, lastUsedColor]);

  const handleApplyLastBarStyle = useCallback(() => {
    handleBarStyleSelect(lastUsedBarStyle);
  }, [handleBarStyleSelect, lastUsedBarStyle]);

  // Load last used styles from persistent storage on mount
  useEffect(() => {
    const loadSavedStyles = async () => {
      const savedColor = await getStorage('pm.style.last.color');
      const savedBarStyle = await getStorage('pm.style.last.barStyle');
      
      if (savedColor) {
        setLastUsedColor(savedColor);
      }
      if (savedBarStyle) {
        setLastUsedBarStyle(savedBarStyle);
      }
    };
    loadSavedStyles();
  }, []);

  // Print/Export handlers
  const handlePrint = useCallback(() => {
    setExportDialogMode('print');
    setShowExportDialog(true);
  }, []);

  const handleExportMenuToggle = useCallback(() => {
    if (exportButtonRef.current) {
      const rect = exportButtonRef.current.getBoundingClientRect();
      setExportMenuPosition({
        x: rect.left,
        y: rect.bottom + 4
      });
    }
    setShowExportMenu(!showExportMenu);
  }, [showExportMenu]);

  const handleExportMenuClose = useCallback(() => {
    setShowExportMenu(false);
  }, []);

  const handleExportOption = useCallback((option) => {
    setShowExportMenu(false);
    setExportDialogMode('export');
    setShowExportDialog(true);
    console.info(`Export option selected: ${option}`);
  }, []);

  const handleExportDialogClose = useCallback(() => {
    setShowExportDialog(false);
  }, []);

  const getExportMenuItems = useCallback(() => [
    {
      id: 'png',
      label: 'PNG (Timeline Only)',
      disabled: false,
      action: () => handleExportOption('PNG (Timeline Only)'),
      icon: <DocumentArrowDownIcon className="w-4 h-4" />
    },
    {
      id: 'pdf',
      label: 'PDF (Timeline + Grid)',
      disabled: false,
      action: () => handleExportOption('PDF (Timeline + Grid)'),
      icon: <DocumentArrowDownIcon className="w-4 h-4" />
    },
    {
      id: 'csv',
      label: 'CSV (Grid)',
      disabled: false,
      action: () => handleExportOption('CSV (Grid)'),
      icon: <DocumentArrowDownIcon className="w-4 h-4" />
    },
    {
      id: 'asta',
      label: 'Asta XML',
      disabled: false,
      action: () => handleExportOption('Asta XML'),
      icon: <DocumentArrowDownIcon className="w-4 h-4" />
    }
  ], [handleExportOption]);

  // Check if there's data to export
  const hasDataToExport = tasks && tasks.length > 0;

  // Status group state
  const [showBaselinesMenu, setShowBaselinesMenu] = useState(false);
  const [baselinesMenuPosition, setBaselinesMenuPosition] = useState({ x: 0, y: 0 });
  const baselinesButtonRef = useRef(null);

  // Editing group state
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showLinkPicker, setShowLinkPicker] = useState(false);

  // Status group handlers
  const handleCriticalPathToggle = useCallback(() => {
    // Emit VIEW_CRITICAL_PATH_TOGGLE event
    const event = new window.CustomEvent('VIEW_CRITICAL_PATH_TOGGLE', {
      detail: { 
        currentState: viewState.showCriticalPath 
      }
    });
    document.dispatchEvent(event);
    
    console.info('Critical Path toggle:', { 
      currentState: viewState.showCriticalPath 
    });
  }, [viewState.showCriticalPath]);

  const handleBaselinesMenuToggle = useCallback(() => {
    if (baselinesButtonRef.current) {
      const rect = baselinesButtonRef.current.getBoundingClientRect();
      setBaselinesMenuPosition({
        x: rect.left,
        y: rect.bottom + 4
      });
    }
    setShowBaselinesMenu(!showBaselinesMenu);
  }, [showBaselinesMenu]);

  const handleBaselinesMenuClose = useCallback(() => {
    setShowBaselinesMenu(false);
  }, []);

  const handleBaselineAction = useCallback((action) => {
    setShowBaselinesMenu(false);
    
    // Emit appropriate baseline event
    const event = new window.CustomEvent(action, {
      detail: { 
        action,
        hasTasks: hasDataToExport
      }
    });
    document.dispatchEvent(event);
    
    console.info(`Baseline action: ${action}`, { 
      hasTasks: hasDataToExport 
    });
  }, [hasDataToExport]);

  const getBaselinesMenuItems = useCallback(() => [
    {
      id: 'set',
      label: 'Set Baseline',
      disabled: !hasDataToExport,
      action: () => handleBaselineAction('BASELINE_SET'),
      icon: <ChartBarIcon className="w-4 h-4" />
    },
    {
      id: 'clear',
      label: 'Clear Baseline',
      disabled: !hasDataToExport,
      action: () => handleBaselineAction('BASELINE_CLEAR'),
      icon: <TrashIcon className="w-4 h-4" />
    },
    {
      id: 'show',
      label: 'Show Baselines',
      disabled: false,
      action: () => handleBaselineAction('BASELINE_SHOW_TOGGLE'),
      icon: <EyeIcon className="w-4 h-4" />
    },
    {
      id: 'manage',
      label: 'Manage...',
      disabled: false,
      action: () => handleBaselineAction('BASELINE_MANAGER_OPEN'),
      icon: <Cog6ToothIcon className="w-4 h-4" />
    }
  ], [handleBaselineAction, hasDataToExport]);

  // Editing group handlers
  const handleRename = useCallback(() => {
    // Emit TASK_RENAME_START event
    const event = new window.CustomEvent('TASK_RENAME_START', {
      detail: { 
        taskId: selectedTaskId,
        taskIds: selectedTaskIds
      }
    });
    document.dispatchEvent(event);
    
    console.info('Task rename started:', { 
      taskId: selectedTaskId,
      taskIds: selectedTaskIds
    });
  }, [selectedTaskId, selectedTaskIds]);

  const handleNoteOpen = useCallback(() => {
    setNoteText('');
    setShowNoteModal(true);
  }, []);

  const handleNoteSave = useCallback(() => {
    // Emit TASK_NOTE_SET event
    const event = new window.CustomEvent('TASK_NOTE_SET', {
      detail: { 
        taskId: selectedTaskId,
        taskIds: selectedTaskIds,
        note: noteText
      }
    });
    document.dispatchEvent(event);
    
    console.info('Task note set:', { 
      taskId: selectedTaskId,
      taskIds: selectedTaskIds,
      note: noteText
    });
  }, [selectedTaskId, selectedTaskIds, noteText]);

  const handleLinkOpen = useCallback(() => {
    if (!selectedTaskId && (!selectedTaskIds || selectedTaskIds.length !== 2)) {
      console.warn('Need exactly 2 tasks selected for linking');
      return;
    }
    setShowLinkPicker(true);
  }, [selectedTaskId, selectedTaskIds]);

  const handleLinkConfirm = useCallback((linkData) => {
    // Emit TASKS_LINK event
    const event = new window.CustomEvent('TASKS_LINK', {
      detail: linkData
    });
    document.dispatchEvent(event);
    
    console.info('Tasks linked:', linkData);
  }, []);

  const handleUnlink = useCallback(() => {
    // Emit TASKS_UNLINK_SELECTED event
    const event = new window.CustomEvent('TASKS_UNLINK_SELECTED', {
      detail: { 
        taskId: selectedTaskId,
        taskIds: selectedTaskIds
      }
    });
    document.dispatchEvent(event);
    
    console.info('Tasks unlink selected:', { 
      taskId: selectedTaskId,
      taskIds: selectedTaskIds
    });
  }, [selectedTaskId, selectedTaskIds]);

  // Check if exactly 2 tasks are selected for linking
  const canLink = selectedTaskIds && selectedTaskIds.length === 2;

  // Legacy Print and Export handlers (for existing PrintExportDialog)
  const handlePrintLegacy = async printSettings => {
    try {
      await printProject(printSettings, tasks, taskLinks, viewState);
    } catch (error) {
      console.error('Print error:', error);
      throw error;
    }
  };

  const handleExportLegacy = async exportSettings => {
    try {
      const filename = await exportProject(
        exportSettings,
        tasks,
        taskLinks,
        viewState
      );
      console.log('Export completed:', filename);
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  };

  return (
    <div className='flex flex-nowrap gap-0 p-0.5 w-full min-w-0'>
      {/* Clipboard Group */}
      <RibbonGroup title='Clipboard'>
        <RibbonButton
          icon={<ClipboardDocumentIcon className='w-4 h-4' />}
          label='Paste'
          onClick={() => console.log('Paste')}
          tooltip='Paste (Ctrl+V)'
        />
        <RibbonButton
          icon={<ScissorsIcon className='w-4 h-4' />}
          label='Cut'
          onClick={() => console.log('Cut')}
          tooltip='Cut (Ctrl+X)'
        />
        <RibbonButton
          icon={<DocumentDuplicateIcon className='w-4 h-4' />}
          label='Copy'
          onClick={() => console.log('Copy')}
          tooltip='Copy (Ctrl+C)'
        />
      </RibbonGroup>

      {/* History Group */}
      <RibbonGroup title='History'>
        <RibbonButton
          icon={<ArrowUturnLeftIcon className='w-4 h-4' />}
          label='Undo'
          onClick={undo}
          tooltip='Undo (Ctrl+Z)'
          disabled={!canUndo}
        />
        <RibbonButton
          icon={<ArrowUturnRightIcon className='w-4 h-4' />}
          label='Redo'
          onClick={redo}
          tooltip='Redo (Ctrl+Y)'
          disabled={!canRedo}
        />
        <RibbonButton
          ref={historyButtonRef}
          icon={<ChevronDownIcon className='w-4 h-4' />}
          label=''
          onClick={handleHistoryMenuToggle}
          tooltip='History menu'
          compact={true}
          disabled={undoStack.length === 0 && redoStack.length === 0}
        />
      </RibbonGroup>

      {/* Font Group */}
      <RibbonGroup title='Font'>
        <RibbonButton
          icon={<BoldIcon className='w-4 h-4' />}
          label='Bold'
          onClick={handleBoldToggle}
          tooltip='Bold (Ctrl+B)'
          active={fontFormat.bold}
        />
        <RibbonButton
          icon={<ItalicIcon className='w-4 h-4' />}
          label='Italic'
          onClick={handleItalicToggle}
          tooltip='Italic (Ctrl+I)'
          active={fontFormat.italic}
        />
        <RibbonButton
          icon={<PaintBrushIcon className='w-4 h-4' />}
          label='Text Colour'
          onClick={() => handleTextColorApply(lastTextColor)}
          tooltip='Apply last text colour'
          menuItems={getColorMenuItems()}
          onMenuSelect={(item) => item.action()}
          ref={colorButtonRef}
        />
        <RibbonButton
          ref={rowHeightButtonRef}
          icon={<ArrowsPointingOutIcon className='w-4 h-4' />}
          label='Row Height'
          onClick={handleRowHeightMenuToggle}
          tooltip='Set grid row height'
          menuItems={getRowHeightMenuItems()}
          onMenuSelect={(item) => item.action()}
        />
      </RibbonGroup>

      {/* Schedule Group */}
      <RibbonGroup title='Schedule'>
        <RibbonButton
          icon={<FlagIcon className='w-4 h-4' />}
          label='Constraint Flag'
          onClick={handleConstraintFlagToggle}
          tooltip='Toggle constraint flag on selected tasks'
          active={constraintFlagActive}
          disabled={!selectedTaskId && (!selectedTaskIds || selectedTaskIds.length === 0)}
        />
        <RibbonButton
          icon={<LinkIcon className='w-4 h-4' />}
          label='Delete Links'
          onClick={handleDeleteLinks}
          tooltip='Delete links between selected tasks (FS/SS/FF/SF)'
          disabled={!selectedTaskId && (!selectedTaskIds || selectedTaskIds.length === 0)}
        />
        <RibbonButton
          ref={rescheduleButtonRef}
          icon={<ArrowPathIcon className='w-4 h-4' />}
          label='Reschedule'
          onClick={handleRescheduleMenuToggle}
          tooltip='Reschedule selected tasks'
          menuItems={getRescheduleMenuItems()}
          onMenuSelect={(item) => item.action()}
          disabled={!selectedTaskId && (!selectedTaskIds || selectedTaskIds.length === 0)}
        />
      </RibbonGroup>

      {/* Hierarchy Group */}
      <RibbonGroup title='Hierarchy'>
        <RibbonButton
          icon={<DocumentArrowUpIcon className='w-4 h-4' />}
          label='Promote'
          onClick={handlePromote}
          tooltip='Promote selected tasks (Outdent)'
          disabled={!selectedTaskId && (!selectedTaskIds || selectedTaskIds.length === 0)}
        />
        <RibbonButton
          icon={<DocumentArrowDownIcon className='w-4 h-4' />}
          label='Demote'
          onClick={handleDemote}
          tooltip='Demote selected tasks (Indent)'
          disabled={!selectedTaskId && (!selectedTaskIds || selectedTaskIds.length === 0)}
        />
        <RibbonButton
          icon={<ChartBarIcon className='w-4 h-4' />}
          label='Make Summary'
          onClick={handleMakeSummary}
          tooltip='Create summary task above selected tasks'
          disabled={!selectedTaskId && (!selectedTaskIds || selectedTaskIds.length === 0)}
        />
        <RibbonButton
          icon={<FolderIcon className='w-4 h-4' />}
          label='Break Summary'
          onClick={handleBreakSummary}
          tooltip='Break summary task and lift children up'
          disabled={!isSelectedTaskSummary()}
        />
        <RibbonButton
          icon={
            isAllExpanded ? (
              <ChevronRightIcon className='w-4 h-4' />
            ) : (
              <ChevronDoubleDownIcon className='w-4 h-4' />
            )
          }
          label='Expand/Collapse All'
          onClick={handleExpandCollapseToggle}
          tooltip={
            isAllExpanded
              ? 'Collapse all groups and tasks in the tree'
              : 'Expand all groups and tasks in the tree'
          }
          className={isAllExpanded ? 'bg-blue-50 border-blue-500' : ''}
        />
        <RibbonButton
          icon={<FlagIcon className='w-4 h-4' />}
          label='Expand Milestones'
          onClick={expandMilestones}
          tooltip='Expand all milestone tasks in the programme tree'
        />
        <RibbonDropdown
          icon={<ChevronDoubleDownIcon className='w-4 h-4' />}
          label='Show To Level'
          options={[
            { value: 'level1', label: 'Level 1' },
            { value: 'level2', label: 'Level 2' },
            { value: 'level3', label: 'Level 3' },
            { value: 'all', label: 'All Levels' },
          ]}
          onSelect={option => console.log('Show To Level:', option.value)}
          tooltip='Choose task levels to display in the chart/tree'
        />
      </RibbonGroup>

      {/* Task Group */}
      <RibbonGroup title='Task'>
        <RibbonButton
          icon={<FlagIcon className='w-4 h-4' />}
          label='Make Milestone'
          onClick={handleMakeMilestone}
          tooltip='Convert selected tasks to milestones'
          disabled={!selectedTaskId && (!selectedTaskIds || selectedTaskIds.length === 0)}
        />
        <RibbonButton
          icon={<ChartBarIcon className='w-4 h-4' />}
          label='Make Task'
          onClick={handleMakeTask}
          tooltip='Convert selected items to tasks'
          disabled={!selectedTaskId && (!selectedTaskIds || selectedTaskIds.length === 0)}
        />
        <RibbonButton
          icon={<UserIcon className='w-4 h-4' />}
          label='Assign...'
          onClick={handleAssignResource}
          tooltip='Assign resource to selected tasks'
          disabled={!selectedTaskId && (!selectedTaskIds || selectedTaskIds.length === 0)}
        />
        <RibbonButton
          icon={<TrashIcon className='w-4 h-4' />}
          label='Delete Task'
          onClick={handleDeleteTask}
          tooltip='Delete the selected task and its children'
          disabled={!selectedTaskId}
        />
        <RibbonButton
          icon={<ScissorsIcon className='w-4 h-4' />}
          label='Split/Join'
          onClick={() => console.log('Split/Join clicked')}
          tooltip='Split the task into parts or merge selected tasks'
        />
      </RibbonGroup>

      {/* Insert Group */}
      <RibbonGroup title='Insert'>
        <RibbonButton
          icon={<PlusIcon className='w-4 h-4' />}
          label='Insert Task Below'
          onClick={handleInsertTaskBelow}
          tooltip='Insert a new task below the selected task'
        />
        <RibbonButton
          icon={<FlagIcon className='w-4 h-4' />}
          label='Add Milestone'
          onClick={addMilestone}
          tooltip='Add a milestone task'
        />
        <RibbonButton
          icon={<ChartBarIcon className='w-4 h-4' />}
          label='Insert Summary Task'
          onClick={handleInsertSummaryTask}
          tooltip='Insert a summary task and group selected tasks under it'
        />
        <RibbonButton
          icon={<ChartBarIcon className='w-4 h-4' />}
          label='Hammock Task'
          onClick={() => console.log('Insert Hammock Task clicked')}
          tooltip='Insert a hammock task'
        />
        <RibbonButton
          icon={<LinkIcon className='w-4 h-4' />}
          label='External Link'
          onClick={() => console.log('Insert External Link clicked')}
          tooltip='Link to external project/task'
        />
      </RibbonGroup>

      {/* Progress Group */}
      <RibbonGroup title='Progress'>
        {/* Progress Line Toggle */}
        <RibbonButton
          icon={<ChartBarIcon className='w-4 h-4' />}
          label='Progress Line'
          onClick={handleToggleProgressLine}
          tooltip='Show or hide the progress line'
          active={viewState.showProgressLine}
        />
        
        {/* Progress Percentage Presets */}
        <div className='flex gap-1'>
          <button
            className={`progress-preset-button ${currentProgressPercent === 0 ? 'active' : ''}`}
            onClick={() => handleSetProgressPercent(0)}
            disabled={!selectedTaskId && (!selectedTaskIds || selectedTaskIds.length === 0)}
            title='Set selected tasks to 0% complete'
          >
            0%
          </button>
          <button
            className={`progress-preset-button ${currentProgressPercent === 25 ? 'active' : ''}`}
            onClick={() => handleSetProgressPercent(25)}
            disabled={!selectedTaskId && (!selectedTaskIds || selectedTaskIds.length === 0)}
            title='Set selected tasks to 25% complete'
          >
            25%
          </button>
          <button
            className={`progress-preset-button ${currentProgressPercent === 50 ? 'active' : ''}`}
            onClick={() => handleSetProgressPercent(50)}
            disabled={!selectedTaskId && (!selectedTaskIds || selectedTaskIds.length === 0)}
            title='Set selected tasks to 50% complete'
          >
            50%
          </button>
          <button
            className={`progress-preset-button ${currentProgressPercent === 75 ? 'active' : ''}`}
            onClick={() => handleSetProgressPercent(75)}
            disabled={!selectedTaskId && (!selectedTaskIds || selectedTaskIds.length === 0)}
            title='Set selected tasks to 75% complete'
          >
            75%
          </button>
          <button
            className={`progress-preset-button ${currentProgressPercent === 100 ? 'active' : ''}`}
            onClick={() => handleSetProgressPercent(100)}
            disabled={!selectedTaskId && (!selectedTaskIds || selectedTaskIds.length === 0)}
            title='Set selected tasks to 100% complete'
          >
            100%
          </button>
        </div>
        
        <RibbonButton
          icon={<DocumentTextIcon className='w-4 h-4' />}
          label='Set Status'
          onClick={() => console.log('Set Task Status clicked')}
          tooltip='Manually update task progress'
        />
      </RibbonGroup>

      {/* Appearance Group */}
      <RibbonGroup title='Appearance'>
        {/* Colour Split Button */}
        <div className="relative" ref={colorButtonRef}>
          <RibbonButton
            icon={<PaintBrushIcon className='w-4 h-4' />}
            label='Colour'
            onClick={handleApplyLastColor}
            tooltip={`Apply last used color (${lastUsedColor})`}
            disabled={!selectedTaskId && (!selectedTaskIds || selectedTaskIds.length === 0)}
            className="split"
          />
          <RibbonButton
            icon={<ChevronDownIcon className='w-3 h-3' />}
            label=""
            onClick={handleColorMenuToggle}
            tooltip="Choose color from palette"
            disabled={!selectedTaskId && (!selectedTaskIds || selectedTaskIds.length === 0)}
            className="split-caret"
          />
        </div>
        
        {/* Bar Style Split Button */}
        <div className="relative" ref={barStyleButtonRef}>
          <RibbonButton
            icon={<Squares2X2Icon className='w-4 h-4' />}
            label='Bar Style'
            onClick={handleApplyLastBarStyle}
            tooltip={`Apply last used style (${lastUsedBarStyle})`}
            disabled={!selectedTaskId && (!selectedTaskIds || selectedTaskIds.length === 0)}
            className="split"
          />
          <RibbonButton
            icon={<ChevronDownIcon className='w-3 h-3' />}
            label=""
            onClick={handleBarStyleMenuToggle}
            tooltip="Choose bar style"
            disabled={!selectedTaskId && (!selectedTaskIds || selectedTaskIds.length === 0)}
            className="split-caret"
          />
        </div>
        
        <RibbonButton
          icon={<PencilIcon className='w-4 h-4' />}
          label='Bar Text'
          onClick={() => console.log('Edit Bar Text clicked')}
          tooltip='Modify bar text fields'
        />
      </RibbonGroup>

      {/* Print/Export Group */}
      <RibbonGroup title='Print/Export'>
        <RibbonButton
          icon={<PrinterIcon className='w-4 h-4' />}
          label='Print'
          onClick={handlePrint}
          tooltip='Print project schedule with advanced options'
          disabled={!hasDataToExport}
        />
        
        {/* Export Split Button */}
        <div className="relative" ref={exportButtonRef}>
          <RibbonButton
            icon={<DocumentArrowDownIcon className='w-4 h-4' />}
            label='Export'
            onClick={handleExportMenuToggle}
            tooltip='Export to various formats'
            disabled={!hasDataToExport}
            className="split"
          />
          <RibbonButton
            icon={<ChevronDownIcon className='w-3 h-3' />}
            label=""
            onClick={handleExportMenuToggle}
            tooltip="Choose export format"
            disabled={!hasDataToExport}
            className="split-caret"
          />
        </div>
      </RibbonGroup>

      {/* Status Group */}
      <RibbonGroup title='Status'>
        <RibbonButton
          icon={<ExclamationTriangleIcon className='w-4 h-4' />}
          label='Show Critical Path'
          onClick={handleCriticalPathToggle}
          tooltip="Toggle visibility of the project's critical path"
          active={viewState.showCriticalPath}
        />
        
        {/* Baselines Split Button */}
        <div className="relative" ref={baselinesButtonRef}>
          <RibbonButton
            icon={<ChartBarIcon className='w-4 h-4' />}
            label='Baselines'
            onClick={handleBaselinesMenuToggle}
            tooltip='Set or compare project baselines'
            className="split"
          />
          <RibbonButton
            icon={<ChevronDownIcon className='w-3 h-3' />}
            label=""
            onClick={handleBaselinesMenuToggle}
            tooltip="Choose baseline action"
            className="split-caret"
          />
        </div>
        
        <RibbonButton
          icon={<LinkIcon className='w-4 h-4' />}
          label='Constraints'
          onClick={() => console.log('Apply Constraints clicked')}
          tooltip='Add or manage task constraints'
        />
      </RibbonGroup>

      {/* Zoom Group */}
      <RibbonGroup title='Zoom'>
        <RibbonButton
          icon={<MagnifyingGlassPlusIcon className='w-4 h-4' />}
          label='Zoom In'
          onClick={zoomIn}
          tooltip='Zoom into the Gantt chart'
        />
        <RibbonButton
          icon={<MagnifyingGlassMinusIcon className='w-4 h-4' />}
          label='Zoom Out'
          onClick={zoomOut}
          tooltip='Zoom out of the Gantt chart'
        />
        <RibbonButton
          icon={<RectangleStackIcon className='w-4 h-4' />}
          label='Fit to View'
          onClick={zoomToFit}
          tooltip='Fit all tasks in view'
        />
        <RibbonButton
          icon={<ClockIcon className='w-4 h-4' />}
          label='Go to Today'
          onClick={goToToday}
          tooltip="Scroll Gantt to today's date"
        />
      </RibbonGroup>

      {/* Editing Group */}
      <RibbonGroup title='Editing'>
        <RibbonButton
          icon={<PencilIcon className='w-4 h-4' />}
          label='Rename'
          onClick={handleRename}
          tooltip='Rename selected task'
          disabled={!selectedTaskId && (!selectedTaskIds || selectedTaskIds.length === 0)}
        />
        <RibbonButton
          icon={<ChatBubbleLeftRightIcon className='w-4 h-4' />}
          label='Note…'
          onClick={handleNoteOpen}
          tooltip='Add or edit task note'
          disabled={!selectedTaskId && (!selectedTaskIds || selectedTaskIds.length === 0)}
        />
        <RibbonButton
          icon={<LinkIconSolid className='w-4 h-4' />}
          label='Link'
          onClick={handleLinkOpen}
          tooltip='Link selected tasks (select exactly 2)'
          disabled={!canLink}
        />
        <RibbonButton
          icon={<LinkIcon className='w-4 h-4' />}
          label='Unlink'
          onClick={handleUnlink}
          tooltip='Remove links from selected tasks'
          disabled={!selectedTaskId && (!selectedTaskIds || selectedTaskIds.length === 0)}
        />
      </RibbonGroup>

      {/* Project Status Group */}
      <RibbonGroup title='Project Status'>
        <div className='flex items-center px-3 py-2 bg-gray-50 rounded border border-gray-200'>
          <span className='text-xs text-gray-600 font-medium'>
            📅 Start: {formatProjectDate(getProjectDates().startDate)} | End:{' '}
            {formatProjectDate(getProjectDates().endDate)}
          </span>
        </div>
      </RibbonGroup>

      {/* History Menu */}
      {showHistoryMenu && (
        <RibbonMenu
          items={getRecentActions()}
          onSelect={(item) => item.action()}
          onClose={handleHistoryMenuClose}
          position={historyMenuPosition}
          parentRef={historyButtonRef}
        />
      )}

      {/* Color Menu */}
      {showColorMenu && (
        <RibbonMenu
          items={getAppearanceColorMenuItems()}
          onSelect={(item) => item.action()}
          onClose={handleColorMenuClose}
          position={colorMenuPosition}
          parentRef={colorButtonRef}
        />
      )}

      {/* Row Height Menu */}
      {showRowHeightMenu && (
        <RibbonMenu
          items={getRowHeightMenuItems()}
          onSelect={(item) => item.action()}
          onClose={handleRowHeightMenuClose}
          position={rowHeightMenuPosition}
          parentRef={rowHeightButtonRef}
        />
      )}

      {/* Reschedule Menu */}
      {showRescheduleMenu && (
        <RibbonMenu
          items={getRescheduleMenuItems()}
          onSelect={(item) => item.action()}
          onClose={handleRescheduleMenuClose}
          position={rescheduleMenuPosition}
          parentRef={rescheduleButtonRef}
        />
      )}

      {/* Break Summary Confirmation Dialog */}
      {showBreakSummaryDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Break Summary Task
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This summary task has notes or attributes that will be lost when breaking the summary. 
              Are you sure you want to continue?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleBreakSummaryCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBreakSummaryConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Break Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Resource Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Assign Resource
            </h3>
            
            {/* Search Input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search resources..."
                value={assignResourceSearch}
                onChange={(e) => setAssignResourceSearch(e.target.value)}
                onKeyDown={handleAssignKeyDown}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            
            {/* Resource List */}
            <div className="max-h-48 overflow-y-auto mb-4 border border-gray-200 dark:border-gray-600 rounded-md">
              {filteredResources.length > 0 ? (
                filteredResources.map((resource) => (
                  <div
                    key={resource.id}
                    onClick={() => setAssignResourceId(resource.id)}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      assignResourceId === resource.id ? 'bg-blue-100 dark:bg-blue-900' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {resource.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {resource.type}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
                  No resources found
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleAssignCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignConfirm}
                disabled={!assignResourceId}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Baselines Menu */}
      {showBaselinesMenu && (
        <RibbonMenu
          items={getBaselinesMenuItems()}
          onSelect={(item) => item.action()}
          onClose={handleBaselinesMenuClose}
          position={baselinesMenuPosition}
          parentRef={baselinesButtonRef}
        />
      )}

      {/* Note Modal */}
      <MiniModal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        title="Task Note"
        onSave={handleNoteSave}
        saveLabel="Save Note"
      >
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Enter task note..."
          className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          autoFocus
        />
      </MiniModal>

      {/* Link Picker */}
      <LinkPicker
        isOpen={showLinkPicker}
        onClose={() => setShowLinkPicker(false)}
        onConfirm={handleLinkConfirm}
        sourceTaskId={selectedTaskIds?.[0]}
        targetTaskId={selectedTaskIds?.[1]}
      />

      {/* Color Menu */}
      {showColorMenu && (
        <RibbonMenu
          items={getColorMenuItems()}
          onSelect={(item) => item.action()}
          onClose={handleColorMenuClose}
          position={colorMenuPosition}
          parentRef={colorButtonRef}
        />
      )}

      {/* Bar Style Menu */}
      {showBarStyleMenu && (
        <RibbonMenu
          items={getBarStyleMenuItems()}
          onSelect={(item) => item.action()}
          onClose={handleBarStyleMenuClose}
          position={barStyleMenuPosition}
          parentRef={barStyleButtonRef}
        />
      )}

      {/* Export Menu */}
      {showExportMenu && (
        <RibbonMenu
          items={getExportMenuItems()}
          onSelect={(item) => item.action()}
          onClose={handleExportMenuClose}
          position={exportMenuPosition}
          parentRef={exportButtonRef}
        />
      )}

      {/* Export Dialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={handleExportDialogClose}
        mode={exportDialogMode}
      />

      {/* Print/Export Dialog */}
      <PrintExportDialog
        isOpen={showPrintExportDialog}
        onClose={() => setShowPrintExportDialog(false)}
        onPrint={handlePrintLegacy}
        onExport={handleExportLegacy}
      />
    </div>
  );
}
