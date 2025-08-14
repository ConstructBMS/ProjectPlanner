// eslint-disable-next-line no-unused-vars
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ChevronUpIcon, ChevronDownIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { usePlannerStore } from '../../state/plannerStore';
import { columns, defaultSort } from './columns';
import './TaskGrid.css';

const TaskGrid = () => {
  const { tasks, mutateTask, selectedTaskIds, selectOne, toggleSelection, selectRange, lastSelectedTaskId } = usePlannerStore();
  const [sortConfig, setSortConfig] = useState(defaultSort);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingColumn, setEditingColumn] = useState(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef(null);
  const progressTimeoutRef = useRef(null);

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

  // Handle row click for selection
  const handleRowClick = useCallback((e, taskId) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.shiftKey && lastSelectedTaskId) {
      // Range selection
      selectRange(lastSelectedTaskId, taskId);
    } else if (e.ctrlKey || e.metaKey) {
      // Toggle selection
      toggleSelection(taskId);
    } else {
      // Single selection
      selectOne(taskId);
    }
  }, [selectOne, toggleSelection, selectRange, lastSelectedTaskId]);

  // Handle inline rename start
  const handleRenameStart = useCallback((taskId, currentName) => {
    setEditingTaskId(taskId);
    setEditingColumn('name');
    setEditValue(currentName || '');
  }, []);

  // Handle inline rename commit
  const handleRenameCommit = useCallback(async () => {
    if (editingTaskId && editValue.trim() && editingColumn === 'name') {
      try {
        await mutateTask(editingTaskId, { name: editValue.trim() });
      } catch (error) {
        console.error('Failed to update task name:', error);
      }
    }
    setEditingTaskId(null);
    setEditingColumn(null);
    setEditValue('');
  }, [editingTaskId, editValue, editingColumn, mutateTask]);

  // Handle inline rename cancel
  const handleRenameCancel = useCallback(() => {
    setEditingTaskId(null);
    setEditingColumn(null);
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

  // Handle progress stepper
  const handleProgressChange = useCallback(async (taskId, newProgress) => {
    // Clamp progress between 0 and 100
    const clampedProgress = Math.max(0, Math.min(100, newProgress));

    // Clear existing timeout
    if (progressTimeoutRef.current) {
      clearTimeout(progressTimeoutRef.current);
    }

    // Debounce the save
    progressTimeoutRef.current = setTimeout(async () => {
      try {
        await mutateTask(taskId, { progress: clampedProgress });
      } catch (error) {
        console.error('Failed to update task progress:', error);
      }
    }, 250);
  }, [mutateTask]);

  // Handle progress stepper buttons
  const handleProgressStep = useCallback((taskId, currentProgress, step) => {
    const newProgress = currentProgress + step;
    handleProgressChange(taskId, newProgress);
  }, [handleProgressChange]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingTaskId && editingColumn === 'name' && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTaskId, editingColumn]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }
    };
  }, []);

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
    // Handle inline editing for name column
    if (column.id === 'name' && editingTaskId === task.id && editingColumn === 'name') {
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
    
    // Handle progress column with stepper
    if (column.id === 'progress') {
      const progress = task.progress || 0;
      return (
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleProgressStep(task.id, progress, -5);
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Decrease by 5%"
            >
              <MinusIcon className="w-3 h-3 text-gray-600" />
            </button>
            <span className="text-sm text-gray-600 min-w-[2.5rem] text-right">
              {progress}%
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleProgressStep(task.id, progress, 5);
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Increase by 5%"
            >
              <PlusIcon className="w-3 h-3 text-gray-600" />
            </button>
          </div>
        </div>
      );
    }
    
    // Handle name column with double-click to edit
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
        {sortedTasks.map((task) => {
          const isSelected = selectedTaskIds.has(task.id);
          return (
            <div 
              key={task.id} 
              className={`task-grid-row hover:bg-gray-50 ${isSelected ? 'selected' : ''}`}
              onClick={(e) => handleRowClick(e, task.id)}
            >
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
          );
        })}
      </div>

      {/* Footer */}
      <div className="task-grid-footer">
        <div className="text-sm text-gray-500">
          {sortedTasks.length} task{sortedTasks.length !== 1 ? 's' : ''}
          {selectedTaskIds.size > 0 && (
            <span className="ml-2 text-blue-600">
              • {selectedTaskIds.size} selected
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskGrid;
