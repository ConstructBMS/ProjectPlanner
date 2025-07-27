import React, { useState } from "react";
import HomeTab from "./tabs/HomeTab";
import ViewTab from "./tabs/ViewTab";
import ProjectTab from "./tabs/ProjectTab";
import AllocationTab from "./tabs/AllocationTab";
import FourDTab from "./tabs/FourDTab";
import FormatTab from "./tabs/FormatTab";

const tabs = ["Home", "View", "Project", "Allocation", "4D", "Format"];

export default function RibbonTabs() {
  const [activeTab, setActiveTab] = useState("Home");

  const renderTabContent = () => {
    switch (activeTab) {
      case "Home":
        return <HomeTab />;
      case "View":
        return <ViewTab />;
      case "Project":
        return <ProjectTab />;
      case "Allocation":
        return <AllocationTab />;
      case "4D":
        return <FourDTab />;
      case "Format":
        return <FormatTab />;
      default:
        return <div className="text-sm p-4 text-gray-500">Coming soon</div>;
    }
  };

  return (
    <div className="asta-ribbon">
      {/* Tab Buttons */}
      <div className="flex border-b border-gray-300">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`asta-ribbon-tab ${
              activeTab === tab ? "active" : ""
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* Active Tab Tools */}
      <div className="asta-ribbon-content min-h-[80px]">
        {renderTabContent()}
      </div>
    </div>
  );
}
