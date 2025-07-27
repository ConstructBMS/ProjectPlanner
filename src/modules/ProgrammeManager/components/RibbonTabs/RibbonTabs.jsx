import React, { useState } from 'react';
import HomeTab from './tabs/HomeTab';
import ViewTab from './tabs/ViewTab';
import ProjectTab from './tabs/ProjectTab';
import AllocationTab from './tabs/AllocationTab';
import FourDTab from './tabs/FourDTab';
import FormatTab from './tabs/FormatTab';

const tabs = ['File', 'Home', 'View', 'Project', 'Allocation', '4D', 'Format'];

export default function RibbonTabs() {
  const [activeTab, setActiveTab] = useState('Home');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeTab />;
      case 'View':
        return <ViewTab />;
      case 'Project':
        return <ProjectTab />;
      case 'Allocation':
        return <AllocationTab />;
      case '4D':
        return <FourDTab />;
      case 'Format':
        return <FormatTab />;
      default:
        return <div className='text-sm p-4 text-gray-500'>Coming soon</div>;
    }
  };

  return (
    <div className='bg-blue-100 w-full'>
      {/* Tab Buttons */}
      <div className='flex bg-[#b2c7e1] text-sm font-medium border-b border-blue-300'>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 hover:bg-white ${
              activeTab === tab
                ? 'bg-white border-t border-x border-blue-300 -mb-px'
                : ''
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Active Tab Tools */}
      <div className='p-2'>{renderTabContent()}</div>
    </div>
  );
}
