 
import { useState, useRef, useEffect } from 'react';
import RibbonGroup from '../shared/RibbonGroup';
import RibbonButton from '../shared/RibbonButton';
import GroupDialogLauncher from '../GroupDialogLauncher';
import {
  PaintBrushIcon,
  TagIcon,
  ChevronDownIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { useViewContext } from '../../../context/ViewContext';
import { useTaskContext } from '../../../context/TaskContext';
import {
  getAvailableMilestoneShapes,
  getMilestoneShape,
  createMilestoneShapeComponent,
  getMilestoneShapeStats,
} from '../../../utils/milestoneShapeUtils.jsx';

const FormatTab = ({ onOpenGroupDialog }) => {
  const [gridFontMode, setGridFontMode] = useState('normal');
  const [barTextOptions, setBarTextOptions] = useState({
    taskName: true,
    id: false,
    percentComplete: false,
    start: false,
    finish: false
  });
  const [barTextMenuOpen, setBarTextMenuOpen] = useState(false);
  const [barTextMenuPosition, setBarTextMenuPosition] = useState({ x: 0, y: 0 });
  const barTextButtonRef = useRef(null);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const savedGridFont = localStorage.getItem('pm.format.gridFont');
        const savedBarText = localStorage.getItem('pm.format.barText');
        
        if (savedGridFont) {
          setGridFontMode(savedGridFont);
        }
        
        if (savedBarText) {
          setBarTextOptions(JSON.parse(savedBarText));
        }
      } catch (error) {
        console.warn('Failed to load format preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences when they change
  useEffect(() => {
    try {
      localStorage.setItem('pm.format.gridFont', gridFontMode);
    } catch (error) {
      console.warn('Failed to save grid font preference:', error);
    }
  }, [gridFontMode]);

  useEffect(() => {
    try {
      localStorage.setItem('pm.format.barText', JSON.stringify(barTextOptions));
    } catch (error) {
      console.warn('Failed to save bar text preference:', error);
    }
  }, [barTextOptions]);

  // Grid font size handlers
  const handleGridFontChange = (mode) => {
    setGridFontMode(mode);
    
    window.dispatchEvent(new window.CustomEvent('GRID_FONT_SET', {
      detail: { mode }
    }));
    
    console.log('Grid font mode changed to:', mode);
  };

  // Bar text menu handlers
  const handleOpenBarTextMenu = () => {
    if (barTextButtonRef.current) {
      const rect = barTextButtonRef.current.getBoundingClientRect();
      setBarTextMenuPosition({
        x: rect.left,
        y: rect.bottom + 4
      });
    }
    setBarTextMenuOpen(true);
  };



  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (barTextButtonRef.current && !barTextButtonRef.current.contains(event.target)) {
        setBarTextMenuOpen(false);
      }
    };

    if (barTextMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [barTextMenuOpen]);

  const handleBarTextOptionChange = (option, checked) => {
    const newOptions = { ...barTextOptions, [option]: checked };
    setBarTextOptions(newOptions);
    
    window.dispatchEvent(new window.CustomEvent('FORMAT_BAR_TEXT_SET', {
      detail: { options: newOptions }
    }));
    
    console.log('Bar text options updated:', newOptions);
  };

  // Bar text menu items
  const barTextMenuItems = [
    {
      id: 'taskName',
      label: 'Task Name',
      checked: barTextOptions.taskName,
      onChange: (checked) => handleBarTextOptionChange('taskName', checked)
    },
    {
      id: 'id',
      label: 'ID',
      checked: barTextOptions.id,
      onChange: (checked) => handleBarTextOptionChange('id', checked)
    },
    {
      id: 'percentComplete',
      label: '% Complete',
      checked: barTextOptions.percentComplete,
      onChange: (checked) => handleBarTextOptionChange('percentComplete', checked)
    },
    {
      id: 'start',
      label: 'Start',
      checked: barTextOptions.start,
      onChange: (checked) => handleBarTextOptionChange('start', checked)
    },
    {
      id: 'finish',
      label: 'Finish',
      checked: barTextOptions.finish,
      onChange: (checked) => handleBarTextOptionChange('finish', checked)
    }
  ];

  return (
    <div className='flex flex-nowrap gap-0 p-2 bg-white w-full min-w-0'>
      {/* Fonts Group */}
      <RibbonGroup title='Fonts'>
        <RibbonButton
          icon={<span className="text-xs font-bold">A−</span>}
          label='Compact'
          onClick={() => handleGridFontChange('compact')}
          tooltip='Compact grid font size'
          disabled={gridFontMode === 'compact'}
        />
        <RibbonButton
          icon={<span className="text-sm font-bold">A</span>}
          label='Normal'
          onClick={() => handleGridFontChange('normal')}
          tooltip='Normal grid font size (default)'
          disabled={gridFontMode === 'normal'}
        />
        <RibbonButton
          icon={<span className="text-base font-bold">A+</span>}
          label='Comfortable'
          onClick={() => handleGridFontChange('comfortable')}
          tooltip='Comfortable grid font size'
          disabled={gridFontMode === 'comfortable'}
        />
      </RibbonGroup>

      {/* Labels Group */}
      <RibbonGroup title='Labels'>
        <div className="relative" ref={barTextButtonRef}>
          <button
            onClick={handleOpenBarTextMenu}
            className='flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            title='Configure bar text display options'
          >
            <DocumentTextIcon className='w-4 h-4 text-gray-700' />
            <span className='text-gray-700'>Bar Text</span>
            <ChevronDownIcon className='w-3 h-3 text-gray-500' />
          </button>
        </div>
      </RibbonGroup>

      {/* Bar Styles Group */}
      <RibbonGroup title='Bar Styles' className="ribbon-group">
        <RibbonButton
          icon={PaintBrushIcon}
          label='Bar Styles'
          description='Configure custom Gantt bar styles'
          onClick={() => {
            // This would typically open a modal or panel
            console.log('Open Bar Style Editor');
          }}
        />
        <GroupDialogLauncher
          groupName="Bar Styles"
          onClick={() => onOpenGroupDialog?.('Bar Styles Options', (
            <div className="space-y-4">
              <p className="text-gray-300">Extended bar style configuration options will be available here.</p>
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Available Features:</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Custom bar colors and patterns</li>
                  <li>• Progress visualization styles</li>
                  <li>• Milestone shape customization</li>
                  <li>• Bar thickness and spacing</li>
                </ul>
              </div>
            </div>
          ))}
        />
      </RibbonGroup>

      {/* Bar Labels Group */}
      <RibbonGroup title='Bar Labels' className="ribbon-group">
        <RibbonButton
          icon={TagIcon}
          label='Bar Labels'
          description='Configure custom Gantt bar labels'
          onClick={() => {
            // This would typically open a modal or panel
            console.log('Open Bar Label Editor');
          }}
        />
        <GroupDialogLauncher
          groupName="Bar Labels"
          onClick={() => onOpenGroupDialog?.('Bar Labels Options', (
            <div className="space-y-4">
              <p className="text-gray-300">Extended bar label configuration options will be available here.</p>
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Available Features:</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Custom label positioning</li>
                  <li>• Font styles and colors</li>
                  <li>• Label content templates</li>
                  <li>• Conditional label display</li>
                </ul>
              </div>
            </div>
          ))}
        />
      </RibbonGroup>

      {/* Milestone Shapes Group */}
      <RibbonGroup title='Milestone Shapes'>
        <MilestoneShapeDropdown />
      </RibbonGroup>

      {/* Bar Text Menu */}
      {barTextMenuOpen && (
        <div
          className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-48"
          style={{
            left: barTextMenuPosition.x,
            top: barTextMenuPosition.y
          }}
        >
          <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-200">
            Bar Text Options
          </div>
          {barTextMenuItems.map((item) => (
            <label
              key={item.id}
              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => item.onChange(e.target.checked)}
                className="mr-3 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{item.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};



const MilestoneShapeDropdown = () => {
  const { viewState, setGlobalMilestoneShape } = useViewContext();
  const { tasks } = useTaskContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShapeSelect = shapeKey => {
    setGlobalMilestoneShape(shapeKey);
    setIsOpen(false);
  };

  const getCurrentShape = () => {
    return getMilestoneShape(viewState.globalMilestoneShape);
  };

  const getMilestoneStats = () => {
    return getMilestoneShapeStats(tasks);
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        title='Select milestone shape for all milestones'
      >
        <div className='w-4 h-4'>
          {createMilestoneShapeComponent(
            viewState.globalMilestoneShape,
            'w-4 h-4',
            getCurrentShape().defaultColor
          )}
        </div>
        <span className='text-gray-700'>{getCurrentShape().label}</span>
        <ChevronDownIcon className='w-3 h-3 text-gray-500' />
      </button>

      {isOpen && (
        <div className='absolute top-full left-0 mt-1 z-50 bg-white border border-gray-300 rounded-md shadow-lg min-w-48'>
          <div className='py-1'>
            <div className='px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-200'>
              Milestone Shapes
            </div>
            {getAvailableMilestoneShapes().map(shape => (
              <button
                key={shape.key}
                onClick={() => handleShapeSelect(shape.key)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  viewState.globalMilestoneShape === shape.key
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700'
                }`}
              >
                <div className='flex items-center space-x-3'>
                  <div className='w-5 h-5'>
                    {createMilestoneShapeComponent(
                      shape.key,
                      'w-5 h-5',
                      shape.defaultColor
                    )}
                  </div>
                  <div>
                    <div className='font-medium'>{shape.label}</div>
                    <div className='text-xs text-gray-500'>
                      {shape.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
            <div className='border-t border-gray-200 mt-1 px-3 py-2'>
              <div className='text-xs text-gray-500'>
                {getMilestoneStats().total} milestones in project
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormatTab;
