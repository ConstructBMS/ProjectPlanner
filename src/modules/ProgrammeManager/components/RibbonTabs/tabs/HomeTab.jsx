import React, { useState } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  LinkIcon, 
  XMarkIcon, 
  DocumentIcon, 
  PencilIcon, 
  HashtagIcon,
  FolderPlusIcon,
  MinusCircleIcon,
  CheckIcon,
  XCircleIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CodeBracketIcon,
  UserGroupIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import RibbonButton from '../shared/RibbonButton';
import RibbonGroup from '../shared/RibbonGroup';
import RibbonDropdown from '../shared/RibbonDropdown';
import RibbonToggle from '../shared/RibbonToggle';
import useTaskManager from '../../../hooks/useTaskManager';

const HomeTab = () => {
  const { 
    addTask, 
    deleteTask, 
    linkTasks, 
    unlinkTasks, 
    openTaskDetails, 
    openTaskNotes, 
    addCode,
    createGroup,
    ungroup,
    selectAll,
    deselectAll
  } = useTaskManager();

  // Toggle states for navigation tools
  const [criticalPathActive, setCriticalPathActive] = useState(false);
  const [showBaselinesActive, setShowBaselinesActive] = useState(false);

  // Group dropdown items
  const groupItems = [
    {
      label: 'Create Group',
      icon: <FolderPlusIcon className="w-4 h-4" />,
      tooltip: 'Group selected tasks under a new parent task'
    },
    {
      label: 'Ungroup',
      icon: <MinusCircleIcon className="w-4 h-4" />,
      tooltip: 'Remove selected task from its group'
    },
    {
      label: 'Group by Code',
      icon: <CodeBracketIcon className="w-4 h-4" />,
      tooltip: 'Group tasks by their cost codes'
    },
    {
      label: 'Group by Resource',
      icon: <UserGroupIcon className="w-4 h-4" />,
      tooltip: 'Group tasks by assigned resources'
    }
  ];

  // Select dropdown items
  const selectItems = [
    {
      label: 'Select All',
      icon: <CheckIcon className="w-4 h-4" />,
      tooltip: 'Select all visible tasks',
      shortcut: 'Ctrl+A'
    },
    {
      label: 'Deselect All',
      icon: <XCircleIcon className="w-4 h-4" />,
      tooltip: 'Clear all selections',
      shortcut: 'Esc'
    },
    {
      label: 'Select Linked Tasks',
      icon: <LinkIcon className="w-4 h-4" />,
      tooltip: 'Select all tasks linked to the current selection'
    },
    {
      label: 'Select Summary Tasks',
      icon: <FolderPlusIcon className="w-4 h-4" />,
      tooltip: 'Select all group/summary tasks'
    }
  ];

  // Handle group dropdown selection
  const handleGroupSelect = (item) => {
    console.log('Group action:', item.label);
    switch (item.label) {
      case 'Create Group':
        createGroup();
        break;
      case 'Ungroup':
        ungroup();
        break;
      case 'Group by Code':
        console.log('Group by Code - not yet implemented');
        break;
      case 'Group by Resource':
        console.log('Group by Resource - not yet implemented');
        break;
      default:
        console.log('Unknown group action:', item.label);
    }
  };

  // Handle select dropdown selection
  const handleSelectSelect = (item) => {
    console.log('Select action:', item.label);
    switch (item.label) {
      case 'Select All':
        selectAll();
        break;
      case 'Deselect All':
        deselectAll();
        break;
      case 'Select Linked Tasks':
        console.log('Select Linked Tasks - not yet implemented');
        break;
      case 'Select Summary Tasks':
        console.log('Select Summary Tasks - not yet implemented');
        break;
      default:
        console.log('Unknown select action:', item.label);
    }
  };

  // Handle toggle button clicks
  const handleCriticalPathToggle = () => {
    setCriticalPathActive(!criticalPathActive);
    console.log('Critical Path:', !criticalPathActive ? 'enabled' : 'disabled');
  };

  const handleShowBaselinesToggle = () => {
    setShowBaselinesActive(!showBaselinesActive);
    console.log('Show Baselines:', !showBaselinesActive ? 'enabled' : 'disabled');
  };

  return (
    <div className="flex flex-wrap gap-3 text-xs">
      {/* Clipboard Group */}
      <RibbonGroup title="Clipboard">
        <RibbonButton
          icon={<DocumentIcon className="w-5 h-5" />}
          label="Paste"
          onClick={() => console.log('Paste')}
          disabled={true}
          title="Paste from clipboard (disabled)"
        />
        <RibbonButton
          icon={<TrashIcon className="w-5 h-5" />}
          label="Cut"
          onClick={() => console.log('Cut')}
          disabled={true}
          title="Cut selected items (disabled)"
        />
        <RibbonButton
          icon={<DocumentIcon className="w-5 h-5" />}
          label="Copy"
          onClick={() => console.log('Copy')}
          disabled={true}
          title="Copy selected items (disabled)"
        />
      </RibbonGroup>

      {/* Font Group */}
      <RibbonGroup title="Font">
        <RibbonButton
          icon={<span className="font-bold text-sm">B</span>}
          label="Bold"
          onClick={() => console.log('Bold')}
          disabled={true}
          title="Make text bold (disabled)"
        />
        <RibbonButton
          icon={<span className="italic text-sm">I</span>}
          label="Italic"
          onClick={() => console.log('Italic')}
          disabled={true}
          title="Make text italic (disabled)"
        />
        <RibbonButton
          icon={<span className="underline text-sm">U</span>}
          label="Underline"
          onClick={() => console.log('Underline')}
          disabled={true}
          title="Underline text (disabled)"
        />
      </RibbonGroup>

      {/* Tasks Group */}
      <RibbonGroup title="Tasks">
        <RibbonButton
          icon={<PlusIcon className="w-5 h-5" />}
          label="Add Task"
          onClick={addTask}
          title="Add a new task to the project"
        />
        <RibbonButton
          icon={<TrashIcon className="w-5 h-5" />}
          label="Delete Task"
          onClick={deleteTask}
          title="Delete the selected task"
        />
        <RibbonButton
          icon={<LinkIcon className="w-5 h-5" />}
          label="Link Tasks"
          onClick={linkTasks}
          title="Link selected tasks to create dependencies"
        />
        <RibbonButton
          icon={<XMarkIcon className="w-5 h-5" />}
          label="Unlink Tasks"
          onClick={unlinkTasks}
          title="Remove links between selected tasks"
        />
        <RibbonButton
          icon={<PlusIcon className="w-5 h-5" />}
          label="Insert Task"
          onClick={() => console.log('Insert Task Above')}
          title="Insert a new task above the selected task"
        />
        <RibbonButton
          icon={<FolderPlusIcon className="w-5 h-5" />}
          label="Insert Summary"
          onClick={() => console.log('Insert Summary Task')}
          title="Insert a summary task to wrap selected tasks"
        />
        <RibbonButton
          icon={<ArrowDownIcon className="w-5 h-5" />}
          label="Indent Task"
          onClick={() => console.log('Indent Task')}
          title="Move task under the previous task (increase hierarchy)"
        />
        <RibbonButton
          icon={<ArrowUpIcon className="w-5 h-5" />}
          label="Outdent Task"
          onClick={() => console.log('Outdent Task')}
          title="Move task up one level in hierarchy"
        />
      </RibbonGroup>

      {/* Properties Group */}
      <RibbonGroup title="Properties">
        <RibbonButton
          icon={<DocumentIcon className="w-5 h-5" />}
          label="Task Details"
          onClick={openTaskDetails}
          title="Open task properties dialog"
        />
        <RibbonButton
          icon={<PencilIcon className="w-5 h-5" />}
          label="Task Notes"
          onClick={openTaskNotes}
          title="Add or edit task notes"
        />
        <RibbonButton
          icon={<HashtagIcon className="w-5 h-5" />}
          label="Add Code"
          onClick={addCode}
          title="Add cost code to selected task"
        />
        <RibbonButton
          icon={<CodeBracketIcon className="w-5 h-5" />}
          label="Code Library"
          onClick={() => console.log('Open Code Library')}
          title="Open code library management"
        />
      </RibbonGroup>

      {/* Grouping Group */}
      <RibbonGroup title="Grouping">
        <RibbonDropdown
          icon={<FolderPlusIcon className="w-5 h-5" />}
          label="Group"
          items={groupItems}
          onSelect={handleGroupSelect}
          title="Group tasks and manage hierarchies"
        />
      </RibbonGroup>

      {/* Selection Group */}
      <RibbonGroup title="Selection">
        <RibbonDropdown
          icon={<CheckIcon className="w-5 h-5" />}
          label="Select"
          items={selectItems}
          onSelect={handleSelectSelect}
          title="Select tasks and manage selections"
        />
      </RibbonGroup>

      {/* Navigation Group */}
      <RibbonGroup title="Navigation">
        <RibbonButton
          icon={<CalendarIcon className="w-5 h-5" />}
          label="Scroll to Today"
          onClick={() => console.log('Scroll to Today')}
          title="Scroll the timeline to today's date"
        />
        <RibbonButton
          icon={<ChevronDownIcon className="w-5 h-5" />}
          label="Expand All"
          onClick={() => console.log('Expand All')}
          title="Expand all collapsed groups"
        />
        <RibbonButton
          icon={<ChevronUpIcon className="w-5 h-5" />}
          label="Collapse All"
          onClick={() => console.log('Collapse All')}
          title="Collapse all expanded groups"
        />
        <RibbonToggle
          icon={<EyeIcon className="w-5 h-5" />}
          label="Critical Path"
          isActive={criticalPathActive}
          onClick={handleCriticalPathToggle}
          title="Show/hide critical path highlighting"
        />
        <RibbonToggle
          icon={<ChartBarIcon className="w-5 h-5" />}
          label="Show Baselines"
          isActive={showBaselinesActive}
          onClick={handleShowBaselinesToggle}
          title="Show/hide baseline comparisons"
        />
      </RibbonGroup>
    </div>
  );
};

export default HomeTab;
