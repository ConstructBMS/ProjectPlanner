import React, { useState } from 'react';
import useTaskManager from '../../../hooks/useTaskManager';
import RibbonButton from '../shared/RibbonButton';
import RibbonGroup from '../shared/RibbonGroup';
import RibbonDropdown from '../shared/RibbonDropdown';
import RibbonToggle from '../shared/RibbonToggle';
import {
  ClipboardDocumentIcon,
  DocumentDuplicateIcon,
  ScissorsIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ChevronDownIcon,
  FlagIcon,
  LinkIcon,
  ArrowPathIcon,
  FolderIcon,
  ChevronDoubleDownIcon,
  WrenchScrewdriverIcon,
  UserIcon,
  PlusIcon,
  ChartBarIcon,
  DocumentTextIcon,
  EyeIcon,
  EyeSlashIcon,
  CodeBracketIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
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
} from '@heroicons/react/24/outline';

export default function HomeTab() {
  const {
    addTask,
    deleteTask,
    linkTasks,
    ungroup,
    createGroup,
    selectAll,
    openTaskDetails,
    openTaskNotes,
    addCode,
  } = useTaskManager();

  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [isCriticalPathActive, setIsCriticalPathActive] = useState(false);
  const [isShowBaselinesActive, setIsShowBaselinesActive] = useState(false);

  const handleTaskDetailsClick = () => {
    setIsTaskDetailModalOpen(true);
  };

  return (
    <div className='flex flex-nowrap gap-0 p-2 bg-white w-full min-w-0'>
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
          icon={<ScissorsIcon className='w-4 h-4' />}
          label='Split/Join'
          onClick={() => console.log('Split/Join clicked')}
          tooltip='Split the task into parts or merge selected tasks'
        />
      </RibbonGroup>

      {/* Insert Group */}
      <RibbonGroup title='Insert'>
        <RibbonButton
          icon={<FlagIcon className='w-4 h-4' />}
          label='Milestone'
          onClick={() => console.log('Insert Milestone clicked')}
          tooltip='Insert a new milestone task'
        />
        <RibbonButton
          icon={<ChartBarIcon className='w-4 h-4' />}
          label='Summary Bar'
          onClick={() => console.log('Insert Summary Task clicked')}
          tooltip='Insert a summary task'
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
          label='Critical Path'
          onClick={() => console.log('Toggle Critical Path clicked')}
          tooltip="Toggle visibility of the project's critical path"
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
          onClick={() => console.log('Zoom In clicked')}
          tooltip='Zoom into the Gantt chart'
        />
        <RibbonButton
          icon={<MagnifyingGlassMinusIcon className='w-4 h-4' />}
          label='Zoom Out'
          onClick={() => console.log('Zoom Out clicked')}
          tooltip='Zoom out of the Gantt chart'
        />
        <RibbonButton
          icon={<RectangleStackIcon className='w-4 h-4' />}
          label='Fit to View'
          onClick={() => console.log('Fit to View clicked')}
          tooltip='Fit all tasks in view'
        />
        <RibbonButton
          icon={<ClockIcon className='w-4 h-4' />}
          label='Scroll to Time'
          onClick={() => console.log('Scroll to Current Time clicked')}
          tooltip='Scroll to current time'
        />
      </RibbonGroup>

      {/* Editing Group */}
      <RibbonGroup title='Editing'>
        <RibbonButton
          icon={<WrenchScrewdriverIcon className='w-4 h-4' />}
          label='Task Details'
          onClick={handleTaskDetailsClick}
          tooltip='Open task details'
        />
        <RibbonButton
          icon={<DocumentTextIcon className='w-4 h-4' />}
          label='Task Notes'
          onClick={openTaskNotes}
          tooltip='Open task notes'
        />
        <RibbonButton
          icon={<CodeBracketIcon className='w-4 h-4' />}
          label='Code Library'
          onClick={addCode}
          tooltip='Open code library'
        />
      </RibbonGroup>
    </div>
  );
}
