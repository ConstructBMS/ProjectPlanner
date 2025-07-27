import React from 'react';
import RibbonButton from '../shared/RibbonButton';
import RibbonGroup from '../shared/RibbonGroup';
import {
  FolderIcon,
  DocumentIcon,
  CogIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const ProjectTab = () => {
  return (
    <div className="flex flex-row gap-1 p-1 bg-[#eaf1fb]">
      {/* Project Settings Group */}
      <RibbonGroup title="Project Settings">
        <RibbonButton
          icon={<FolderIcon className="w-4 h-4 text-gray-700" />}
          label="Project Info"
        />
        <RibbonButton
          icon={<DocumentIcon className="w-4 h-4 text-gray-700" />}
          label="Project Settings"
        />
        <RibbonButton
          icon={<CogIcon className="w-4 h-4 text-gray-700" />}
          label="Preferences"
        />
      </RibbonGroup>

      {/* Project Analysis Group */}
      <RibbonGroup title="Analysis">
        <RibbonButton
          icon={<ChartBarIcon className="w-4 h-4 text-gray-700" />}
          label="Project Reports"
        />
      </RibbonGroup>
    </div>
  );
};

export default ProjectTab;
