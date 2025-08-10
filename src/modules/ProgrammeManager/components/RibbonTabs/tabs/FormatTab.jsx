import React, { useState, useRef, useEffect } from 'react';
import { RibbonGroup, RibbonButton } from '../../RibbonComponents';
import { PaintBrushIcon, TagIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useViewContext } from '../../../context/ViewContext';
import { useTaskContext } from '../../../context/TaskContext';
import {
  getAvailableMilestoneShapes,
  getMilestoneShape,
  createMilestoneShapeComponent,
  applyGlobalMilestoneShape,
  getMilestoneShapeStats,
} from '../../../utils/milestoneShapeUtils';

const FormatTab = ({ tasks, userSettings, onSettingsUpdate }) => {
  return (
    <div className='flex flex-nowrap gap-0 p-2 bg-white w-full min-w-0'>
      {/* Bar Styles Group */}
      <RibbonGroup title='Bar Styles'>
        <RibbonButton
          icon={PaintBrushIcon}
          label='Bar Styles'
          description='Configure custom Gantt bar styles'
          onClick={() => {
            // This would typically open a modal or panel
            console.log('Open Bar Style Editor');
          }}
        />
      </RibbonGroup>

      {/* Bar Labels Group */}
      <RibbonGroup title='Bar Labels'>
        <RibbonButton
          icon={TagIcon}
          label='Bar Labels'
          description='Configure custom Gantt bar labels'
          onClick={() => {
            // This would typically open a modal or panel
            console.log('Open Bar Label Editor');
          }}
        />
      </RibbonGroup>

      {/* Milestone Shapes Group */}
      <RibbonGroup title='Milestone Shapes'>
        <MilestoneShapeDropdown />
      </RibbonGroup>
    </div>
  );
};

// Import the BarStyleEditor component
import BarStyleEditor from '../../BarStyleEditor';
import BarLabelEditor from '../../BarLabelEditor';

const MilestoneShapeDropdown = () => {
  const { viewState, setGlobalMilestoneShape } = useViewContext();
  const { tasks, updateTask } = useTaskContext();
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

  const handleShapeSelect = (shapeKey) => {
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
        <span className='text-gray-700'>
          {getCurrentShape().label}
        </span>
        <ChevronDownIcon className='w-3 h-3 text-gray-500' />
      </button>

      {isOpen && (
        <div className='absolute top-full left-0 mt-1 z-50 bg-white border border-gray-300 rounded-md shadow-lg min-w-48'>
          <div className='py-1'>
            <div className='px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-200'>
              Milestone Shapes
            </div>
            {getAvailableMilestoneShapes().map((shape) => (
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
