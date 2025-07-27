import React from 'react';
import RibbonButton from '../shared/RibbonButton';
import RibbonGroup from '../shared/RibbonGroup';
import {
  EyeIcon,
  ScissorsIcon,
  DocumentDuplicateIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';

const ViewTab = () => {
  return (
    <div className="flex flex-row gap-1 p-1 bg-[#eaf1fb]">
      {/* View Group */}
      <RibbonGroup title="View">
        <RibbonButton
          icon={<EyeIcon className="w-4 h-4 text-gray-700" />}
          label="View Options"
        />
      </RibbonGroup>

      {/* Clipboard Group (Disabled) */}
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

      {/* Font Group (Disabled) */}
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
    </div>
  );
};

export default ViewTab;
