import { useState, useEffect, useCallback } from 'react';
import { useViewContext } from '../../context/ViewContext';
import { useUserContext } from '../../context/UserContext';
import HomeTab from './tabs/HomeTab';
import ViewTab from './tabs/ViewTab';
import ProjectTab from './tabs/ProjectTab';
import AllocationTab from './tabs/AllocationTab';
import FourDTab from './tabs/FourDTab';
import FormatTab from './tabs/FormatTab';
import QuickAccessToolbar from './QuickAccessToolbar';
import GroupDialog from './GroupDialog';
import StyleOptions from './StyleOptions';
import BackstageView from '../Backstage/BackstageView';
import { loadRibbonStyle } from '../../utils/ribbonTheme';
import './Ribbon.css';

const allTabs = ['Home', 'View', 'Project', 'Allocation', '4D', 'Format'];

export default function RibbonTabs({ onExpandAll, onCollapseAll, contentRef }) {
  const [activeTab, setActiveTab] = useState('Home');
  const [qatPosition, setQatPosition] = useState('above');
  const [groupDialog, setGroupDialog] = useState({ isOpen: false, title: '', content: null });
  const [isMinimised, setIsMinimised] = useState(false);
  const [ribbonStyle, setRibbonStyle] = useState(loadRibbonStyle());
  const [isBackstageOpen, setIsBackstageOpen] = useState(false);
  const { viewState, updateViewState } = useViewContext();
  const { canAccessTab, getAvailableTabs } = useUserContext();

  // Filter tabs based on user permissions
  const tabs = allTabs.filter(tab => canAccessTab(tab));

  // Load saved active tab on mount and ensure it's accessible
  useEffect(() => {
    if (viewState.activeTab && canAccessTab(viewState.activeTab)) {
      setActiveTab(viewState.activeTab);
    } else if (tabs.length > 0) {
      // Set to first available tab if saved tab is not accessible
      setActiveTab(tabs[0]);
    }
  }, [viewState.activeTab, canAccessTab, tabs]);

  // Load minimised state from localStorage on mount
  useEffect(() => {
    const savedMinimised = localStorage.getItem('pm.ribbon.minimised');
    if (savedMinimised === 'true') {
      setIsMinimised(true);
    }
  }, []);

  // Keyboard shortcut for Ctrl+F1 to toggle ribbon
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 'F1') {
        event.preventDefault();
        toggleMinimise();
      }
    };

    // Add event listener to document
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMinimised]); // Include isMinimised in dependencies since toggleMinimise uses it

  const handleTabChange = tab => {
    setActiveTab(tab);
    updateViewState({ activeTab: tab });
  };

  const handleQatPositionChange = (position) => {
    setQatPosition(position);
  };

  // QAT action handlers
  const handleUndo = () => {
    console.info('Undo action triggered');
  };

  const handleRedo = () => {
    console.info('Redo action triggered');
  };

  const handleSave = () => {
    console.info('Save action triggered');
  };

  // Group dialog handlers
  const openGroupDialog = (title, content) => {
    setGroupDialog({ isOpen: true, title, content });
  };

  const closeGroupDialog = () => {
    setGroupDialog({ isOpen: false, title: '', content: null });
  };

  // Minimise/restore ribbon handlers
  const toggleMinimise = useCallback(() => {
    const newMinimised = !isMinimised;
    setIsMinimised(newMinimised);
    localStorage.setItem('pm.ribbon.minimised', newMinimised.toString());
  }, [isMinimised]);

  const handleTabDoubleClick = () => {
    toggleMinimise();
  };

  // Handle ribbon style change
  const handleStyleChange = (newStyle) => {
    setRibbonStyle(newStyle);
  };

  // Handle backstage open/close
  const handleBackstageToggle = () => {
    setIsBackstageOpen(!isBackstageOpen);
  };

  const handleBackstageClose = () => {
    setIsBackstageOpen(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <HomeTab onExpandAll={onExpandAll} onCollapseAll={onCollapseAll} />
        );
      case 'View':
        return <ViewTab contentRef={contentRef} />;
      case 'Project':
        return <ProjectTab />;
      case 'Allocation':
        return <AllocationTab />;
      case '4D':
        return <FourDTab />;
      case 'Format':
        return <FormatTab onOpenGroupDialog={openGroupDialog} />;
      default:
        return <div className='text-sm p-4 text-gray-500'>Coming soon</div>;
    }
  };

          return (
          <div 
            className='pm-ribbon'
            data-mode={ribbonStyle.mode}
            data-accent={ribbonStyle.accent}
          >
            {/* Quick Access Toolbar - Above */}
            {qatPosition === 'above' && (
        <QuickAccessToolbar
          position="above"
          onPositionChange={handleQatPositionChange}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSave={handleSave}
        />
      )}

                  {/* Tab Buttons */}
            <div className='flex border-b border-gray-300 overflow-x-auto relative'>
              {/* File Button (Backstage) */}
              <button
                onClick={handleBackstageToggle}
                className={`project-ribbon-tab ribbon-tab ${isBackstageOpen ? 'active' : ''}`}
                tabIndex={0}
                title="File"
              >
                File
              </button>
              
              {/* Style Options Button */}
              <StyleOptions onStyleChange={handleStyleChange} />
              
              {tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            onDoubleClick={handleTabDoubleClick}
            className={`project-ribbon-tab ribbon-tab ${activeTab === tab ? 'active' : ''}`}
            tabIndex={0}
            title={tab}
          >
            {tab}
          </button>
        ))}
        
        {/* Minimise/Restore Chevron */}
        <button
          onClick={toggleMinimise}
          className="ribbon-minimise-button"
          aria-label={isMinimised ? "Restore the Ribbon" : "Minimise the Ribbon"}
          title={isMinimised ? "Restore the Ribbon" : "Minimise the Ribbon"}
          tabIndex={0}
        >
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${isMinimised ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </button>
      </div>

      {/* Active Tab Tools */}
      <div className={`project-ribbon-content w-full ${isMinimised ? 'ribbon-minimised' : ''}`}>
        {renderTabContent()}
      </div>

      {/* Quick Access Toolbar - Below */}
      {qatPosition === 'below' && (
        <QuickAccessToolbar
          position="below"
          onPositionChange={handleQatPositionChange}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSave={handleSave}
        />
      )}

                {/* Group Dialog */}
          <GroupDialog
            title={groupDialog.title}
            onClose={closeGroupDialog}
            isOpen={groupDialog.isOpen}
          >
            {groupDialog.content}
          </GroupDialog>

          {/* Backstage View */}
          <BackstageView
            isOpen={isBackstageOpen}
            onClose={handleBackstageClose}
          />
        </div>
      );
    }
