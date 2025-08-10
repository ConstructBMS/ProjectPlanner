import React from 'react';
import { RibbonGroup, RibbonButton } from '../../RibbonComponents';
import { PaintBrushIcon, TagIcon } from '@heroicons/react/24/outline';

const FormatTab = ({ tasks, userSettings, onSettingsUpdate }) => {
  return (
    <div className='flex flex-col gap-4 p-4'>
      {/* Bar Styles Group */}
      <RibbonGroup title='Bar Styles'>
        <RibbonButton
          icon={PaintBrushIcon}
          label='Bar Styles'
          description='Configure custom Gantt bar styles'
          onClick={() => {
            // This would typically open a modal or panel
            console.log('Open Bar Style Editor');
          }}
        />
      </RibbonGroup>

      {/* Bar Labels Group */}
      <RibbonGroup title='Bar Labels'>
        <RibbonButton
          icon={TagIcon}
          label='Bar Labels'
          description='Configure custom Gantt bar labels'
          onClick={() => {
            // This would typically open a modal or panel
            console.log('Open Bar Label Editor');
          }}
        />
      </RibbonGroup>

      {/* Bar Style Editor Panel */}
      <div className='mt-4'>
        <BarStyleEditor
          tasks={tasks}
          userSettings={userSettings}
          onSettingsUpdate={onSettingsUpdate}
        />
      </div>

      {/* Bar Label Editor Panel */}
      <div className='mt-4'>
        <BarLabelEditor
          userSettings={userSettings}
          onSettingsUpdate={onSettingsUpdate}
        />
      </div>
    </div>
  );
};

// Import the BarStyleEditor component
import BarStyleEditor from '../../BarStyleEditor';
import BarLabelEditor from '../../BarLabelEditor';

export default FormatTab;
