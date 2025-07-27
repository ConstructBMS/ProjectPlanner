import React from 'react';
import RibbonButton from '../shared/RibbonButton';
import RibbonGroup from '../shared/RibbonGroup';
import {
  PaintBrushIcon,
  SwatchIcon,
  ViewColumnsIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const FormatTab = () => {
  return (
    <div className="flex flex-row gap-1 p-1 bg-[#eaf1fb]">
      {/* Formatting Group */}
      <RibbonGroup title="Formatting">
        <RibbonButton
          icon={<PaintBrushIcon className="w-4 h-4 text-gray-700" />}
          label="Format Painter"
        />
        <RibbonButton
          icon={<SwatchIcon className="w-4 h-4 text-gray-700" />}
          label="Color Schemes"
        />
        <RibbonButton
          icon={<ViewColumnsIcon className="w-4 h-4 text-gray-700" />}
          label="Column Format"
        />
      </RibbonGroup>

      {/* Display Options Group */}
      <RibbonGroup title="Display Options">
        <RibbonButton
          icon={<AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-700" />}
          label="Display Settings"
        />
      </RibbonGroup>
    </div>
  );
};

export default FormatTab;
