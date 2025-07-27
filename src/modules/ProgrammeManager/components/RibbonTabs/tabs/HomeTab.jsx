import React from 'react';
import RibbonButton from '../shared/RibbonButton';
import RibbonGroup from '../shared/RibbonGroup';
import useTaskManager from '../../../hooks/useTaskManager';
import {
  ScissorsIcon,
  DocumentDuplicateIcon,
  PaperClipIcon,
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
  ChevronUpIcon
} from '@heroicons/react/24/outline';

export default function HomeTab({ onAction }) {
  // Use the task manager hook
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
    deselect,
    scrollToToday,
    lastAction,
  } = useTaskManager();

  // Click handlers for different actions
  const handleAction = (actionName) => {
    console.log(`HomeTab Action: ${actionName}`);

    // Call the parent action handler if provided
    if (onAction) {
      onAction(actionName);
    }
  };

  return (
    <div className="flex flex-row gap-1 p-1 bg-[#eaf1fb]">
      {/* 1. Clipboard Group (Disabled) */}
      <RibbonGroup title="Clipboard" disabled={true}>
        <RibbonButton
          icon={<ScissorsIcon className="w-4 h-4 text-gray-700" />}
          label="Cut"
          disabled={true}
        />
        <RibbonButton
          icon={<DocumentDuplicateIcon className="w-4 h-4 text-gray-700" />}
          label="Copy"
          disabled={true}
        />
        <RibbonButton
          icon={<PaperClipIcon className="w-4 h-4 text-gray-700" />}
          label="Paste"
          disabled={true}
        />
      </RibbonGroup>

      {/* 2. Font Group (Disabled) */}
      <RibbonGroup title="Font" disabled={true}>
        <RibbonButton
          icon="B"
          label="Bold"
          disabled={true}
          iconType="text"
          className="font-bold"
        />
        <RibbonButton
          icon="I"
          label="Italic"
          disabled={true}
          iconType="text"
          className="italic"
        />
        <RibbonButton
          icon="U"
          label="Underline"
          disabled={true}
          iconType="text"
          className="underline"
        />
      </RibbonGroup>

      {/* 3. Tasks Group */}
      <RibbonGroup title="Tasks">
        <RibbonButton
          icon={<PlusIcon className="w-4 h-4 text-gray-700" />}
          label="Add Task"
          onClick={addTask}
        />
        <RibbonButton
          icon={<TrashIcon className="w-4 h-4 text-gray-700" />}
          label="Delete Task"
          onClick={deleteTask}
        />
        <RibbonButton
          icon={<LinkIcon className="w-4 h-4 text-gray-700" />}
          label="Link Tasks"
          onClick={linkTasks}
        />
        <RibbonButton
          icon={<XMarkIcon className="w-4 h-4 text-gray-700" />}
          label="Unlink Tasks"
          onClick={unlinkTasks}
        />
      </RibbonGroup>

      {/* 4. Properties Group */}
      <RibbonGroup title="Properties">
        <RibbonButton
          icon={<DocumentIcon className="w-4 h-4 text-gray-700" />}
          label="Task Details"
          onClick={openTaskDetails}
        />
        <RibbonButton
          icon={<PencilIcon className="w-4 h-4 text-gray-700" />}
          label="Task Notes"
          onClick={openTaskNotes}
        />
        <RibbonButton
          icon={<HashtagIcon className="w-4 h-4 text-gray-700" />}
          label="Add Code"
          onClick={addCode}
        />
      </RibbonGroup>

      {/* 5. Grouping Group - Fixed to horizontal layout */}
      <RibbonGroup title="Grouping">
        <RibbonButton
          icon={<FolderPlusIcon className="w-4 h-4 text-gray-700" />}
          label="Create Group"
          onClick={createGroup}
        />
        <RibbonButton
          icon={<MinusCircleIcon className="w-4 h-4 text-gray-700" />}
          label="Ungroup"
          onClick={ungroup}
        />
      </RibbonGroup>

      {/* 6. Selection Group */}
      <RibbonGroup title="Selection">
        <RibbonButton
          icon={<CheckIcon className="w-4 h-4 text-gray-700" />}
          label="Select All"
          onClick={selectAll}
        />
        <RibbonButton
          icon={<XCircleIcon className="w-4 h-4 text-gray-700" />}
          label="Deselect"
          onClick={deselect}
        />
      </RibbonGroup>

      {/* 7. Navigation Group */}
      <RibbonGroup title="Navigation" isLast={true}>
        <RibbonButton
          icon={<CalendarIcon className="w-4 h-4 text-gray-700" />}
          label="Scroll to Today"
          onClick={scrollToToday}
        />
        <RibbonButton
          icon={<ChevronDownIcon className="w-4 h-4 text-gray-700" />}
          label="Expand All"
          onClick={() => handleAction('Expand All')}
        />
        <RibbonButton
          icon={<ChevronUpIcon className="w-4 h-4 text-gray-700" />}
          label="Collapse All"
          onClick={() => handleAction('Collapse All')}
        />
      </RibbonGroup>

      {/* Debug Log Box (Development Mode) */}
      <div className="fixed bottom-4 right-4 bg-white border p-2 shadow text-xs rounded z-50">
        Last Action: {lastAction}
      </div>
    </div>
  );
}
