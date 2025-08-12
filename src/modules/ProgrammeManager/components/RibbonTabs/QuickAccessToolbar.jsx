import { useState, useEffect } from 'react';
import RibbonButton from './shared/RibbonButton';
import { getRibbonPrefs, setRibbonPrefs } from '../../utils/ribbonStorage';

const QuickAccessToolbar = ({ 
  position = 'above', 
  onPositionChange,
  onUndo,
  onRedo,
  onSave 
}) => {
  const [showPositionMenu, setShowPositionMenu] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(position);

  // Load position from storage on mount
  useEffect(() => {
    const loadPosition = async () => {
      try {
        const prefs = await getRibbonPrefs();
        if (prefs?.qatPosition && (prefs.qatPosition === 'above' || prefs.qatPosition === 'below')) {
          setCurrentPosition(prefs.qatPosition);
          onPositionChange?.(prefs.qatPosition);
        }
      } catch (error) {
        console.warn('Failed to load QAT position:', error);
      }
    };

    loadPosition();
  }, [onPositionChange]);

  // Save position to storage when changed
  const handlePositionChange = async (newPosition) => {
    setCurrentPosition(newPosition);
    
    try {
      await setRibbonPrefs({
        minimised: false, // We don't have access to this here, but it will be merged
        qatPosition: newPosition,
        style: undefined // We don't have access to this here, but it will be merged
      });
    } catch (error) {
      console.warn('Failed to save QAT position:', error);
    }
    
    onPositionChange?.(newPosition);
    setShowPositionMenu(false);
  };

  // Handle button actions
  const handleUndo = () => {
    if (onUndo) {
      onUndo();
    } else {
      console.info('Undo action triggered');
    }
  };

  const handleRedo = () => {
    if (onRedo) {
      onRedo();
    } else {
      console.info('Redo action triggered');
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    } else {
      console.info('Save action triggered');
    }
  };

  // Position menu items
  const positionMenuItems = [
    {
      id: 'above',
      label: 'Show Above Ribbon',
      icon: '⬆️',
      onClick: () => handlePositionChange('above')
    },
    {
      id: 'below',
      label: 'Show Below Ribbon',
      icon: '⬇️',
      onClick: () => handlePositionChange('below')
    }
  ];

  return (
    <div className={`quick-access-toolbar ${currentPosition}`}>
      <div className="qat-buttons">
        <RibbonButton
          icon="↶"
          label="Undo"
          onClick={handleUndo}
          tooltip="Undo (Ctrl+Z)"
          compact={true}
          className="qat-button"
        />
        
        <RibbonButton
          icon="↷"
          label="Redo"
          onClick={handleRedo}
          tooltip="Redo (Ctrl+Y)"
          compact={true}
          className="qat-button"
        />
        
        <RibbonButton
          icon="💾"
          label="Save"
          onClick={handleSave}
          tooltip="Save (Ctrl+S)"
          compact={true}
          className="qat-button"
        />
      </div>
      
      <div className="qat-position-toggle">
        <RibbonButton
          icon="▼"
          label=""
          onClick={() => setShowPositionMenu(!showPositionMenu)}
          tooltip="Quick Access Toolbar Options"
          compact={true}
          className="qat-toggle-button"
          menuItems={positionMenuItems}
          onMenuSelect={(item) => item.onClick()}
        />
      </div>
    </div>
  );
};

export default QuickAccessToolbar;
