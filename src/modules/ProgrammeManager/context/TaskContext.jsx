import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useUndoRedoContext } from './UndoRedoContext';

const TaskContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
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
      type: 'task',
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
      type: 'task',
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
      type: 'task',
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

  // Undo/Redo context
  const { pushAction, isUndoRedoAction } = useUndoRedoContext();

  // Selection and hover state for bidirectional sync
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [hoveredTaskId, setHoveredTaskId] = useState(null);

  // Multi-selection state
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

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

  // Helper function to create undo/redo actions
  const createUndoAction = useCallback((type, before, after, onUndo, onRedo) => {
    return {
      type,
      before,
      after,
      onUndo,
      onRedo,
      timestamp: Date.now(),
    };
  }, []);

  // Helper function to push action to undo stack
  const pushUndoAction = useCallback((action) => {
    if (!isUndoRedoAction) {
      pushAction(action);
    }
  }, [pushAction, isUndoRedoAction]);

  // Task operations
  const addTask = useCallback(() => {
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
      type: 'task',
      isMilestone: false,
      notes: '',
      parentId: null,
      isGroup: false,
      isExpanded: true,
    };

    const before = { tasks: [...tasks], nextId };
    const after = { tasks: [...tasks, newTask], nextId: nextId + 1 };

    const action = createUndoAction(
      'ADD_TASK',
      before,
      after,
      // onUndo: remove the task
      () => {
        setTasks(prev => prev.filter(task => task.id !== newTask.id));
        setNextId(prev => prev - 1);
      },
      // onRedo: add the task back
      () => {
        setTasks(prev => [...prev, newTask]);
        setNextId(prev => prev + 1);
      }
    );

    pushUndoAction(action);
    setTasks(prev => [...prev, newTask]);
    setNextId(prev => prev + 1);
  }, [nextId, tasks, createUndoAction, pushUndoAction]);

  const addMilestone = useCallback(() => {
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
      type: 'milestone',
      isMilestone: true,
      notes: '',
      parentId: null,
      isGroup: false,
      isExpanded: true,
    };

    const before = { tasks: [...tasks], nextId };
    const after = { tasks: [...tasks, newMilestone], nextId: nextId + 1 };

    const action = createUndoAction(
      'ADD_MILESTONE',
      before,
      after,
      // onUndo: remove the milestone
      () => {
        setTasks(prev => prev.filter(task => task.id !== newMilestone.id));
        setNextId(prev => prev - 1);
      },
      // onRedo: add the milestone back
      () => {
        setTasks(prev => [...prev, newMilestone]);
        setNextId(prev => prev + 1);
      }
    );

    pushUndoAction(action);
    setTasks(prev => [...prev, newMilestone]);
    setNextId(prev => prev + 1);
  }, [nextId, tasks, createUndoAction, pushUndoAction]);

  const insertTaskBelow = useCallback(
    (selectedId = null) => {
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
        type: 'task',
        isMilestone: false,
        notes: '',
        parentId: null,
        isGroup: false,
        isExpanded: true,
      };

      let newTasks;
      let selectedIndex = -1;

      if (selectedId) {
        // Find the selected task's position
        selectedIndex = tasks.findIndex(task => task.id === selectedId);
        if (selectedIndex !== -1) {
          // Insert the new task after the selected one
          newTasks = [...tasks];
          newTasks.splice(selectedIndex + 1, 0, newTask);
        } else {
          // If selected task not found, append at the end
          newTasks = [...tasks, newTask];
        }
      } else {
        // No selection, append at the end
        newTasks = [...tasks, newTask];
      }

      const before = { tasks: [...tasks], nextId };
      const after = { tasks: newTasks, nextId: nextId + 1 };

      const action = createUndoAction(
        'INSERT_TASK',
        before,
        after,
        // onUndo: remove the task
        () => {
          setTasks(prev => prev.filter(task => task.id !== newTask.id));
          setNextId(prev => prev - 1);
          setSelectedTaskId(null);
          setSelectedTaskIds([]);
        },
        // onRedo: add the task back at the same position
        () => {
          if (selectedIndex !== -1) {
            const currentTasks = [...tasks];
            currentTasks.splice(selectedIndex + 1, 0, newTask);
            setTasks(currentTasks);
          } else {
            setTasks(prev => [...prev, newTask]);
          }
          setNextId(prev => prev + 1);
          setSelectedTaskId(newTask.id);
          setSelectedTaskIds([newTask.id]);
        }
      );

      pushUndoAction(action);
      setTasks(newTasks);
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
    [nextId, tasks, createUndoAction, pushUndoAction]
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
        type: 'task',
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
          return updated.map(task => {
            return selectedIds.includes(task.id)
              ? { ...task, parentId: summaryTaskId }
              : task;
          });
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
      // Remove the task and all its descendants
      const descendants = getTaskDescendants(taskId);
      const tasksToRemove = [taskId, ...descendants];

      // Get the tasks and links that will be removed
      const tasksToDelete = tasks.filter(task => tasksToRemove.includes(task.id));
      const linksToDelete = taskLinks.filter(
        link =>
          tasksToRemove.includes(link.fromId) ||
          tasksToRemove.includes(link.toId)
      );

      const before = { 
        tasks: [...tasks], 
        taskLinks: [...taskLinks],
        selectedTaskId,
        selectedTaskIds: [...selectedTaskIds]
      };
      const after = { 
        tasks: tasks.filter(task => !tasksToRemove.includes(task.id)),
        taskLinks: taskLinks.filter(
          link =>
            !tasksToRemove.includes(link.fromId) &&
            !tasksToRemove.includes(link.toId)
        ),
        selectedTaskId: selectedTaskId === taskId ? null : selectedTaskId,
        selectedTaskIds: selectedTaskIds.filter(id => !tasksToRemove.includes(id))
      };

      const action = createUndoAction(
        'DELETE_TASK',
        before,
        after,
        // onUndo: restore tasks and links
        () => {
          setTasks(prev => [...prev, ...tasksToDelete]);
          setTaskLinks(prev => [...prev, ...linksToDelete]);
          setSelectedTaskId(before.selectedTaskId);
          setSelectedTaskIds(before.selectedTaskIds);
        },
        // onRedo: delete tasks and links again
        () => {
          setTasks(prev => prev.filter(task => !tasksToRemove.includes(task.id)));
          setTaskLinks(prev =>
            prev.filter(
              link =>
                !tasksToRemove.includes(link.fromId) &&
                !tasksToRemove.includes(link.toId)
            )
          );
          setSelectedTaskId(after.selectedTaskId);
          setSelectedTaskIds(after.selectedTaskIds);
        }
      );

      pushUndoAction(action);
      setTasks(prev => prev.filter(task => !tasksToRemove.includes(task.id)));
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
    [tasks, taskLinks, selectedTaskId, selectedTaskIds, getTaskDescendants, createUndoAction, pushUndoAction]
  );

  // Enhanced delete function with cascade option
  const deleteTaskWithCascade = useCallback(
    (taskId, cascade = false) => {
      saveToUndoStack();

      // Get all tasks that depend on this task (successors)
      const getDependentTasks = taskId => {
        const dependents = new Set();
        const visited = new Set();

        const findDependents = currentTaskId => {
          if (visited.has(currentTaskId)) return;
          visited.add(currentTaskId);

          // Find all tasks that depend on the current task
          const dependentLinks = taskLinks.filter(
            link => link.fromId === currentTaskId
          );
          dependentLinks.forEach(link => {
            dependents.add(link.toId);
            if (cascade) {
              findDependents(link.toId);
            }
          });
        };

        findDependents(taskId);
        return Array.from(dependents);
      };

      // Get all tasks to remove
      const descendants = getTaskDescendants(taskId);
      const dependents = cascade ? getDependentTasks(taskId) : [];
      const tasksToRemove = [taskId, ...descendants, ...dependents];

      // Remove tasks
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
      if (selectedTaskId === taskId || tasksToRemove.includes(selectedTaskId)) {
        setSelectedTaskId(null);
      }
      setSelectedTaskIds(prev =>
        prev.filter(id => !tasksToRemove.includes(id))
      );

      console.log('Deleted task with cascade:', {
        taskId,
        cascade,
        tasksRemoved: tasksToRemove.length,
        descendants: descendants.length,
        dependents: dependents.length,
      });
    },
    [saveToUndoStack, selectedTaskId, getTaskDescendants, taskLinks]
  );

  const updateTask = useCallback(
    (taskId, updates) => {
      const oldTask = tasks.find(task => task.id === taskId);
      if (!oldTask) return;

      const updatedTask = { ...oldTask, ...updates };

      const before = { tasks: [...tasks] };
      const after = { tasks: tasks.map(task => (task.id === taskId ? updatedTask : task)) };

      const action = createUndoAction(
        'UPDATE_TASK',
        before,
        after,
        // onUndo: restore old task
        () => {
          setTasks(prev =>
            prev.map(task => (task.id === taskId ? oldTask : task))
          );
        },
        // onRedo: apply updates again
        () => {
          setTasks(prev =>
            prev.map(task => (task.id === taskId ? updatedTask : task))
          );
        }
      );

      pushUndoAction(action);
      setTasks(prev =>
        prev.map(task => (task.id === taskId ? updatedTask : task))
      );
    },
    [tasks, createUndoAction, pushUndoAction]
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
        type: 'task',
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
        ...prev.map(task => {
          return taskIds.includes(task.id)
            ? { ...task, parentId: groupId }
            : task;
        }),
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
        prev.map(task => {
          return childTasks.some(child => child.id === task.id)
            ? { ...task, parentId: null }
            : task;
        })
      );

      // Remove the group task
      setTasks(prev => prev.filter(task => task.id !== taskId));
    },
    [tasks, saveToUndoStack]
  );

  const toggleGroupCollapse = useCallback(groupId => {
    setTasks(prev =>
      prev.map(task => {
        return task.id === groupId
          ? { ...task, isExpanded: !task.isExpanded }
          : task;
      })
    );
  }, []);

  const expandMilestones = useCallback(() => {
    setTasks(prev =>
      prev.map(task => {
        return task.type === 'milestone' || task.isMilestone
          ? { ...task, isExpanded: true }
          : task;
      })
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

  // Helper functions
  const getHierarchicalTasks = useCallback(() => {
    return hierarchicalTasks;
  }, [hierarchicalTasks]);

  const getVisibleTasks = useCallback(
    (filter = 'Show All') => {
      const visible = [];

      // Ensure hierarchicalTasks is available and properly initialized
      if (
        !hierarchicalTasks ||
        !Array.isArray(hierarchicalTasks) ||
        hierarchicalTasks.length === 0
      ) {
        return visible;
      }

      const addVisible = hierarchicalTasks => {
        if (!Array.isArray(hierarchicalTasks)) return;

        hierarchicalTasks.forEach(task => {
          if (!task) return;

          // Apply filter logic
          let shouldInclude = true;

          switch (filter) {
            case 'Critical Tasks':
              shouldInclude = task.priority === 'High' || task.isCritical;
              break;
            case 'Milestones':
              shouldInclude = task.type === 'milestone' || task.isMilestone;
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

      const before = { taskLinks: [...taskLinks] };
      const after = { taskLinks: [...taskLinks, newLink] };

      const action = createUndoAction(
        'LINK_TASKS',
        before,
        after,
        // onUndo: remove the link
        () => {
          setTaskLinks(prev => prev.filter(link => link.id !== newLink.id));
        },
        // onRedo: add the link back
        () => {
          setTaskLinks(prev => [...prev, newLink]);
        }
      );

      pushUndoAction(action);
      setTaskLinks(prev => [...prev, newLink]);
      console.log('Created task link:', newLink);
    },
    [taskLinks, createUndoAction, pushUndoAction]
  );

  const unlinkTasks = useCallback(
    (fromId, toId) => {
      const linkToRemove = taskLinks.find(
        link => link.fromId === fromId && link.toId === toId
      );
      
      if (!linkToRemove) {
        console.warn('Link not found between tasks');
        return;
      }

      const before = { taskLinks: [...taskLinks] };
      const after = { taskLinks: taskLinks.filter(link => link.id !== linkToRemove.id) };

      const action = createUndoAction(
        'UNLINK_TASKS',
        before,
        after,
        // onUndo: restore the link
        () => {
          setTaskLinks(prev => [...prev, linkToRemove]);
        },
        // onRedo: remove the link again
        () => {
          setTaskLinks(prev => prev.filter(link => link.id !== linkToRemove.id));
        }
      );

      pushUndoAction(action);
      setTaskLinks(prev =>
        prev.filter(link => !(link.fromId === fromId && link.toId === toId))
      );
      console.log('Removed task link:', { fromId, toId });
    },
    [taskLinks, createUndoAction, pushUndoAction]
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

  // Baseline operations
  const setBaseline1 = useCallback(() => {
    saveToUndoStack();

    setTasks(prev =>
      prev.map(task => ({
        ...task,
        baselineStart: task.startDate,
        baselineEnd: task.endDate,
      }))
    );

    console.log('Baseline 1 captured for all tasks');
  }, [saveToUndoStack]);

  const clearBaseline1 = useCallback(() => {
    saveToUndoStack();

    setTasks(prev =>
      prev.map(task => ({
        ...task,
        baselineStart: null,
        baselineEnd: null,
      }))
    );

    console.log('Baseline 1 cleared for all tasks');
  }, [saveToUndoStack]);

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

      // Undo/Redo - now handled by UndoRedoContext

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
      deleteTaskWithCascade,
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

      // Baseline operations
      setBaseline1,
      clearBaseline1,

      // Linking mode operations
      startLinkingMode,
      stopLinkingMode,
      handleTaskClickForLinking,
    }),
    [
      tasks,
      nextId,
      taskLinks,

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
      deleteTaskWithCascade,
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
      setBaseline1,
      clearBaseline1,
      startLinkingMode,
      stopLinkingMode,
      handleTaskClickForLinking,
    ]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
