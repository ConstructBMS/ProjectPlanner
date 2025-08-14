 
import { useState, useEffect } from 'react';
import { useSelectionContext } from '../../../context/SelectionContext';
import RibbonButton from '../shared/RibbonButton';
import RibbonGroup from '../shared/RibbonGroup';
import {
  EyeIcon,
  EyeSlashIcon,
  LinkIcon,
  LinkSlashIcon,
} from '@heroicons/react/24/outline';

const FourDTab = () => {
  const { selectedTasks } = useSelectionContext();
  
  // State for model panel visibility
  const [modelPanelVisible, setModelPanelVisible] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const visible = localStorage.getItem('pm.4d.panel.visible');
        if (visible !== null) {
          setModelPanelVisible(visible === 'true');
        }
      } catch (error) {
        console.warn('Failed to load 4D preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences when they change
  useEffect(() => {
    try {
      localStorage.setItem('pm.4d.panel.visible', modelPanelVisible.toString());
    } catch (error) {
      console.warn('Failed to save 4D panel visibility preference:', error);
    }
  }, [modelPanelVisible]);

  // Toggle model panel visibility
  const handleToggleModelPanel = () => {
    setModelPanelVisible(prev => !prev);
    
    // Emit event for the main app to handle panel visibility
    window.dispatchEvent(new window.CustomEvent('MODEL_PANEL_TOGGLE', {
      detail: { visible: !modelPanelVisible }
    }));
  };

  // Link to selection handler
  const handleLinkToSelection = () => {
    if (!selectedTasks || selectedTasks.length === 0) {
      return;
    }

    window.dispatchEvent(new window.CustomEvent('FOURD_LINK_SELECTION', {
      detail: {
        taskIds: selectedTasks,
        timestamp: new Date().toISOString()
      }
    }));

    console.log('4D Link to Selection:', selectedTasks);
  };

  // Unlink handler
  const handleUnlink = () => {
    if (!selectedTasks || selectedTasks.length === 0) {
      return;
    }

    window.dispatchEvent(new window.CustomEvent('FOURD_UNLINK_SELECTION', {
      detail: {
        taskIds: selectedTasks,
        timestamp: new Date().toISOString()
      }
    }));

    console.log('4D Unlink Selection:', selectedTasks);
  };

  // Check if enough tasks are selected
  const hasSelectedTasks = selectedTasks && selectedTasks.length > 0;

  return (
    <div className='flex flex-nowrap gap-0 p-2 bg-white w-full min-w-0'>
      {/* Model Group */}
      <RibbonGroup title='Model'>
        <RibbonButton
          icon={modelPanelVisible ? <EyeSlashIcon className='w-4 h-4 text-gray-700' /> : <EyeIcon className='w-4 h-4 text-gray-700' />}
          label={modelPanelVisible ? 'Hide Model' : 'Show Model'}
          onClick={handleToggleModelPanel}
          tooltip={modelPanelVisible ? 'Hide Model Panel' : 'Show Model Panel'}
        />
      </RibbonGroup>

      {/* Links Group */}
      <RibbonGroup title='Links'>
        <RibbonButton
          icon={<LinkIcon className='w-4 h-4 text-gray-700' />}
          label='Link to Selection'
          onClick={handleLinkToSelection}
          tooltip='Link selected tasks to 3D model elements'
          disabled={!hasSelectedTasks}
        />
        <RibbonButton
          icon={<LinkSlashIcon className='w-4 h-4 text-gray-700' />}
          label='Unlink'
          onClick={handleUnlink}
          tooltip='Unlink selected tasks from 3D model elements'
          disabled={!hasSelectedTasks}
        />
      </RibbonGroup>
    </div>
  );
};

export default FourDTab;
