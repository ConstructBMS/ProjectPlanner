import React, { useState } from "react";
import HomeTab from "./tabs/HomeTab";
import ViewTab from "./tabs/ViewTab";
import ProjectTab from "./tabs/ProjectTab";
import AllocationTab from "./tabs/AllocationTab";
import FourDTab from "./tabs/FourDTab";
import FormatTab from "./tabs/FormatTab";

const tabs = ["File", "Home", "View", "Project", "Allocation", "4D", "Format"];

export default function RibbonTabs({ onAction }) {
  const [activeTab, setActiveTab] = useState("Home");

  const renderTabContent = () => {
    switch (activeTab) {
      case "Home":
        return <HomeTab onAction={onAction} />;
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
        return <HomeTab onAction={onAction} />;
    }
  };

  return (
    <div className="bg-blue-100 w-full">
      {/* Tab Buttons */}
      <div className="flex bg-[#b2c7e1] text-sm font-medium border-b border-blue-300 h-[60px]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 hover:bg-white transition-colors duration-200 ${
              activeTab === tab
                ? "bg-white border-t border-x border-blue-300 -mb-px relative"
                : "hover:bg-blue-50"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
        ))}
      </div>

      {/* Active Tab Tools */}
      <div className="min-h-[60px]">{renderTabContent()}</div>
    </div>
  );
}
