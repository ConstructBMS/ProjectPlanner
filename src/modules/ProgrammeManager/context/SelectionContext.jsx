// eslint-disable-next-line no-unused-vars
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { useTaskContext } from './TaskContext';

const SelectionContext = createContext();

export const useSelectionContext = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error(
      'useSelectionContext must be used within a SelectionProvider'
    );
  }
  return context;
};

export const SelectionProvider = ({ children }) => {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectionAnchorId, setSelectionAnchorId] = useState(null);
  const [lastSelectedId, setLastSelectedId] = useState(null);

  // Get TaskContext functions to sync selection
  const { selectTask, clearSelection: clearTaskSelection } = useTaskContext();

  // Clear selection on Escape key
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        clearSelection();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Select a single task
  const selectSingle = useCallback(id => {
    setSelectedIds(new Set([id]));
    setSelectionAnchorId(id);
    setLastSelectedId(id);
    // Also update TaskContext for TaskPropertiesPane
    selectTask(id);
  }, [selectTask]);

  // Toggle selection of a single task
  const toggleSelection = useCallback(id => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
    setSelectionAnchorId(id);
    setLastSelectedId(id);
    // Also update TaskContext for TaskPropertiesPane
    selectTask(id);
  }, [selectTask]);

  // Select a range of tasks
  const selectRange = useCallback(
    (anchorId, targetId, taskIds) => {
      if (!anchorId || !targetId) {
        selectSingle(targetId);
        return;
      }

      const anchorIndex = taskIds.indexOf(anchorId);
      const targetIndex = taskIds.indexOf(targetId);

      if (anchorIndex === -1 || targetIndex === -1) {
        selectSingle(targetId);
        return;
      }

      const startIndex = Math.min(anchorIndex, targetIndex);
      const endIndex = Math.max(anchorIndex, targetIndex);
      const rangeIds = taskIds.slice(startIndex, endIndex + 1);

      setSelectedIds(new Set(rangeIds));
      setLastSelectedId(targetId);
      // Also update TaskContext for TaskPropertiesPane (select the last clicked task)
      selectTask(targetId);
    },
    [selectSingle, selectTask]
  );

  // Add task to selection
  const addToSelection = useCallback(id => {
    setSelectedIds(prev => new Set([...prev, id]));
    setLastSelectedId(id);
    // Also update TaskContext for TaskPropertiesPane
    selectTask(id);
  }, [selectTask]);

  // Remove task from selection
  const removeFromSelection = useCallback(id => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    // If we removed the last selected task, clear TaskContext selection
    if (selectedIds.size === 1 && selectedIds.has(id)) {
      clearTaskSelection();
    }
  }, [selectedIds, clearTaskSelection]);

  // Clear all selection
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setSelectionAnchorId(null);
    setLastSelectedId(null);
    // Also clear TaskContext selection
    clearTaskSelection();
  }, [clearTaskSelection]);

  // Check if a task is selected
  const isSelected = useCallback(
    id => {
      return selectedIds.has(id);
    },
    [selectedIds]
  );

  // Get selected count
  const getSelectedCount = useCallback(() => {
    return selectedIds.size;
  }, [selectedIds]);

  // Get selected IDs as array
  const getSelectedIds = useCallback(() => {
    return Array.from(selectedIds);
  }, [selectedIds]);

  // Handle click with modifier keys
  const handleTaskClick = useCallback(
    (id, event, taskIds) => {
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;

      if (isCtrlOrCmd) {
        // Ctrl/Cmd + Click: toggle selection
        toggleSelection(id);
      } else if (isShift && selectionAnchorId) {
        // Shift + Click: select range
        selectRange(selectionAnchorId, id, taskIds);
      } else {
        // Regular click: select single
        selectSingle(id);
      }
    },
    [selectionAnchorId, selectSingle, toggleSelection, selectRange]
  );

  // Select all tasks
  const selectAll = useCallback(taskIds => {
    setSelectedIds(new Set(taskIds));
    setSelectionAnchorId(taskIds[0] || null);
    setLastSelectedId(taskIds[taskIds.length - 1] || null);
  }, []);

  // Invert selection
  const invertSelection = useCallback(
    taskIds => {
      const newSelection = new Set();
      taskIds.forEach(id => {
        if (!selectedIds.has(id)) {
          newSelection.add(id);
        }
      });
      setSelectedIds(newSelection);
      setSelectionAnchorId(taskIds[0] || null);
      setLastSelectedId(taskIds[taskIds.length - 1] || null);
    },
    [selectedIds]
  );

  const value = {
    // State
    selectedIds,
    selectionAnchorId,
    lastSelectedId,

    // Selection methods
    selectSingle,
    toggleSelection,
    selectRange,
    addToSelection,
    removeFromSelection,
    clearSelection,
    selectAll,
    invertSelection,

    // Utility methods
    isSelected,
    getSelectedCount,
    getSelectedIds,
    handleTaskClick,
  };

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
};
