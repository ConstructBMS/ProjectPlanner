import { useState, useEffect, useRef } from 'react';
import { getStorage, setStorage } from '../../utils/persistentStorage.js';
import './Backstage.css';

const BackstageView = ({ isOpen, onClose }) => {
  const [selectedItem, setSelectedItem] = useState('Info');
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  // Load last selected item from persistent storage
  useEffect(() => {
    if (isOpen) {
      const loadSavedItem = async () => {
        const savedItem = await getStorage('pm.backstage.selected');
        if (savedItem) {
          setSelectedItem(savedItem);
        }
      };
      loadSavedItem();
    }
  }, [isOpen]);

  // Save selected item to persistent storage
  const handleItemSelect = async (item) => {
    setSelectedItem(item);
    await setStorage('pm.backstage.selected', item);
  };

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus trap: focus the overlay when it opens
      if (overlayRef.current) {
        overlayRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle tab trap for accessibility
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      const focusableElements = overlayRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
  };

  // Rail items configuration
  const railItems = [
    { id: 'Info', label: 'Info' },
    { id: 'New', label: 'New' },
    { id: 'Open', label: 'Open…' },
    { id: 'Save', label: 'Save' },
    { id: 'Export', label: 'Export…' },
    { id: 'Print', label: 'Print' },
    { id: 'Options', label: 'Options' },
    { id: 'Close', label: 'Close' }
  ];

  // Render content based on selected item
  const renderContent = () => {
    const contentMap = {
      Info: {
        title: 'Project Information',
        description: 'View and edit project details, properties, and metadata.',
        items: [
          { label: 'Project Name', value: 'Sample Project' },
          { label: 'Project Code', value: 'PRJ-001' },
          { label: 'Start Date', value: '2024-01-15' },
          { label: 'End Date', value: '2024-12-31' },
          { label: 'Status', value: 'Active' },
          { label: 'Manager', value: 'John Doe' }
        ]
      },
      New: {
        title: 'Create New Project',
        description: 'Start a new project from templates or scratch.',
        items: [
          { label: 'Blank Project', description: 'Start with an empty project' },
          { label: 'From Template', description: 'Use a predefined template' },
          { label: 'From Existing', description: 'Copy from another project' },
          { label: 'Import from File', description: 'Import from external file' }
        ]
      },
      Open: {
        title: 'Open Project',
        description: 'Open an existing project from local storage or cloud.',
        items: [
          { label: 'Recent Projects', description: 'Recently opened projects' },
          { label: 'Browse Files', description: 'Open from file system' },
          { label: 'Cloud Storage', description: 'Open from cloud storage' },
          { label: 'Shared Projects', description: 'Projects shared with you' }
        ]
      },
      Save: {
        title: 'Save Project',
        description: 'Save your current project to local storage or cloud.',
        items: [
          { label: 'Save', description: 'Save to current location' },
          { label: 'Save As', description: 'Save to new location' },
          { label: 'Save to Cloud', description: 'Save to cloud storage' },
          { label: 'Auto-save Settings', description: 'Configure auto-save' }
        ]
      },
      Export: {
        title: 'Export Project',
        description: 'Export project data in various formats.',
        items: [
          { label: 'PDF Report', description: 'Export as PDF document' },
          { label: 'Excel Spreadsheet', description: 'Export to Excel format' },
          { label: 'CSV Data', description: 'Export as CSV file' },
          { label: 'Image Export', description: 'Export charts as images' }
        ]
      },
      Print: {
        title: 'Print Project',
        description: 'Print project reports and charts.',
        items: [
          { label: 'Print Preview', description: 'Preview before printing' },
          { label: 'Print Settings', description: 'Configure print options' },
          { label: 'Page Setup', description: 'Set page layout and margins' },
          { label: 'Print to PDF', description: 'Save as PDF for printing' }
        ]
      },
      Options: {
        title: 'Project Options',
        description: 'Configure project settings and preferences.',
        items: [
          { label: 'General Settings', description: 'Basic project settings' },
          { label: 'Calendar Settings', description: 'Working days and hours' },
          { label: 'Resource Settings', description: 'Resource management options' },
          { label: 'Display Settings', description: 'UI and view preferences' }
        ]
      },
      Close: {
        title: 'Close Project',
        description: 'Close the current project and return to start screen.',
        items: [
          { label: 'Save and Close', description: 'Save changes and close' },
          { label: 'Close Without Saving', description: 'Discard changes and close' },
          { label: 'Exit Application', description: 'Close the entire application' },
          { label: 'Switch Project', description: 'Open a different project' }
        ]
      }
    };

    const content = contentMap[selectedItem];
    if (!content) return null;

    return (
      <div className="backstage-content">
        <div className="backstage-content-header">
          <h2 className="backstage-content-title">{content.title}</h2>
          <p className="backstage-content-description">{content.description}</p>
        </div>
        
        <div className="backstage-content-body">
          {content.items.map((item, index) => (
            <div key={`backstage-item-${index}`} className="backstage-content-item">
              <div className="backstage-item-header">
                <h3 className="backstage-item-title">{item.label}</h3>
                {item.value && (
                  <span className="backstage-item-value">{item.value}</span>
                )}
              </div>
              {item.description && (
                <p className="backstage-item-description">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="backstage-overlay"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="backstage-title"
    >
      {/* Header */}
      <div className="backstage-header">
        <button
          onClick={onClose}
          className="backstage-back-button"
          aria-label="Back to ribbon"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 id="backstage-title" className="backstage-title">
          File
        </h1>
      </div>

      {/* Main Content */}
      <div className="backstage-main">
        {/* Left Rail */}
        <div className="backstage-rail">
          {railItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemSelect(item.id)}
              className={`backstage-rail-item ${selectedItem === item.id ? 'active' : ''}`}
              tabIndex={0}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right Content Panel */}
        <div ref={contentRef} className="backstage-panel">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default BackstageView;
