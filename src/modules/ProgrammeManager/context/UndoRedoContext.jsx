// eslint-disable-next-line no-unused-vars
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';

const UndoRedoContext = createContext();

export const useUndoRedoContext = () => {
  const context = useContext(UndoRedoContext);
  if (!context) {
    throw new Error(
      'useUndoRedoContext must be used within an UndoRedoProvider'
    );
  }
  return context;
};

export const UndoRedoProvider = ({ children }) => {
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [isUndoRedoAction, setIsUndoRedoAction] = useState(false);

  const MAX_STACK_SIZE = 50;

  // Clear redo stack when new action is added
  const clearRedoStack = useCallback(() => {
    setRedoStack([]);
  }, []);

  // Add action to undo stack
  const pushAction = useCallback(
    action => {
      if (isUndoRedoAction) {
        // Don't add to undo stack if this is an undo/redo action
        return;
      }

      setUndoStack(prev => {
        const newStack = [...prev, action];
        // Limit stack size
        if (newStack.length > MAX_STACK_SIZE) {
          return newStack.slice(-MAX_STACK_SIZE);
        }
        return newStack;
      });
      clearRedoStack();
    },
    [isUndoRedoAction, clearRedoStack]
  );

  // Undo last action
  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    setIsUndoRedoAction(true);

    const lastAction = undoStack[undoStack.length - 1];
    const remainingActions = undoStack.slice(0, -1);

    setUndoStack(remainingActions);
    setRedoStack(prev => [...prev, lastAction]);

    // Apply the inverse of the action
    applyActionInverse(lastAction);

    setIsUndoRedoAction(false);
  }, [undoStack]);

  // Redo last undone action
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    setIsUndoRedoAction(true);

    const lastRedoAction = redoStack[redoStack.length - 1];
    const remainingRedoActions = redoStack.slice(0, -1);

    setRedoStack(remainingRedoActions);
    setUndoStack(prev => [...prev, lastRedoAction]);

    // Reapply the action
    applyAction(lastRedoAction);

    setIsUndoRedoAction(false);
  }, [redoStack]);

  // Apply action (for redo)
  const applyAction = useCallback(action => {
    // This will be implemented by the consuming components
    // The action object will contain the necessary data to reapply the change
    if (action.onRedo) {
      action.onRedo(action.after);
    }
  }, []);

  // Apply inverse action (for undo)
  const applyActionInverse = useCallback(action => {
    // This will be implemented by the consuming components
    // The action object will contain the necessary data to reverse the change
    if (action.onUndo) {
      action.onUndo(action.before);
    }
  }, []);

  // Check if undo/redo is available
  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  // Clear all stacks
  const clearStacks = useCallback(() => {
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  // Get stack info for debugging
  const getStackInfo = useCallback(() => {
    return {
      undoCount: undoStack.length,
      redoCount: redoStack.length,
      canUndo,
      canRedo,
    };
  }, [undoStack.length, redoStack.length, canUndo, canRedo]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          if (canUndo) undo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          if (canRedo) redo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  const value = {
    // State
    undoStack,
    redoStack,
    canUndo,
    canRedo,
    isUndoRedoAction,

    // Actions
    pushAction,
    undo,
    redo,
    clearStacks,

    // Utilities
    getStackInfo,
  };

  return (
    <UndoRedoContext.Provider value={value}>
      {children}
    </UndoRedoContext.Provider>
  );
};
