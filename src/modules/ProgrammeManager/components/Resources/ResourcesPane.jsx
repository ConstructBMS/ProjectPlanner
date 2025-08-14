 
import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const ResourcesPane = ({ isVisible, onClose, width = 320, onWidthChange }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(width);
  const resizeRef = useRef(null);
  const minWidth = 260;

  // Mock resources data (will be replaced with real data later)
  const mockResources = [
    { id: 'r1', name: 'John Smith', role: 'Developer', availability: 100, assignedTasks: 3 },
    { id: 'r2', name: 'Jane Doe', role: 'Designer', availability: 80, assignedTasks: 2 },
    { id: 'r3', name: 'Mike Johnson', role: 'Project Manager', availability: 100, assignedTasks: 1 },
    { id: 'r4', name: 'Sarah Wilson', role: 'QA Engineer', availability: 90, assignedTasks: 4 },
    { id: 'r5', name: 'Tom Brown', role: 'Developer', availability: 75, assignedTasks: 2 },
  ];

  // Update current width when prop changes
  useEffect(() => {
    setCurrentWidth(width);
  }, [width]);

  // Handle resize start
  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  // Handle resize move
  useEffect(() => {
    const handleResizeMove = (e) => {
      if (!isResizing) return;

      const newWidth = window.innerWidth - e.clientX;
      const clampedWidth = Math.max(minWidth, Math.min(500, newWidth));
      
      setCurrentWidth(clampedWidth);
      if (onWidthChange) {
        onWidthChange(clampedWidth);
      }
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing, onWidthChange]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed top-0 right-0 h-full bg-white border-l border-gray-200 shadow-lg z-40 flex flex-col"
      style={{ width: currentWidth }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <UserGroupIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Resources</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Resource Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-blue-700">Total Resources:</span>
                <span className="ml-1 font-medium text-blue-900">{mockResources.length}</span>
              </div>
              <div>
                <span className="text-blue-700">Avg Availability:</span>
                <span className="ml-1 font-medium text-blue-900">
                  {Math.round(mockResources.reduce((sum, r) => sum + r.availability, 0) / mockResources.length)}%
                </span>
              </div>
            </div>
          </div>

          {/* Resource List */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">All Resources</h4>
            <div className="space-y-2">
              {mockResources.map(resource => (
                <div
                  key={resource.id}
                  className="bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{resource.name}</div>
                      <div className="text-sm text-gray-500">{resource.role}</div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="text-sm font-medium text-gray-900">{resource.availability}%</div>
                      <div className="text-xs text-gray-500">{resource.assignedTasks} tasks</div>
                    </div>
                  </div>
                  
                  {/* Availability bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Availability</span>
                      <span>{resource.availability}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          resource.availability >= 80 ? 'bg-green-500' :
                          resource.availability >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${resource.availability}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 transition-colors">
                • Add New Resource
              </button>
              <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 transition-colors">
                • Import Resources
              </button>
              <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 transition-colors">
                • Export Resource Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resize Handle */}
      <div
        ref={resizeRef}
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
        onMouseDown={handleResizeStart}
      />
    </div>
  );
};

export default ResourcesPane;
