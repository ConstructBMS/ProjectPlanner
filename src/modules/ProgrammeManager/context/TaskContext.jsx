import React, { createContext, useContext, useState, useCallback } from 'react';

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
      status: 'Planned',
      priority: 'High',
      assignee: 'John Smith',
      progress: 0,
      color: '#3B82F6',
      isMilestone: false,
      notes: 'Excavate foundation for building A',
      parentId: null,
      isGroup: false,
      isExpanded: true,
      baselineStart: '2024-01-15T00:00:00.000Z',
      baselineEnd: '2024-01-18T00:00:00.000Z',
    },
    {
      id: 'task-2',
      name: 'Concrete Pouring',
      startDate: '2024-01-21T00:00:00.000Z',
      endDate: '2024-01-25T00:00:00.000Z',
      duration: 5,
      status: 'Planned',
      priority: 'High',
      assignee: 'Mike Johnson',
      progress: 0,
      color: '#10B981',
      isMilestone: false,
      notes: 'Pour concrete for foundation',
      parentId: null,
      isGroup: false,
      isExpanded: true,
      baselineStart: '2024-01-20T00:00:00.000Z',
      baselineEnd: '2024-01-23T00:00:00.000Z',
    },
    {
      id: 'task-3',
      name: 'Structural Framework',
      startDate: '2024-01-26T00:00:00.000Z',
      endDate: '2024-02-10T00:00:00.000Z',
      duration: 16,
      status: 'Planned',
      priority: 'Medium',
      assignee: 'Sarah Wilson',
      progress: 0,
      color: '#F59E0B',
      isMilestone: false,
      notes: 'Install structural steel framework',
      parentId: null,
      isGroup: false,
      isExpanded: true,
      baselineStart: '2024-01-25T00:00:00.000Z',
      baselineEnd: '2024-02-05T00:00:00.000Z',
    },
  ]);

  const [nextId, setNextId] = useState(4);

  // Selection and hover state for bidirectional sync
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [hoveredTaskId, setHoveredTaskId] = useState(null);

  // Multi-selection state
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  // Task links/dependencies
  const [taskLinks, setTaskLinks] = useState([
    { fromId: 'task-1', toId: 'task-2' },
    { fromId: 'task-2', toId: 'task-3' },
  ]);

  // Linking mode state
  const [linkingMode, setLinkingMode] = useState(false);
  const [linkStartTaskId, setLinkStartTaskId] = useState(null);

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
      isMilestone: false,
      notes: '',
      parentId: null,
      isGroup: false,
      isExpanded: true,
    };

    setTasks(prev => [...prev, newTask]);
    setNextId(prev => prev + 1);
    console.log('Task added:', newTask);
  }, [nextId]);

  const deleteTask = useCallback(
    taskId => {
      setTasks(prev => {
        const taskToDelete = prev.find(t => t.id === taskId);
        if (taskToDelete?.isGroup) {
          // If it's a group, delete all children too
          const deleteIds = new Set([taskId]);
          const addChildrenIds = parentId => {
            prev.forEach(task => {
              if (task.parentId === parentId) {
                deleteIds.add(task.id);
                if (task.isGroup) {
                  addChildrenIds(task.id);
                }
              }
            });
          };
          addChildrenIds(taskId);
          return prev.filter(task => !deleteIds.has(task.id));
        } else {
          return prev.filter(task => task.id !== taskId);
        }
      });

      // Clear selection if deleted task was selected
      if (selectedTaskId === taskId) {
        setSelectedTaskId(null);
      }
      if (selectedTaskIds.includes(taskId)) {
        setSelectedTaskIds(prev => prev.filter(id => id !== taskId));
      }
      if (hoveredTaskId === taskId) {
        setHoveredTaskId(null);
      }

      // Remove any links involving this task
      setTaskLinks(prev =>
        prev.filter(link => link.fromId !== taskId && link.toId !== taskId)
      );

      console.log('Task deleted:', taskId);
    },
    [selectedTaskId, selectedTaskIds, hoveredTaskId]
  );

  const updateTask = useCallback((taskId, updatedFields) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const updatedTask = { ...task, ...updatedFields };

          // Intelligent date/duration calculations
          if (updatedFields.startDate || updatedFields.endDate) {
            const start = updatedFields.startDate
              ? new Date(updatedFields.startDate)
              : new Date(task.startDate);
            const end = updatedFields.endDate
              ? new Date(updatedFields.endDate)
              : new Date(task.endDate);

            if (start && end && start <= end) {
              const diffTime = Math.abs(end - start);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
              updatedTask.duration = diffDays;
            }
          } else if (updatedFields.duration && task.startDate) {
            const start = new Date(task.startDate);
            const duration = parseInt(updatedFields.duration) || 1;
            const end = new Date(start);
            end.setDate(start.getDate() + duration - 1);
            updatedTask.endDate = end.toISOString();
          }

          return updatedTask;
        }
        return task;
      })
    );

    console.log('Task updated:', taskId, updatedFields);
  }, []);

  // Selection operations
  const selectTask = useCallback(taskId => {
    setSelectedTaskId(taskId);
    console.log('Task selected:', taskId);
  }, []);

  const selectMultipleTasks = useCallback((taskId, isMultiSelect = false) => {
    if (isMultiSelect) {
      // Multi-select mode: toggle the task in the selection
      setSelectedTaskIds(prev => {
        if (prev.includes(taskId)) {
          // Remove from selection
          const newSelection = prev.filter(id => id !== taskId);
          return newSelection;
        } else {
          // Add to selection
          return [...prev, taskId];
        }
      });
    } else {
      // Single select mode: clear multi-selection and select single task
      setSelectedTaskId(taskId);
      setSelectedTaskIds([]);
    }
    console.log(
      'Task selection updated:',
      taskId,
      'multi-select:',
      isMultiSelect
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTaskId(null);
    setSelectedTaskIds([]);
    console.log('Selection cleared');
  }, []);

  // Hover operations
  const setHoveredTask = useCallback(taskId => {
    setHoveredTaskId(taskId);
  }, []);

  const clearHoveredTask = useCallback(() => {
    setHoveredTaskId(null);
  }, []);

  // Linking operations
  const linkTasks = useCallback(
    (fromId, toId) => {
      // Prevent circular dependencies
      if (fromId === toId) {
        console.log('Cannot link task to itself');
        return;
      }

      // Check if link already exists
      const linkExists = taskLinks.some(
        link => link.fromId === fromId && link.toId === toId
      );
      if (linkExists) {
        console.log('Link already exists');
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
        console.log('Cannot create circular dependency');
        return;
      }

      setTaskLinks(prev => [...prev, { fromId, toId }]);
      console.log('Tasks linked:', fromId, '→', toId);
    },
    [taskLinks]
  );

  const unlinkTasks = useCallback((fromId, toId) => {
    setTaskLinks(prev =>
      prev.filter(link => !(link.fromId === fromId && link.toId === toId))
    );
    console.log('Tasks unlinked:', fromId, '→', toId);
  }, []);

  // Linking mode operations
  const startLinkingMode = useCallback(taskId => {
    setLinkingMode(true);
    setLinkStartTaskId(taskId);
    console.log('Linking mode started with task:', taskId);
  }, []);

  const stopLinkingMode = useCallback(() => {
    setLinkingMode(false);
    setLinkStartTaskId(null);
    console.log('Linking mode stopped');
  }, []);

  const handleTaskClickForLinking = useCallback(
    taskId => {
      if (!linkingMode) return;

      if (linkStartTaskId && linkStartTaskId !== taskId) {
        linkTasks(linkStartTaskId, taskId);
        stopLinkingMode();
      } else if (!linkStartTaskId) {
        setLinkStartTaskId(taskId);
        console.log('Link start task set:', taskId);
      }
    },
    [linkingMode, linkStartTaskId, linkTasks, stopLinkingMode]
  );

  // Grouping operations
  const groupTasks = useCallback(
    (selectedIds, groupName) => {
      if (selectedIds.length < 2) {
        console.log('Need at least 2 tasks to create a group');
        return;
      }

      const groupId = `task-${nextId}`;
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const groupTask = {
        id: groupId,
        name: groupName,
        startDate: today.toISOString(),
        endDate: tomorrow.toISOString(),
        duration: 2,
        status: 'Planned',
        priority: 'Medium',
        assignee: '',
        progress: 0,
        color: '#10B981',
        isMilestone: false,
        notes: `Group containing ${selectedIds.length} tasks`,
        parentId: null,
        isGroup: true,
        isExpanded: true,
      };

      setTasks(prev => [
        ...prev.map(task =>
          selectedIds.includes(task.id) ? { ...task, parentId: groupId } : task
        ),
        groupTask,
      ]);

      setNextId(prev => prev + 1);
      setSelectedTaskIds([]);
      console.log('Tasks grouped:', selectedIds, 'under', groupName);
    },
    [nextId]
  );

  const ungroupTask = useCallback(groupId => {
    setTasks(prev => {
      const groupTask = prev.find(t => t.id === groupId);
      if (!groupTask?.isGroup) return prev;

      // Move all children to root level
      const updatedTasks = prev.map(task =>
        task.parentId === groupId ? { ...task, parentId: null } : task
      );

      // Remove the group task
      return updatedTasks.filter(task => task.id !== groupId);
    });

    console.log('Task ungrouped:', groupId);
  }, []);

  const toggleGroupCollapse = useCallback(groupId => {
    setTasks(prev =>
      prev.map(task =>
        task.id === groupId ? { ...task, isExpanded: !task.isExpanded } : task
      )
    );
  }, []);

  // Reordering operations
  const reorderTasks = useCallback((sourceIndex, destinationIndex) => {
    setTasks(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(sourceIndex, 1);
      updated.splice(destinationIndex, 0, moved);
      return updated;
    });
  }, []);

  const reorderTasksById = useCallback(
    (sourceId, destinationId, position = 'after') => {
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
    []
  );

  // Helper functions
  const getHierarchicalTasks = useCallback(() => {
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
            case 'Delayed Tasks':
              const today = new Date();
              const endDate = new Date(task.endDate);
              shouldInclude = endDate < today && task.progress < 100;
              break;
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

      addVisible(getHierarchicalTasks());
      return visible;
    },
    [getHierarchicalTasks]
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

  const value = {
    // Task data
    tasks,
    nextId,
    taskLinks,

    // Selection and hover state
    selectedTaskId,
    setSelectedTaskId,
    hoveredTaskId,
    setHoveredTaskId,
    selectedTaskIds,
    setSelectedTaskIds,

    // Linking mode
    linkingMode,
    linkStartTaskId,

    // Task operations
    addTask,
    deleteTask,
    updateTask,
    selectTask,
    selectMultipleTasks,
    clearSelection,
    setHoveredTask,
    clearHoveredTask,

    // Linking operations
    linkTasks,
    unlinkTasks,
    startLinkingMode,
    stopLinkingMode,
    handleTaskClickForLinking,

    // Grouping operations
    groupTasks,
    ungroupTask,
    toggleGroupCollapse,

    // Reordering operations
    reorderTasks,
    reorderTasksById,

    // Helper functions
    getHierarchicalTasks,
    getVisibleTasks,
    getTaskDescendants,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
