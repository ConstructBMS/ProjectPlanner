// No React imports needed for this component
import useTaskManager from '../../../hooks/useTaskManager';
import { useTaskContext } from '../../../context/TaskContext';
import { useViewContext } from '../../../context/ViewContext';
import RibbonButton from '../shared/RibbonButton';
import RibbonGroup from '../shared/RibbonGroup';
import RibbonDropdown from '../shared/RibbonDropdown';

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
  CodeBracketIcon,
  ExclamationTriangleIcon,
  ChartBarSquareIcon,
  CheckIcon,
  Square3Stack3DIcon,
  SwatchIcon,
  PencilIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  RectangleStackIcon,
  ClockIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  TrashIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';

export default function HomeTab({ onExpandAll, onCollapseAll }) {
  const {
    addMilestone,
    insertTaskBelow,
    insertSummaryTask,
    deleteTask,
    linkTasks,
    openTaskNotes,
    addCode,
    undo,
    redo,
    undoStack,
    redoStack,
  } = useTaskManager();

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
  const { expandMilestones, getVisibleTasks } = useTaskContext();

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
          disabled={undoStack.length === 0}
        />
        <RibbonButton
          icon={<ArrowUturnRightIcon className='w-4 h-4' />}
          label='Redo'
          onClick={redo}
          tooltip='Redo (Ctrl+Y)'
          disabled={redoStack.length === 0}
        />
      </RibbonGroup>

      {/* Font Group */}
      <RibbonGroup title='Font'>
        <RibbonButton
          icon={<BoldIcon className='w-4 h-4' />}
          label='Bold'
          onClick={() => console.log('Bold')}
          tooltip='Bold (Ctrl+B)'
        />
        <RibbonButton
          icon={<ItalicIcon className='w-4 h-4' />}
          label='Italic'
          onClick={() => console.log('Italic')}
          tooltip='Italic (Ctrl+I)'
        />
        <RibbonButton
          icon={<UnderlineIcon className='w-4 h-4' />}
          label='Underline'
          onClick={() => console.log('Underline')}
          tooltip='Underline (Ctrl+U)'
        />
      </RibbonGroup>

      {/* Schedule Group */}
      <RibbonGroup title='Schedule'>
        <RibbonButton
          icon={<FlagIcon className='w-4 h-4' />}
          label='Constraint Flag'
          onClick={() => console.log('Constraint Flag')}
          tooltip='Add constraint flag'
        />
        <RibbonButton
          icon={<LinkIcon className='w-4 h-4' />}
          label='Add/Delete Links'
          onClick={linkTasks}
          tooltip='Add or delete task links'
        />
        <RibbonButton
          icon={<ArrowPathIcon className='w-4 h-4' />}
          label='Auto Reschedule'
          onClick={() => console.log('Auto Reschedule')}
          tooltip='Auto reschedule tasks'
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
          icon={<ChevronDoubleDownIcon className='w-4 h-4' />}
          label='Expand All'
          onClick={onExpandAll}
          tooltip='Expand all groups and tasks in the tree'
        />
        <RibbonButton
          icon={<ChevronRightIcon className='w-4 h-4' />}
          label='Collapse All'
          onClick={onCollapseAll}
          tooltip='Collapse all groups and tasks in the tree'
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
          icon={<ChartBarSquareIcon className='w-4 h-4' />}
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
          icon={<Square3Stack3DIcon className='w-4 h-4' />}
          label='Bar Style'
          onClick={() => console.log('Change Bar Style clicked')}
          tooltip='Change the visual bar style of selected tasks'
        />
        <RibbonButton
          icon={<SwatchIcon className='w-4 h-4' />}
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
          tooltip='Scroll Gantt to today\'s date'
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
            icon={<CodeBracketIcon className='w-4 h-4' />}
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
    </div>
  );
}
