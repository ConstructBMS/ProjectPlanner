import { useState, useCallback, useRef } from 'react';
import useTaskManager from '../../../hooks/useTaskManager';
import { useTaskContext } from '../../../context/TaskContext';
import { useViewContext } from '../../../context/ViewContext';
import { useUndoRedoContext } from '../../../context/UndoRedoContext';
import RibbonButton from '../shared/RibbonButton';
import RibbonGroup from '../shared/RibbonGroup';
import RibbonDropdown from '../shared/RibbonDropdown';
import RibbonMenu from '../RibbonMenu';
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
  UnderlineIcon,
  FlagIcon,
  LinkIcon,
  ArrowPathIcon,
  FolderIcon,
  ChevronDoubleDownIcon,
  ChevronRightIcon,
  WrenchScrewdriverIcon,
  UserIcon,
  PlusIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CodeBracketSquareIcon,
  ExclamationTriangleIcon,
  CheckIcon,
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

  const {
    addMilestone,
    insertTaskBelow,
    insertSummaryTask,
    deleteTask,
    openTaskNotes,
    addCode,
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
    toggleCriticalPath,
  } = useViewContext();

  // Get expand milestones function and tasks from task context
  const { expandMilestones, getVisibleTasks, tasks, taskLinks } =
    useTaskContext();

  const handleTaskDetailsClick = () => {
    console.log('Task details clicked');
  };

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

  // Print and Export handlers
  const handlePrint = async printSettings => {
    try {
      await printProject(printSettings, tasks, taskLinks, viewState);
    } catch (error) {
      console.error('Print error:', error);
      throw error;
    }
  };

  const handleExport = async exportSettings => {
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
          icon={<FolderIcon className='w-4 h-4' />}
          label='Move Bars'
          onClick={() => console.log('Move Bars clicked')}
          tooltip='Move bars into the main chart area'
        />
        <RibbonButton
          icon={<ChartBarIcon className='w-4 h-4' />}
          label='Summarise'
          onClick={() => console.log('Summarise clicked')}
          tooltip='Create summary tasks from selected items'
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
          icon={<PlusIcon className='w-4 h-4' />}
          label='Make Into'
          onClick={() => console.log('Make Into clicked')}
          tooltip='Convert selected item into another type (task, milestone, etc.)'
        />
        <RibbonButton
          icon={<UserIcon className='w-4 h-4' />}
          label='Assign'
          onClick={() => console.log('Assign clicked')}
          tooltip='Assign a resource, person, or role to this task'
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
        <RibbonButton
          icon={<ChartBarIcon className='w-4 h-4' />}
          label='Progress Line'
          onClick={() => console.log('Toggle Progress Line clicked')}
          tooltip='Show or hide the progress line'
        />
        <RibbonButton
          icon={<CheckIcon className='w-4 h-4' />}
          label='Mark % Complete'
          onClick={() => console.log('Mark % Complete clicked')}
          tooltip='Mark selected tasks as 100% complete'
        />
        <RibbonButton
          icon={<DocumentTextIcon className='w-4 h-4' />}
          label='Set Status'
          onClick={() => console.log('Set Task Status clicked')}
          tooltip='Manually update task progress'
        />
      </RibbonGroup>

      {/* Appearance Group */}
      <RibbonGroup title='Appearance'>
        <RibbonButton
          icon={<Squares2X2Icon className='w-4 h-4' />}
          label='Bar Style'
          onClick={() => console.log('Change Bar Style clicked')}
          tooltip='Change the visual bar style of selected tasks'
        />
        <RibbonButton
          icon={<PaintBrushIcon className='w-4 h-4' />}
          label='Colour'
          onClick={() => console.log('Change Colour clicked')}
          tooltip='Change colour of selected task bars'
        />
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
          onClick={() => setShowPrintExportDialog(true)}
          tooltip='Print project schedule with advanced options'
        />
        <RibbonButton
          icon={<DocumentArrowDownIcon className='w-4 h-4' />}
          label='Export'
          onClick={() => setShowPrintExportDialog(true)}
          tooltip='Export to PDF, PNG, or Excel'
        />
      </RibbonGroup>

      {/* Status Group */}
      <RibbonGroup title='Status'>
        <RibbonButton
          icon={<ExclamationTriangleIcon className='w-4 h-4' />}
          label='Show Critical Path'
          onClick={toggleCriticalPath}
          tooltip="Toggle visibility of the project's critical path"
          className={
            viewState.showCriticalPath ? 'bg-blue-50 border-blue-500' : ''
          }
        />
        <RibbonButton
          icon={<ChartBarIcon className='w-4 h-4' />}
          label='Baselines'
          onClick={() => console.log('Manage Baselines clicked')}
          tooltip='Set or compare project baselines'
        />
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

      {/* Editing Group - Asta-style 3x3 grid layout (no labels) */}
      <RibbonGroup title='Editing'>
        <div className='grid grid-cols-3 gap-0.5'>
          <RibbonButton
            icon={<WrenchScrewdriverIcon className='w-4 h-4' />}
            onClick={handleTaskDetailsClick}
            tooltip='Task Details'
            compact={true}
          />
          <RibbonButton
            icon={<DocumentTextIcon className='w-4 h-4' />}
            onClick={openTaskNotes}
            tooltip='Task Notes'
            compact={true}
          />
          <RibbonButton
            icon={<CodeBracketSquareIcon className='w-4 h-4' />}
            onClick={addCode}
            tooltip='Code Library'
            compact={true}
          />
          <RibbonButton
            icon={<PencilIcon className='w-4 h-4' />}
            onClick={() => console.log('Edit clicked')}
            tooltip='Edit'
            compact={true}
          />
          <RibbonButton
            icon={<ClipboardDocumentIcon className='w-4 h-4' />}
            onClick={() => console.log('Properties clicked')}
            tooltip='Properties'
            compact={true}
          />
          <RibbonButton
            icon={<MagnifyingGlassPlusIcon className='w-4 h-4' />}
            onClick={() => console.log('Find clicked')}
            tooltip='Find'
            compact={true}
          />
          <RibbonButton
            icon={<BoldIcon className='w-4 h-4' />}
            onClick={() => console.log('Bold clicked')}
            tooltip='Bold'
            compact={true}
          />
          <RibbonButton
            icon={<ItalicIcon className='w-4 h-4' />}
            onClick={() => console.log('Italic clicked')}
            tooltip='Italic'
            compact={true}
          />
          <RibbonButton
            icon={<UnderlineIcon className='w-4 h-4' />}
            onClick={() => console.log('Underline clicked')}
            tooltip='Underline'
            compact={true}
          />
        </div>
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
          items={getColorMenuItems()}
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

      {/* Print/Export Dialog */}
      <PrintExportDialog
        isOpen={showPrintExportDialog}
        onClose={() => setShowPrintExportDialog(false)}
        onPrint={handlePrint}
        onExport={handleExport}
      />
    </div>
  );
}
