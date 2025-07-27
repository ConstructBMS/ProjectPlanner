import React from 'react';
import RibbonButton from '../shared/RibbonButton';
import RibbonGroup from '../shared/RibbonGroup';
import {
  UserGroupIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

const AllocationTab = () => {
  return (
    <div className="flex flex-row gap-1 p-1 bg-[#eaf1fb]">
      {/* Resource Allocation Group */}
      <RibbonGroup title="Resource Allocation">
        <RibbonButton
          icon={<UserGroupIcon className="w-4 h-4 text-gray-700" />}
          label="Assign Resources"
        />
        <RibbonButton
          icon={<UserIcon className="w-4 h-4 text-gray-700" />}
          label="Resource Details"
        />
        <RibbonButton
          icon={<WrenchScrewdriverIcon className="w-4 h-4 text-gray-700" />}
          label="Equipment"
        />
      </RibbonGroup>

      {/* Resource Management Group */}
      <RibbonGroup title="Resource Management">
        <RibbonButton
          icon={<TruckIcon className="w-4 h-4 text-gray-700" />}
          label="Resource Reports"
        />
      </RibbonGroup>
    </div>
  );
};

export default AllocationTab;
