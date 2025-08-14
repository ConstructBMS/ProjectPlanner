 
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
import { getRibbonPrefs, setRibbonPrefs } from '../../utils/ribbonStorage';
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
  const { canAccessTab } = useUserContext();

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

  // Load ribbon preferences from storage on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await getRibbonPrefs();
        if (prefs) {
          setIsMinimised(prefs.minimised);
          setQatPosition(prefs.qatPosition);
          if (prefs.style) {
            setRibbonStyle(prefs.style);
          }
          
          // Emit initial minimise state for AppShell
          window.dispatchEvent(new window.CustomEvent('RIBBON_MINIMISE_CHANGE', {
            detail: { minimised: prefs.minimised }
          }));
        }
      } catch (error) {
        console.warn('Failed to load ribbon preferences:', error);
      }
    };

    loadPreferences();
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
  }, [isMinimised, toggleMinimise]); // Include isMinimised in dependencies since toggleMinimise uses it

  const handleTabChange = tab => {
    setActiveTab(tab);
    updateViewState({ activeTab: tab });
  };

  const handleQatPositionChange = async (position) => {
    setQatPosition(position);
    
    try {
      await setRibbonPrefs({
        minimised: isMinimised,
        qatPosition: position,
        style: ribbonStyle
      });
    } catch (error) {
      console.warn('Failed to save QAT position:', error);
    }
  };

  const toggleMinimise = useCallback(async () => {
    const newMinimised = !isMinimised;
    setIsMinimised(newMinimised);
    
    try {
      await setRibbonPrefs({
        minimised: newMinimised,
        qatPosition,
        style: ribbonStyle
      });
      
      // Emit event for AppShell to adjust layout
      window.dispatchEvent(new window.CustomEvent('RIBBON_MINIMISE_CHANGE', {
        detail: { minimised: newMinimised }
      }));
    } catch (error) {
      console.warn('Failed to save minimise state:', error);
    }
  }, [isMinimised, qatPosition, ribbonStyle]);

  const handleTabDoubleClick = () => {
    toggleMinimise();
  };

  const handleStyleChange = async (newStyle) => {
    setRibbonStyle(newStyle);
    
    try {
      await setRibbonPrefs({
        minimised: isMinimised,
        qatPosition,
        style: newStyle
      });
    } catch (error) {
      console.warn('Failed to save ribbon style:', error);
    }
  };

  const openGroupDialog = (title, content) => {
    setGroupDialog({ isOpen: true, title, content });
  };

  const closeGroupDialog = () => {
    setGroupDialog({ isOpen: false, title: '', content: null });
  };

  const handleUndo = () => {
    // Implement undo functionality
    console.log('Undo action');
  };

  const handleRedo = () => {
    // Implement redo functionality
    console.log('Redo action');
  };

  const handleSave = () => {
    // Implement save functionality
    console.log('Save action');
  };

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
      className='pm-ribbon-wrap'
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

      {/* Tab strip */}
      <div className='pm-ribbon__tabs'>
        {/* File Button (Backstage) */}
        <button
          onClick={handleBackstageToggle}
          className={`tab ${isBackstageOpen ? 'active' : ''}`}
          tabIndex={0}
          title="File - Access file operations and settings"
          aria-selected={isBackstageOpen}
        >
          File
        </button>
        
        {/* Style Options Button */}
        <StyleOptions onStyleChange={handleStyleChange} />
        
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            onDoubleClick={handleTabDoubleClick}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            tabIndex={0}
            title={`${tab} - Switch to ${tab} tab`}
            aria-selected={activeTab === tab}
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

      {/* Groups tray */}
      <div className={`pm-ribbon__tray ${isMinimised ? 'pm-ribbon--min' : ''}`}>
        <div className='pm-ribbon__row'>
          {renderTabContent()}
        </div>
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
