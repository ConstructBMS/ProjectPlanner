import React from 'react';
import RibbonButton from '../shared/RibbonButton';
import RibbonGroup from '../shared/RibbonGroup';
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
  // Click handlers for different actions
  const handleAction = (actionName) => {
    console.log(`HomeTab Action: ${actionName}`);
    
    // Call the parent action handler if provided
    if (onAction) {
      onAction(actionName);
    }
  };

  return (
    <div className="flex flex-row gap-3 p-3 bg-[#f9f9f9] border-t border-gray-200">
      {/* 1. Clipboard Group (Disabled) */}
      <RibbonGroup title="Clipboard" disabled={true}>
        <RibbonButton
          icon={<ScissorsIcon className="w-5 h-5 text-gray-700" />}
          label="Cut"
          disabled={true}
        />
        <RibbonButton
          icon={<DocumentDuplicateIcon className="w-5 h-5 text-gray-700" />}
          label="Copy"
          disabled={true}
        />
        <RibbonButton
          icon={<PaperClipIcon className="w-5 h-5 text-gray-700" />}
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
          icon={<PlusIcon className="w-5 h-5 text-gray-700" />}
          label="Add Task"
          onClick={() => handleAction('Add Task')}
        />
        <RibbonButton
          icon={<TrashIcon className="w-5 h-5 text-gray-700" />}
          label="Delete Task"
          onClick={() => handleAction('Delete Task')}
        />
        <RibbonButton
          icon={<LinkIcon className="w-5 h-5 text-gray-700" />}
          label="Link Tasks"
          onClick={() => handleAction('Link Tasks')}
        />
        <RibbonButton
          icon={<XMarkIcon className="w-5 h-5 text-gray-700" />}
          label="Unlink Tasks"
          onClick={() => handleAction('Unlink Tasks')}
        />
      </RibbonGroup>

      {/* 4. Properties Group */}
      <RibbonGroup title="Properties">
        <RibbonButton
          icon={<DocumentIcon className="w-5 h-5 text-gray-700" />}
          label="Task Details"
          onClick={() => handleAction('Task Details')}
        />
        <RibbonButton
          icon={<PencilIcon className="w-5 h-5 text-gray-700" />}
          label="Task Notes"
          onClick={() => handleAction('Task Notes')}
        />
        <RibbonButton
          icon={<HashtagIcon className="w-5 h-5 text-gray-700" />}
          label="Add Code"
          onClick={() => handleAction('Add Code')}
        />
      </RibbonGroup>

      {/* 5. Grouping Group */}
      <RibbonGroup title="Grouping">
        <div className="flex flex-col gap-1">
          <RibbonButton
            icon={<FolderPlusIcon className="w-5 h-5 text-gray-700" />}
            label="Create Group"
            onClick={() => handleAction('Create Group')}
          />
          <RibbonButton
            icon={<MinusCircleIcon className="w-5 h-5 text-gray-700" />}
            label="Ungroup"
            onClick={() => handleAction('Ungroup')}
          />
        </div>
      </RibbonGroup>

      {/* 6. Selection Group */}
      <RibbonGroup title="Selection">
        <RibbonButton
          icon={<CheckIcon className="w-5 h-5 text-gray-700" />}
          label="Select All"
          onClick={() => handleAction('Select All')}
        />
        <RibbonButton
          icon={<XCircleIcon className="w-5 h-5 text-gray-700" />}
          label="Deselect"
          onClick={() => handleAction('Deselect')}
        />
      </RibbonGroup>

      {/* 7. Navigation Group */}
      <RibbonGroup title="Navigation" isLast={true}>
        <RibbonButton
          icon={<CalendarIcon className="w-5 h-5 text-gray-700" />}
          label="Scroll to Today"
          onClick={() => handleAction('Scroll to Today')}
        />
        <RibbonButton
          icon={<ChevronDownIcon className="w-5 h-5 text-gray-700" />}
          label="Expand All"
          onClick={() => handleAction('Expand All')}
        />
        <RibbonButton
          icon={<ChevronUpIcon className="w-5 h-5 text-gray-700" />}
          label="Collapse All"
          onClick={() => handleAction('Collapse All')}
        />
      </RibbonGroup>
    </div>
  );
}
