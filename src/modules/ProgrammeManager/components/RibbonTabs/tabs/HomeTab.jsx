import React from 'react';
import RibbonButton from '../shared/RibbonButton';
import RibbonGroup from '../shared/RibbonGroup';

export default function HomeTab() {
  // Click handlers for different actions
  const handleAction = (actionName) => {
    console.log(`HomeTab Action: ${actionName}`);
  };

  return (
    <div className="flex flex-row gap-3 p-3 bg-[#f9f9f9] border-t border-gray-200">
      {/* 1. Clipboard Group (Disabled) */}
      <RibbonGroup title="Clipboard" disabled={true}>
        <RibbonButton icon="cut" label="Cut" disabled={true} />
        <RibbonButton icon="copy" label="Copy" disabled={true} />
        <RibbonButton icon="paste" label="Paste" disabled={true} />
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
          icon="add" 
          label="Add Task" 
          onClick={() => handleAction('Add Task')}
        />
        <RibbonButton 
          icon="delete" 
          label="Delete Task" 
          onClick={() => handleAction('Delete Task')}
        />
        <RibbonButton 
          icon="link" 
          label="Link Tasks" 
          onClick={() => handleAction('Link Tasks')}
        />
        <RibbonButton 
          icon="unlink" 
          label="Unlink Tasks" 
          onClick={() => handleAction('Unlink Tasks')}
        />
      </RibbonGroup>

      {/* 4. Properties Group */}
      <RibbonGroup title="Properties">
        <RibbonButton 
          icon="details" 
          label="Task Details" 
          onClick={() => handleAction('Task Details')}
        />
        <RibbonButton 
          icon="notes" 
          label="Task Notes" 
          onClick={() => handleAction('Task Notes')}
        />
        <RibbonButton 
          icon="code" 
          label="Add Code" 
          onClick={() => handleAction('Add Code')}
        />
      </RibbonGroup>

      {/* 5. Grouping Group */}
      <RibbonGroup title="Grouping">
        <div className="flex flex-col gap-1">
          <RibbonButton 
            icon="group" 
            label="Create Group" 
            onClick={() => handleAction('Create Group')}
          />
          <RibbonButton 
            icon="ungroup" 
            label="Ungroup" 
            onClick={() => handleAction('Ungroup')}
          />
        </div>
      </RibbonGroup>

      {/* 6. Selection Group */}
      <RibbonGroup title="Selection">
        <RibbonButton 
          icon="select" 
          label="Select All" 
          onClick={() => handleAction('Select All')}
        />
        <RibbonButton 
          icon="deselect" 
          label="Deselect" 
          onClick={() => handleAction('Deselect')}
        />
      </RibbonGroup>

      {/* 7. Navigation Group */}
      <RibbonGroup title="Navigation" isLast={true}>
        <RibbonButton 
          icon="today" 
          label="Scroll to Today" 
          onClick={() => handleAction('Scroll to Today')}
        />
        <RibbonButton 
          icon="expand" 
          label="Expand All" 
          onClick={() => handleAction('Expand All')}
        />
        <RibbonButton 
          icon="collapse" 
          label="Collapse All" 
          onClick={() => handleAction('Collapse All')}
        />
      </RibbonGroup>
    </div>
  );
}
