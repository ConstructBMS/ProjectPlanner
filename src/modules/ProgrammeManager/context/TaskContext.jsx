import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';

const TaskContext = createContext();

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  // Task data
  const [tasks, setTasks] = useState([
    {
      id: 'task-1',
      name: 'Foundation Excavation',
      startDate: '2024-01-15T00:00:00.000Z',
      endDate: '2024-01-20T00:00:00.000Z',
      duration: 6,
      status: 'In Progress',
      priority: 'High',
      assignee: 'John Smith',
      progress: 50,
      color: '#3B82F6',
      isMilestone: false,
      notes: 'Excavate foundation for building A',
      parentId: null,
      isGroup: false,
      isExpanded: true,
      baselineStart: '2024-01-15T00:00:00.000Z',
      baselineEnd: '2024-01-18T00:00:00.000Z',
      predecessors: [], // No predecessors
    },
    {
      id: 'task-2',
      name: 'Concrete Pouring',
      startDate: '2024-01-21T00:00:00.000Z',
      endDate: '2024-01-25T00:00:00.000Z',
      duration: 5,
      status: 'Complete',
      priority: 'High',
      assignee: 'Mike Johnson',
      progress: 100,
      color: '#10B981',
      isMilestone: false,
      notes: 'Pour concrete for foundation',
      parentId: null,
      isGroup: false,
      isExpanded: true,
      baselineStart: '2024-01-20T00:00:00.000Z',
      baselineEnd: '2024-01-23T00:00:00.000Z',
      predecessors: ['task-1'], // Depends on Foundation Excavation
    },
    {
      id: 'task-3',
      name: 'Structural Framework',
      startDate: '2024-01-26T00:00:00.000Z',
      endDate: '2024-02-10T00:00:00.000Z',
      duration: 16,
      status: 'Delayed',
      priority: 'Medium',
      assignee: 'Sarah Wilson',
      progress: 25,
      color: '#F59E0B',
      isMilestone: false,
      notes: 'Install structural steel framework',
      parentId: null,
      isGroup: false,
      isExpanded: true,
      baselineStart: '2024-01-25T00:00:00.000Z',
      baselineEnd: '2024-02-05T00:00:00.000Z',
      predecessors: ['task-2'], // Depends on Concrete Pouring
    },
  ]);

  const [nextId, setNextId] = useState(4);

  // Undo/Redo history stacks
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Selection and hover state for bidirectional sync
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [hoveredTaskId, setHoveredTaskId] = useState(null);

  // Multi-selection state
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  // Clipboard state
  const [clipboardTasks, setClipboardTasks] = useState([]);

  // Task links/dependencies with enhanced structure
  const [taskLinks, setTaskLinks] = useState([
    {
      id: 'link-1',
      fromId: 'task-1',
      toId: 'task-2',
      type: 'FS', // Finish-to-Start
      lag: 0, // Days of lag/lead time (+/-)
    },
    {
      id: 'link-2',
      fromId: 'task-2',
      toId: 'task-3',
      type: 'FS',
      lag: 0,
    },
  ]);

  // Linking mode state
  const [linkingMode, setLinkingMode] = useState(false);
  const [linkStartTaskId, setLinkStartTaskId] = useState(null);

  // Memoize expensive computations
  const hierarchicalTasks = useMemo(() => {
    const buildHierarchy = (parentId = null) => {
      return tasks
        .filter(task => task.parentId === parentId)
        .map(task => ({
          ...task,
          children: buildHierarchy(task.id),
        }))
        .sort((a, b) => {
          // Sort by start date, then by name
          const dateA = new Date(a.startDate);
          const dateB = new Date(b.startDate);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
          }
          return a.name.localeCompare(b.name);
        });
    };

    return buildHierarchy();
  }, [tasks]);

  // Helper function to save current state to undo stack
  const saveToUndoStack = useCallback(() => {
    const currentState = {
      tasks: [...tasks],
      taskLinks: [...taskLinks],
      nextId,
      timestamp: Date.now(),
    };
    setUndoStack(prev => [...prev, currentState]);
    // Clear redo stack when new action is performed
    setRedoStack([]);
  }, [tasks, taskLinks, nextId]);

  // Undo function
  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    const currentState = {
      tasks: [...tasks],
      taskLinks: [...taskLinks],
      nextId,
      timestamp: Date.now(),
    };

    const previousState = undoStack[undoStack.length - 1];

    setTasks(previousState.tasks);
    setTaskLinks(previousState.taskLinks);
    setNextId(previousState.nextId);

    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, currentState]);
  }, [undoStack, tasks, taskLinks, nextId]);

  // Redo function
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const currentState = {
      tasks: [...tasks],
      taskLinks: [...taskLinks],
      nextId,
      timestamp: Date.now(),
    };

    const nextState = redoStack[redoStack.length - 1];

    setTasks(nextState.tasks);
    setTaskLinks(nextState.taskLinks);
    setNextId(nextState.nextId);

    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, currentState]);
  }, [redoStack, tasks, taskLinks, nextId]);

  // Task operations
  const addTask = useCallback(() => {
    saveToUndoStack();

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const newTask = {
      id: `task-${nextId}`,
      name: 'New Task',
      startDate: today.toISOString(),
      endDate: tomorrow.toISOString(),
      duration: 2,
      status: 'Planned',
      priority: 'Medium',
      assignee: '',
      progress: 0,
      color: '#3B82F6',
      isMilestone: false,
      notes: '',
      parentId: null,
      isGroup: false,
      isExpanded: true,
    };

    setTasks(prev => [...prev, newTask]);
    setNextId(prev => prev + 1);
  }, [nextId, saveToUndoStack]);

  const addMilestone = useCallback(() => {
    saveToUndoStack();

    const today = new Date();

    const newMilestone = {
      id: `task-${nextId}`,
      name: 'New Milestone',
      startDate: today.toISOString(),
      endDate: today.toISOString(),
      duration: 0,
      status: 'Planned',
      priority: 'High',
      assignee: '',
      progress: 0,
      color: '#F59E0B',
      isMilestone: true,
      notes: '',
      parentId: null,
      isGroup: false,
      isExpanded: true,
    };

    setTasks(prev => [...prev, newMilestone]);
    setNextId(prev => prev + 1);
  }, [nextId, saveToUndoStack]);

  const insertTaskBelow = useCallback(
    (selectedId = null) => {
      saveToUndoStack();

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const newTask = {
        id: `task-${nextId}`,
        name: 'New Task',
        startDate: today.toISOString(),
        endDate: tomorrow.toISOString(),
        duration: 1,
        status: 'Planned',
        priority: 'Medium',
        assignee: '',
        progress: 0,
        color: '#3B82F6',
        isMilestone: false,
        notes: '',
        parentId: null,
        isGroup: false,
        isExpanded: true,
      };

      if (selectedId) {
        // Find the selected task's position
        const selectedIndex = tasks.findIndex(task => task.id === selectedId);
        if (selectedIndex !== -1) {
          // Insert the new task after the selected one
          setTasks(prev => {
            const updated = [...prev];
            updated.splice(selectedIndex + 1, 0, newTask);
            return updated;
          });
        } else {
          // If selected task not found, append at the end
          setTasks(prev => [...prev, newTask]);
        }
      } else {
        // No selection, append at the end
        setTasks(prev => [...prev, newTask]);
      }

      setNextId(prev => prev + 1);
      // Select the newly created task
      setSelectedTaskId(newTask.id);
      setSelectedTaskIds([newTask.id]);

      console.log(
        'Inserted new task below:',
        selectedId,
        'New task ID:',
        newTask.id
      );
    },
    [nextId, saveToUndoStack, tasks]
  );

  const insertSummaryTask = useCallback(
    (selectedIds = []) => {
      saveToUndoStack();

      const today = new Date();
      const summaryTaskId = `task-${nextId}`;

      const summaryTask = {
        id: summaryTaskId,
        name: 'New Summary Task',
        startDate: today.toISOString(),
        endDate: today.toISOString(),
        duration: 0,
        status: 'Planned',
        priority: 'Medium',
        assignee: '',
        progress: 0,
        color: '#8B5CF6',
        isMilestone: false,
        notes: '',
        parentId: null,
        isGroup: true,
        isExpanded: true,
      };

      if (selectedIds.length > 0) {
        // Find the position of the first selected task
        const firstSelectedIndex = tasks.findIndex(task =>
          selectedIds.includes(task.id)
        );

        // Create the summary task and update children
        setTasks(prev => {
          const updated = [...prev];

          // Insert summary task at the position of the first selected task
          if (firstSelectedIndex !== -1) {
            updated.splice(firstSelectedIndex, 0, summaryTask);
          } else {
            updated.unshift(summaryTask);
          }

          // Update selected tasks to be children of the summary task
          return updated.map(task =>
            selectedIds.includes(task.id)
              ? { ...task, parentId: summaryTaskId }
              : task
          );
        });

        console.log(
          'Created summary task wrapping tasks:',
          selectedIds,
          'Summary ID:',
          summaryTaskId
        );
      } else {
        // No tasks selected, just create an empty summary task
        setTasks(prev => [...prev, summaryTask]);
        console.log('Created empty summary task:', summaryTaskId);
      }

      setNextId(prev => prev + 1);
      // Select the newly created summary task
      setSelectedTaskId(summaryTaskId);
      setSelectedTaskIds([summaryTaskId]);
    },
    [nextId, saveToUndoStack, tasks]
  );

  const getTaskDescendants = useCallback(
    taskId => {
      const descendants = [];

      const addDescendants = parentId => {
        tasks.forEach(task => {
          if (task.parentId === parentId) {
            descendants.push(task.id);
            addDescendants(task.id);
          }
        });
      };

      addDescendants(taskId);
      return descendants;
    },
    [tasks]
  );

  const deleteTask = useCallback(
    taskId => {
      saveToUndoStack();

      // Remove the task and all its descendants
      const descendants = getTaskDescendants(taskId);
      const tasksToRemove = [taskId, ...descendants];

      setTasks(prev => prev.filter(task => !tasksToRemove.includes(task.id)));

      // Remove any links involving the deleted tasks
      setTaskLinks(prev =>
        prev.filter(
          link =>
            !tasksToRemove.includes(link.fromId) &&
            !tasksToRemove.includes(link.toId)
        )
      );

      // Clear selection if deleted task was selected
      if (selectedTaskId === taskId) {
        setSelectedTaskId(null);
      }
      setSelectedTaskIds(prev =>
        prev.filter(id => !tasksToRemove.includes(id))
      );
    },
    [saveToUndoStack, selectedTaskId, getTaskDescendants]
  );

  const updateTask = useCallback(
    (taskId, updates) => {
      saveToUndoStack();
      setTasks(prev =>
        prev.map(task => (task.id === taskId ? { ...task, ...updates } : task))
      );
    },
    [saveToUndoStack]
  );

  // Selection operations
  const selectTask = useCallback(taskId => {
    setSelectedTaskId(taskId);
    setSelectedTaskIds([taskId]);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTaskId(null);
    setSelectedTaskIds([]);
  }, []);

  const selectMultipleTasks = useCallback((taskId, isMultiSelect) => {
    if (isMultiSelect) {
      setSelectedTaskIds(prev => {
        if (prev.includes(taskId)) {
          return prev.filter(id => id !== taskId);
        } else {
          return [...prev, taskId];
        }
      });
      setSelectedTaskId(taskId);
    } else {
      setSelectedTaskId(taskId);
      setSelectedTaskIds([taskId]);
    }
  }, []);

  // Hover operations
  const setHoveredTask = useCallback(taskId => {
    setHoveredTaskId(taskId);
  }, []);

  const clearHoveredTask = useCallback(() => {
    setHoveredTaskId(null);
  }, []);

  // Group operations
  const groupTasks = useCallback(
    (taskIds, groupName) => {
      if (taskIds.length < 2) return;

      saveToUndoStack();

      const groupId = `task-${nextId}`;
      const today = new Date();

      // Create group task
      const groupTask = {
        id: groupId,
        name: groupName,
        startDate: today.toISOString(),
        endDate: today.toISOString(),
        duration: 0,
        status: 'Planned',
        priority: 'Medium',
        assignee: '',
        progress: 0,
        color: '#8B5CF6',
        isMilestone: false,
        notes: '',
        parentId: null,
        isGroup: true,
        isExpanded: true,
      };

      // Update child tasks to have the group as parent
      setTasks(prev => [
        ...prev,
        groupTask,
        ...prev.map(task =>
          taskIds.includes(task.id) ? { ...task, parentId: groupId } : task
        ),
      ]);

      setNextId(prev => prev + 1);
    },
    [nextId, saveToUndoStack]
  );

  const ungroupTask = useCallback(
    taskId => {
      saveToUndoStack();

      // Find all tasks that have this task as parent
      const childTasks = tasks.filter(task => task.parentId === taskId);

      // Update child tasks to have no parent
      setTasks(prev =>
        prev.map(task =>
          childTasks.some(child => child.id === task.id)
            ? { ...task, parentId: null }
            : task
        )
      );

      // Remove the group task
      setTasks(prev => prev.filter(task => task.id !== taskId));
    },
    [tasks, saveToUndoStack]
  );

  const toggleGroupCollapse = useCallback(groupId => {
    setTasks(prev =>
      prev.map(task =>
        task.id === groupId ? { ...task, isExpanded: !task.isExpanded } : task
      )
    );
  }, []);

  const expandMilestones = useCallback(() => {
    setTasks(prev =>
      prev.map(task =>
        task.isMilestone ? { ...task, isExpanded: true } : task
      )
    );
  }, []);

  // Reordering operations
  const reorderTasks = useCallback(
    (sourceIndex, destinationIndex) => {
      saveToUndoStack();
      setTasks(prev => {
        const updated = [...prev];
        const [moved] = updated.splice(sourceIndex, 1);
        updated.splice(destinationIndex, 0, moved);
        return updated;
      });
    },
    [saveToUndoStack]
  );

  const reorderTasksById = useCallback(
    (sourceId, destinationId, position = 'after') => {
      saveToUndoStack();
      setTasks(prev => {
        const sourceIndex = prev.findIndex(t => t.id === sourceId);
        const destIndex = prev.findIndex(t => t.id === destinationId);

        if (sourceIndex === -1 || destIndex === -1) return prev;

        const updated = [...prev];
        const [moved] = updated.splice(sourceIndex, 1);

        const insertIndex = position === 'after' ? destIndex : destIndex;
        updated.splice(insertIndex, 0, moved);

        return updated;
      });
    },
    [saveToUndoStack]
  );

  const moveTaskUp = useCallback(
    taskId => {
      saveToUndoStack();
      setTasks(prev => {
        const currentIndex = prev.findIndex(t => t.id === taskId);
        if (currentIndex <= 0) return prev; // Already at top or not found

        const currentTask = prev[currentIndex];

        // Find the previous task at the same hierarchy level (same parentId)
        let targetIndex = -1;
        for (let i = currentIndex - 1; i >= 0; i--) {
          if (prev[i].parentId === currentTask.parentId) {
            targetIndex = i;
            break;
          }
        }

        if (targetIndex === -1) return prev; // No task above at same level

        const updated = [...prev];
        // Swap the tasks
        [updated[currentIndex], updated[targetIndex]] = [
          updated[targetIndex],
          updated[currentIndex],
        ];

        console.log(
          'Moved task up:',
          taskId,
          'from position',
          currentIndex,
          'to',
          targetIndex
        );
        return updated;
      });
    },
    [saveToUndoStack]
  );

  const moveTaskDown = useCallback(
    taskId => {
      saveToUndoStack();
      setTasks(prev => {
        const currentIndex = prev.findIndex(t => t.id === taskId);
        if (currentIndex === -1 || currentIndex >= prev.length - 1) return prev; // Not found or already at bottom

        const currentTask = prev[currentIndex];

        // Find the next task at the same hierarchy level (same parentId)
        let targetIndex = -1;
        for (let i = currentIndex + 1; i < prev.length; i++) {
          if (prev[i].parentId === currentTask.parentId) {
            targetIndex = i;
            break;
          }
        }

        if (targetIndex === -1) return prev; // No task below at same level

        const updated = [...prev];
        // Swap the tasks
        [updated[currentIndex], updated[targetIndex]] = [
          updated[targetIndex],
          updated[currentIndex],
        ];

        console.log(
          'Moved task down:',
          taskId,
          'from position',
          currentIndex,
          'to',
          targetIndex
        );
        return updated;
      });
    },
    [saveToUndoStack]
  );

  // Helper functions
  const getHierarchicalTasks = useCallback(() => {
    return hierarchicalTasks;
  }, [hierarchicalTasks]);

  const getVisibleTasks = useCallback(
    (filter = 'Show All') => {
      const visible = [];

      const addVisible = hierarchicalTasks => {
        hierarchicalTasks.forEach(task => {
          // Apply filter logic
          let shouldInclude = true;

          switch (filter) {
            case 'Critical Tasks':
              shouldInclude = task.priority === 'High' || task.isCritical;
              break;
            case 'Milestones':
              shouldInclude = task.isMilestone;
              break;
            case 'Delayed Tasks': {
              const today = new Date();
              const endDate = new Date(task.endDate);
              shouldInclude = endDate < today && task.progress < 100;
              break;
            }
            case 'Grouped by Phase':
              shouldInclude = task.isGroup || task.parentId !== null;
              break;
            case 'Show All':
            default:
              shouldInclude = true;
              break;
          }

          if (shouldInclude) {
            visible.push(task);
          }

          if (task.isGroup && task.isExpanded && task.children) {
            addVisible(task.children);
          }
        });
      };

      addVisible(hierarchicalTasks);
      return visible;
    },
    [hierarchicalTasks]
  );

  // Link operations with enhanced functionality
  const linkTasks = useCallback(
    (fromId, toId, linkType = 'FS', lag = 0) => {
      // Check if link already exists
      const linkExists = taskLinks.some(
        link => link.fromId === fromId && link.toId === toId
      );

      if (linkExists) {
        console.warn('Link already exists between tasks');
        return;
      }

      // Check for circular dependencies
      const wouldCreateCycle = (startId, targetId, visited = new Set()) => {
        if (startId === targetId) return true;
        if (visited.has(startId)) return false;

        visited.add(startId);
        const outgoingLinks = taskLinks.filter(link => link.fromId === startId);

        return outgoingLinks.some(link =>
          wouldCreateCycle(link.toId, targetId, visited)
        );
      };

      if (wouldCreateCycle(toId, fromId)) {
        console.error('Cannot create link: would cause circular dependency');
        return;
      }

      const newLink = {
        id: `link-${Date.now()}`,
        fromId,
        toId,
        type: linkType,
        lag,
      };

      saveToUndoStack();
      setTaskLinks(prev => [...prev, newLink]);
      console.log('Created task link:', newLink);
    },
    [taskLinks, saveToUndoStack]
  );

  const unlinkTasks = useCallback(
    (fromId, toId) => {
      saveToUndoStack();
      setTaskLinks(prev =>
        prev.filter(link => !(link.fromId === fromId && link.toId === toId))
      );
      console.log('Removed task link:', { fromId, toId });
    },
    [saveToUndoStack]
  );

  const updateLink = useCallback(
    (linkId, updates) => {
      saveToUndoStack();
      setTaskLinks(prev =>
        prev.map(link => (link.id === linkId ? { ...link, ...updates } : link))
      );
      console.log('Updated task link:', { linkId, updates });
    },
    [saveToUndoStack]
  );

  const deleteLinkById = useCallback(
    linkId => {
      saveToUndoStack();
      setTaskLinks(prev => prev.filter(link => link.id !== linkId));
      console.log('Deleted task link:', linkId);
    },
    [saveToUndoStack]
  );

  // Linking mode operations
  const startLinkingMode = useCallback(taskId => {
    setLinkingMode(true);
    setLinkStartTaskId(taskId);
  }, []);

  const stopLinkingMode = useCallback(() => {
    setLinkingMode(false);
    setLinkStartTaskId(null);
  }, []);

  const handleTaskClickForLinking = useCallback(
    taskId => {
      if (!linkingMode) return;

      if (linkStartTaskId && linkStartTaskId !== taskId) {
        linkTasks(linkStartTaskId, taskId);
        stopLinkingMode();
      } else if (!linkStartTaskId) {
        setLinkStartTaskId(taskId);
      }
    },
    [linkingMode, linkStartTaskId, linkTasks, stopLinkingMode]
  );

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      // Task data
      tasks,
      nextId,
      taskLinks,

      // Undo/Redo
      undo,
      redo,
      undoStack,
      redoStack,

      // Selection state
      selectedTaskId,
      selectedTaskIds,
      hoveredTaskId,

      // Linking mode
      linkingMode,
      linkStartTaskId,

      // Task operations
      addTask,
      addMilestone,
      insertTaskBelow,
      insertSummaryTask,
      deleteTask,
      updateTask,

      // Selection operations
      selectTask,
      clearSelection,
      selectMultipleTasks,

      // Hover operations
      setHoveredTask,
      clearHoveredTask,

      // Group operations
      groupTasks,
      ungroupTask,
      toggleGroupCollapse,
      expandMilestones,

      // Reordering operations
      reorderTasks,
      reorderTasksById,

      // Helper functions
      getHierarchicalTasks,
      getVisibleTasks,
      getTaskDescendants,

      // Link operations
      linkTasks,
      unlinkTasks,
      updateLink,
      deleteLinkById,

      // Linking mode operations
      startLinkingMode,
      stopLinkingMode,
      handleTaskClickForLinking,
    }),
    [
      tasks,
      nextId,
      taskLinks,
      undo,
      redo,
      undoStack,
      redoStack,
      selectedTaskId,
      selectedTaskIds,
      hoveredTaskId,
      linkingMode,
      linkStartTaskId,
      addTask,
      addMilestone,
      insertTaskBelow,
      insertSummaryTask,
      deleteTask,
      updateTask,
      selectTask,
      clearSelection,
      selectMultipleTasks,
      setHoveredTask,
      clearHoveredTask,
      groupTasks,
      ungroupTask,
      toggleGroupCollapse,
      expandMilestones,
      reorderTasks,
      reorderTasksById,
      getHierarchicalTasks,
      getVisibleTasks,
      getTaskDescendants,
      linkTasks,
      unlinkTasks,
      updateLink,
      deleteLinkById,
      startLinkingMode,
      stopLinkingMode,
      handleTaskClickForLinking,
    ]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
