import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, CubeIcon, DocumentArrowUpIcon, LinkIcon } from '@heroicons/react/24/outline';

const ModelPanel = ({ isVisible, onClose, width = 320, onWidthChange, position = 'bottom' }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(width);
  const [isDragOver, setIsDragOver] = useState(false);
  const [linkedTasks, setLinkedTasks] = useState([]);
  const resizeRef = useRef(null);
  const fileInputRef = useRef(null);
  const minWidth = 260;

  // Mock linked tasks data (will be replaced with real data later)
  const mockLinkedTasks = [
    { id: 't1', name: 'Foundation Work', elementId: 'wall_001', elementName: 'Foundation Wall A', linkedAt: '2024-01-15T10:30:00Z' },
    { id: 't2', name: 'Steel Frame', elementId: 'column_002', elementName: 'Steel Column B', linkedAt: '2024-01-16T14:20:00Z' },
    { id: 't3', name: 'Roof Installation', elementId: 'roof_003', elementName: 'Roof Panel C', linkedAt: '2024-01-17T09:15:00Z' },
  ];

  // Update current width when prop changes
  useEffect(() => {
    setCurrentWidth(width);
  }, [width]);

  // Load linked tasks on mount
  useEffect(() => {
    setLinkedTasks(mockLinkedTasks);
  }, []);

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

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const modelFiles = files.filter(file => 
      file.name.toLowerCase().endsWith('.ifc') || 
      file.name.toLowerCase().endsWith('.glb') ||
      file.name.toLowerCase().endsWith('.gltf')
    );
    
    if (modelFiles.length > 0) {
      console.log('Model files dropped:', modelFiles.map(f => f.name));
      // TODO: Handle file upload and model loading
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const modelFiles = files.filter(file => 
      file.name.toLowerCase().endsWith('.ifc') || 
      file.name.toLowerCase().endsWith('.glb') ||
      file.name.toLowerCase().endsWith('.gltf')
    );
    
    if (modelFiles.length > 0) {
      console.log('Model files selected:', modelFiles.map(f => f.name));
      // TODO: Handle file upload and model loading
    }
  };

  const handleRemoveLinkedTask = (taskId) => {
    setLinkedTasks(prev => prev.filter(task => task.id !== taskId));
    console.log('Removed linked task:', taskId);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed right-0 bg-white border-l border-gray-200 shadow-lg z-30 flex flex-col"
      style={{ 
        width: currentWidth,
        top: position === 'bottom' ? '50%' : '0',
        height: position === 'bottom' ? '50%' : '100%'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <CubeIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">3D Model</h3>
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
          {/* File Upload Zone */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Model Files</h4>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <DocumentArrowUpIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">
                Drop IFC, GLB, or GLTF files here
              </p>
              <p className="text-xs text-gray-500 mb-4">
                or click to browse files
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Browse Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".ifc,.glb,.gltf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Linked Tasks */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Linked Tasks</h4>
            {linkedTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <LinkIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No tasks linked to model elements</p>
                <p className="text-sm">Select tasks and use "Link to Selection" to connect them</p>
              </div>
            ) : (
              <div className="space-y-2">
                {linkedTasks.map(task => (
                  <div
                    key={task.id}
                    className="bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{task.name}</div>
                        <div className="text-sm text-gray-500">{task.elementName}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Linked: {new Date(task.linkedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveLinkedTask(task.id)}
                        className="ml-2 p-1 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Model Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Model Information</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-medium text-yellow-600">No model loaded</span>
              </div>
              <div className="flex justify-between">
                <span>Linked Tasks:</span>
                <span className="font-medium">{linkedTasks.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Elements:</span>
                <span className="font-medium">0</span>
              </div>
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

export default ModelPanel;
