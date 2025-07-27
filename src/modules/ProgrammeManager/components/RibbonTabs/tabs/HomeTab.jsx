import React from 'react';

// Ribbon Button Component
const RibbonButton = ({ icon, label, onClick, disabled = false, className = '' }) => (
  <div
    className={`w-[48px] h-[48px] bg-gray-100 rounded flex items-center justify-center hover:bg-blue-100 cursor-pointer transition-all duration-200 ${
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    } ${className}`}
    onClick={disabled ? undefined : onClick}
  >
    <span className="text-lg">{icon}</span>
  </div>
);

// Ribbon Group Component
const RibbonGroup = ({ title, children, disabled = false }) => (
  <div
    className={`flex flex-col items-center w-fit p-2 bg-white shadow-sm rounded-md ${
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    }`}
  >
    <div className="flex gap-1 mb-1">{children}</div>
    <div className="text-[10px] font-medium text-gray-500 uppercase">{title}</div>
  </div>
);

export default function HomeTab() {
  // Click handlers for different actions
  const handleAction = (actionName) => {
    console.log(`HomeTab Action: ${actionName}`);
  };

  return (
    <div className="flex flex-row gap-3 p-2 bg-[#f9f9f9] border-t border-gray-200">
      {/* 1. Clipboard Group (Disabled) */}
      <RibbonGroup title="Clipboard" disabled={true}>
        <RibbonButton icon="✂️" label="Cut" disabled={true} />
        <RibbonButton icon="📋" label="Copy" disabled={true} />
        <RibbonButton icon="📎" label="Paste" disabled={true} />
      </RibbonGroup>

      {/* 2. Font Group (Disabled) */}
      <RibbonGroup title="Font" disabled={true}>
        <RibbonButton 
          icon="B" 
          label="Bold" 
          disabled={true} 
          className="font-bold text-xs"
        />
        <RibbonButton 
          icon="I" 
          label="Italic" 
          disabled={true} 
          className="italic text-xs"
        />
        <RibbonButton 
          icon="U" 
          label="Underline" 
          disabled={true} 
          className="underline text-xs"
        />
      </RibbonGroup>

      {/* 3. Tasks Group */}
      <RibbonGroup title="Tasks">
        <RibbonButton 
          icon="➕" 
          label="Add Task" 
          onClick={() => handleAction('Add Task')}
        />
        <RibbonButton 
          icon="❌" 
          label="Delete Task" 
          onClick={() => handleAction('Delete Task')}
        />
        <RibbonButton 
          icon="🔗" 
          label="Link Tasks" 
          onClick={() => handleAction('Link Tasks')}
        />
        <RibbonButton 
          icon="✖️" 
          label="Unlink Tasks" 
          onClick={() => handleAction('Unlink Tasks')}
        />
      </RibbonGroup>

      {/* 4. Properties Group */}
      <RibbonGroup title="Properties">
        <RibbonButton 
          icon="📄" 
          label="Task Details" 
          onClick={() => handleAction('Task Details')}
        />
        <RibbonButton 
          icon="📝" 
          label="Task Notes" 
          onClick={() => handleAction('Task Notes')}
        />
        <RibbonButton 
          icon="🔢" 
          label="Add Code" 
          onClick={() => handleAction('Add Code')}
        />
      </RibbonGroup>

      {/* 5. Grouping Group */}
      <RibbonGroup title="Grouping">
        <div className="flex flex-col gap-1">
          <RibbonButton 
            icon="🗂️" 
            label="Create Group" 
            onClick={() => handleAction('Create Group')}
          />
          <RibbonButton 
            icon="🚫" 
            label="Ungroup" 
            onClick={() => handleAction('Ungroup')}
          />
        </div>
      </RibbonGroup>

      {/* 6. Selection Group */}
      <RibbonGroup title="Selection">
        <RibbonButton 
          icon="✅" 
          label="Select All" 
          onClick={() => handleAction('Select All')}
        />
        <RibbonButton 
          icon="❎" 
          label="Deselect" 
          onClick={() => handleAction('Deselect')}
        />
      </RibbonGroup>

      {/* 7. Navigation Group */}
      <RibbonGroup title="Navigation">
        <RibbonButton 
          icon="📆" 
          label="Scroll to Today" 
          onClick={() => handleAction('Scroll to Today')}
        />
        <RibbonButton 
          icon="📂" 
          label="Expand All" 
          onClick={() => handleAction('Expand All')}
        />
        <RibbonButton 
          icon="📁" 
          label="Collapse All" 
          onClick={() => handleAction('Collapse All')}
        />
      </RibbonGroup>
    </div>
  );
}
