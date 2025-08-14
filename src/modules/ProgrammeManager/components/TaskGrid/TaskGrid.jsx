import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { usePlannerStore } from '../../state/plannerStore';
import { columns, defaultSort } from './columns';
import './TaskGrid.css';

const TaskGrid = () => {
  const { tasks, renameTask } = usePlannerStore();
  const [sortConfig, setSortConfig] = useState(defaultSort);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef(null);

  // Sort tasks based on current sort configuration
  const sortedTasks = useMemo(() => {
    const sorted = [...tasks];
    const column = columns.find(col => col.id === sortConfig.columnId);
    
    if (column && column.sortValue) {
      sorted.sort((a, b) => {
        const aValue = column.sortValue(a);
        const bValue = column.sortValue(b);
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return sorted;
  }, [tasks, sortConfig]);

  // Handle column header click for sorting
  const handleColumnClick = useCallback((columnId) => {
    const column = columns.find(col => col.id === columnId);
    if (!column?.sortable) return;

    setSortConfig(prev => ({
      columnId,
      direction: prev.columnId === columnId && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Handle inline rename start
  const handleRenameStart = useCallback((taskId, currentName) => {
    setEditingTaskId(taskId);
    setEditValue(currentName);
  }, []);

  // Handle inline rename commit
  const handleRenameCommit = useCallback(() => {
    if (editingTaskId && editValue.trim()) {
      renameTask(editingTaskId, editValue.trim());
      
      // Emit start event for future backend integration
      window.dispatchEvent(new window.CustomEvent('TASK_RENAME_START', {
        detail: { taskId: editingTaskId }
      }));
    }
    setEditingTaskId(null);
    setEditValue('');
  }, [editingTaskId, editValue, renameTask]);

  // Handle inline rename cancel
  const handleRenameCancel = useCallback(() => {
    setEditingTaskId(null);
    setEditValue('');
  }, []);

  // Handle key press in edit input
  const handleEditKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleRenameCommit();
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  }, [handleRenameCommit, handleRenameCancel]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingTaskId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTaskId]);

  // Render sort indicator
  const renderSortIndicator = (columnId) => {
    if (sortConfig.columnId !== columnId) {
      return <div className="w-4 h-4" />;
    }
    
    return sortConfig.direction === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4 text-gray-500" />
    ) : (
      <ChevronDownIcon className="w-4 h-4 text-gray-500" />
    );
  };

  // Render cell content
  const renderCell = (task, column) => {
    if (column.id === 'name' && editingTaskId === task.id) {
      return (
        <input
          ref={editInputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleEditKeyPress}
          onBlur={handleRenameCommit}
          className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      );
    }
    
    if (column.id === 'name') {
      return (
        <div
          className="w-full cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
          onDoubleClick={() => handleRenameStart(task.id, task.name)}
        >
          {column.render(task)}
        </div>
      );
    }
    
    return column.render(task);
  };

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-lg font-medium">No tasks found</div>
          <div className="text-sm">Select a project to view its tasks</div>
        </div>
      </div>
    );
  }

  return (
    <div className="task-grid-container">
      {/* Header */}
      <div className="task-grid-header">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`task-grid-header-cell ${column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
            style={{ minWidth: column.minWidth }}
            onClick={() => handleColumnClick(column.id)}
          >
            <div className="flex items-center space-x-1">
              <span className="font-medium text-gray-700">{column.label}</span>
              {column.sortable && renderSortIndicator(column.id)}
            </div>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="task-grid-body">
        {sortedTasks.map((task) => (
          <div key={task.id} className="task-grid-row hover:bg-gray-50">
            {columns.map((column) => (
              <div
                key={`${task.id}-${column.id}`}
                className="task-grid-cell"
                style={{ minWidth: column.minWidth }}
              >
                {renderCell(task, column)}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="task-grid-footer">
        <div className="text-sm text-gray-500">
          {sortedTasks.length} task{sortedTasks.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default TaskGrid;
