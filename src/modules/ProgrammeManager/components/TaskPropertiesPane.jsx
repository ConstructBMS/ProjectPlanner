import React from 'react';

// Task Properties Pane Component
const TaskPropertiesPane = () => {
  return (
    <div className='bg-gray-50 border-t border-gray-200 shadow-inner flex flex-col overflow-hidden h-full'>
      {/* Pane Header */}
      <div className='px-4 py-3 border-b border-gray-200 bg-white'>
        <h3 className='text-sm font-semibold text-gray-700'>Task Properties</h3>
        <p className='text-xs text-gray-500 mt-1'>Task details and settings</p>
      </div>

      {/* Pane Content */}
      <div className='flex-1 overflow-auto p-4'>
        <div className='text-center'>
          <div className='text-xl text-gray-400 mb-2'>⚙️</div>
          <div className='text-sm font-medium text-gray-600 mb-1'>
            Properties Panel
          </div>
          <div className='text-xs text-gray-500 mb-4'>
            Task details and settings will appear here
          </div>

          {/* Sample content to demonstrate scrolling */}
          <div className='space-y-3 text-left'>
            <div className='bg-white border border-gray-200 rounded p-3'>
              <div className='text-xs font-semibold text-gray-600 mb-1'>
                Task Information
              </div>
              <div className='text-xs text-gray-500'>
                Name, description, and basic details
              </div>
            </div>

            <div className='bg-white border border-gray-200 rounded p-3'>
              <div className='text-xs font-semibold text-gray-600 mb-1'>
                Schedule
              </div>
              <div className='text-xs text-gray-500'>
                Start date, end date, duration
              </div>
            </div>

            <div className='bg-white border border-gray-200 rounded p-3'>
              <div className='text-xs font-semibold text-gray-600 mb-1'>
                Resources
              </div>
              <div className='text-xs text-gray-500'>
                Assigned resources and costs
              </div>
            </div>

            <div className='bg-white border border-gray-200 rounded p-3'>
              <div className='text-xs font-semibold text-gray-600 mb-1'>
                Dependencies
              </div>
              <div className='text-xs text-gray-500'>
                Predecessors and successors
              </div>
            </div>

            <div className='bg-white border border-gray-200 rounded p-3'>
              <div className='text-xs font-semibold text-gray-600 mb-1'>
                Progress
              </div>
              <div className='text-xs text-gray-500'>
                Completion percentage and status
              </div>
            </div>

            <div className='bg-white border border-gray-200 rounded p-3'>
              <div className='text-xs font-semibold text-gray-600 mb-1'>
                Notes
              </div>
              <div className='text-xs text-gray-500'>
                Additional comments and notes
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPropertiesPane;
