import React, { createContext, useContext, useState } from 'react';

const TaskContext = createContext();

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  // Initialize with sample tasks for testing
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: 'Foundation Work',
      startDate: '2025-07-28',
      endDate: '2025-08-02',
      duration: 5,
      status: 'Planned',
      description: 'Excavation and foundation construction',
      progress: 0,
      priority: 'High',
      assignedTo: 'Construction Team',
      createdAt: '2025-07-28T10:00:00Z',
      parentId: null,
      isGroup: false,
      isExpanded: true,
    },
    {
      id: 2,
      name: 'Structural Framework',
      startDate: '2025-08-03',
      endDate: '2025-08-15',
      duration: 12,
      status: 'Planned',
      description: 'Steel framework and concrete structure',
      progress: 0,
      priority: 'High',
      assignedTo: 'Structural Team',
      createdAt: '2025-07-28T10:00:00Z',
      parentId: null,
      isGroup: false,
      isExpanded: true,
    },
    {
      id: 3,
      name: 'Electrical Installation',
      startDate: '2025-08-16',
      endDate: '2025-08-25',
      duration: 9,
      status: 'Planned',
      description: 'Electrical systems and wiring',
      progress: 0,
      priority: 'Medium',
      assignedTo: 'Electrical Team',
      createdAt: '2025-07-28T10:00:00Z',
      parentId: null,
      isGroup: false,
      isExpanded: true,
    }
  ]);
  const [nextId, setNextId] = useState(4); // Start after sample tasks
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]); // For multi-selection
  const [taskLinks, setTaskLinks] = useState([
    // Sample dependency: Foundation → Structural
    { fromId: 1, toId: 2 },
    // Sample dependency: Structural → Electrical
    { fromId: 2, toId: 3 }
  ]); // Store task dependencies

  // Linking mode state
  const [linkingMode, setLinkingMode] = useState(false);
  const [linkStartTaskId, setLinkStartTaskId] = useState(null);

  // Helper function to get hierarchical tasks
  const getHierarchicalTasks = () => {
    const taskMap = new Map();
    const rootTasks = [];

    // First pass: create map of all tasks
    tasks.forEach(task => {
      taskMap.set(task.id, { ...task, children: [] });
    });

    // Second pass: build hierarchy
    tasks.forEach(task => {
      if (task.parentId) {
        const parent = taskMap.get(task.parentId);
        if (parent) {
          parent.children.push(taskMap.get(task.id));
        }
      } else {
        rootTasks.push(taskMap.get(task.id));
      }
    });

    return rootTasks;
  };

  // Helper function to get all visible tasks (expanded groups)
  const getVisibleTasks = () => {
    const visible = [];
    
    const addVisibleTasks = (taskList, depth = 0) => {
      taskList.forEach(task => {
        visible.push({ ...task, depth });
        if (task.isGroup && task.isExpanded && task.children) {
          addVisibleTasks(task.children, depth + 1);
        }
      });
    };

    addVisibleTasks(getHierarchicalTasks());
    return visible;
  };

  // Helper function to get all descendants of a task
  const getTaskDescendants = (taskId) => {
    const descendants = [];
    
    const addDescendants = (task) => {
      if (task.children) {
        task.children.forEach(child => {
          descendants.push(child.id);
          addDescendants(child);
        });
      }
    };

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      addDescendants(task);
    }
    
    return descendants;
  };

  const addTask = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const newTask = {
      id: nextId,
      name: `New Task ${nextId}`,
      startDate: today.toISOString().split('T')[0], // YYYY-MM-DD format
      endDate: tomorrow.toISOString().split('T')[0],
      duration: 1, // Calculate duration in days
      status: 'Planned',
      description: 'New task description',
      progress: 0,
      priority: 'Medium',
      assignedTo: '',
      createdAt: new Date().toISOString(),
      parentId: null,
      isGroup: false,
      isExpanded: true,
    };

    setTasks(prevTasks => [...prevTasks, newTask]);
    setNextId(prevId => prevId + 1);

    console.log('Task added:', newTask);
    return newTask;
  };

  const deleteTask = (taskId = null) => {
    const taskToDelete = taskId || selectedTaskId;

    if (!taskToDelete) {
      console.log('No task selected for deletion');
      return;
    }

    const taskToDeleteData = tasks.find(task => task.id === taskToDelete);

    // If deleting a group, also delete all its children
    const taskToDeleteObj = tasks.find(task => task.id === taskToDelete);
    let tasksToDelete = [taskToDelete];
    
    if (taskToDeleteObj?.isGroup) {
      const descendants = getTaskDescendants(taskToDelete);
      tasksToDelete = [...tasksToDelete, ...descendants];
    }

    setTasks(prevTasks => prevTasks.filter(task => !tasksToDelete.includes(task.id)));

    // Clear selection if the deleted task was selected
    if (selectedTaskId === taskToDelete) {
      setSelectedTaskId(null);
    }

    // Remove from multi-selection if present
    setSelectedTaskIds(prev => prev.filter(id => !tasksToDelete.includes(id)));

    // Remove any links involving the deleted tasks
    setTaskLinks(prevLinks => prevLinks.filter(link =>
      !tasksToDelete.includes(link.fromId) && !tasksToDelete.includes(link.toId)
    ));

    console.log('Task deleted:', taskToDeleteData);
  };

  const updateTask = (taskId, updates) => {
    setTasks(prevTasks => {
      const taskIndex = prevTasks.findIndex(task => task.id === taskId);
      if (taskIndex === -1) return prevTasks;

      const currentTask = prevTasks[taskIndex];
      let updatedTask = { ...currentTask, ...updates };

      // Intelligent date and duration calculations
      if (updates.startDate || updates.endDate || updates.duration) {
        const startDate = updates.startDate || currentTask.startDate;
        const endDate = updates.endDate || currentTask.endDate;
        const duration = updates.duration || currentTask.duration;

        // If start or end date changed, recalculate duration
        if (updates.startDate || updates.endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          
          // Validate dates
          if (end < start) {
            console.warn('End date cannot be before start date');
            return prevTasks; // Don't update if invalid
          }
          
          const diffTime = Math.abs(end - start);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          updatedTask = {
            ...updatedTask,
            duration: diffDays,
            startDate,
            endDate
          };
        }
        // If duration changed, recalculate end date
        else if (updates.duration) {
          const start = new Date(startDate);
          const newDuration = Math.max(1, duration); // Minimum 1 day
          const end = new Date(start);
          end.setDate(start.getDate() + newDuration - 1); // -1 because start day counts as day 1
          
          updatedTask = {
            ...updatedTask,
            duration: newDuration,
            endDate: end.toISOString().split('T')[0]
          };
        }
      }

      const newTasks = [...prevTasks];
      newTasks[taskIndex] = updatedTask;
      return newTasks;
    });
    
    console.log('Task updated:', taskId, updates);
  };

  const selectTask = (taskId) => {
    setSelectedTaskId(taskId);
    setSelectedTaskIds([taskId]); // Ensure single selection also updates multi-selection array
    console.log('Task selected:', taskId);
  };

  const selectMultipleTasks = (taskId, isMultiSelect = false) => {
    if (!isMultiSelect) {
      // Single selection mode
      setSelectedTaskIds([taskId]);
      setSelectedTaskId(taskId);
      console.log('Single task selected:', taskId);
    } else {
      // Multi-selection mode
      setSelectedTaskIds(prev => {
        if (prev.includes(taskId)) {
          // Remove if already selected
          const newSelection = prev.filter(id => id !== taskId);
          setSelectedTaskId(newSelection.length === 1 ? newSelection[0] : null);
          return newSelection;
        } else {
          // Add to selection (max 2 tasks)
          if (prev.length >= 2) {
            // Reset to just this task if more than 2 are attempted
            setSelectedTaskId(taskId);
            return [taskId];
          } else {
            const newSelection = [...prev, taskId];
            setSelectedTaskId(newSelection.length === 1 ? newSelection[0] : null);
            return newSelection;
          }
        }
      });
      console.log('Multi-selection updated');
    }
  };

  const clearSelection = () => {
    setSelectedTaskId(null);
    setSelectedTaskIds([]);
    console.log('Task selection cleared');
  };

  // Task grouping functions
  const groupTasks = (selectedIds, groupName) => {
    if (selectedIds.length < 2) {
      console.log('Need at least 2 tasks to create a group');
      return false;
    }

    // Create new group task
    const groupTask = {
      id: nextId,
      name: groupName,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      duration: 1,
      status: 'Planned',
      description: `Group containing ${selectedIds.length} tasks`,
      progress: 0,
      priority: 'Medium',
      assignedTo: '',
      createdAt: new Date().toISOString(),
      parentId: null,
      isGroup: true,
      isExpanded: true,
    };

    // Update selected tasks to have the group as parent
    setTasks(prevTasks => [
      ...prevTasks.map(task => 
        selectedIds.includes(task.id) 
          ? { ...task, parentId: nextId }
          : task
      ),
      groupTask
    ]);

    setNextId(prevId => prevId + 1);
    console.log(`Group "${groupName}" created with ${selectedIds.length} tasks`);
    return true;
  };

  const ungroupTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task?.isGroup) {
      console.log('Task is not a group');
      return false;
    }

    // Remove parentId from all children
    setTasks(prevTasks => 
      prevTasks.map(t => 
        t.parentId === taskId 
          ? { ...t, parentId: null }
          : t
      ).filter(t => t.id !== taskId) // Remove the group task
    );

    console.log(`Group "${task.name}" ungrouped`);
    return true;
  };

  const toggleGroupCollapse = (groupId) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === groupId
          ? { ...task, isExpanded: !task.isExpanded }
          : task
      )
    );
    console.log(`Group ${groupId} ${tasks.find(t => t.id === groupId)?.isExpanded ? 'collapsed' : 'expanded'}`);
  };

  // Task linking functions
  const startLinkingMode = () => {
    setLinkingMode(true);
    setLinkStartTaskId(null);
    console.log('Linking mode activated');
  };

  const stopLinkingMode = () => {
    setLinkingMode(false);
    setLinkStartTaskId(null);
    console.log('Linking mode deactivated');
  };

  const handleTaskClickForLinking = (taskId) => {
    if (!linkingMode) return;

    if (!linkStartTaskId) {
      // First click - set as start task
      setLinkStartTaskId(taskId);
      const startTask = tasks.find(task => task.id === taskId);
      console.log(`Link started: ${startTask?.name || taskId}`);
    } else {
      // Second click - create the link
      if (linkStartTaskId === taskId) {
        console.log('Cannot link a task to itself');
        stopLinkingMode();
        return;
      }

      const success = linkTasks(linkStartTaskId, taskId);
      if (success) {
        const startTask = tasks.find(task => task.id === linkStartTaskId);
        const endTask = tasks.find(task => task.id === taskId);
        console.log(`Link created: ${startTask?.name || linkStartTaskId} → ${endTask?.name || taskId}`);
      }
      
      // Exit linking mode after creating link
      stopLinkingMode();
    }
  };

  const linkTasks = (fromId, toId) => {
    // Ensure fromId and toId are different
    if (fromId === toId) {
      console.log('Cannot link a task to itself');
      return false;
    }

    // Check if link already exists
    const linkExists = taskLinks.some(link =>
      (link.fromId === fromId && link.toId === toId) ||
      (link.fromId === toId && link.toId === fromId) // Also check reverse for simplicity
    );

    if (linkExists) {
      console.log('Link already exists between these tasks');
      return false;
    }

    // Check for circular dependencies
    const wouldCreateCycle = checkForCircularDependency(fromId, toId);
    if (wouldCreateCycle) {
      console.log('Cannot create link - would create circular dependency');
      return false;
    }

    const newLink = { fromId, toId };
    setTaskLinks(prev => [...prev, newLink]);

    const fromTask = tasks.find(task => task.id === fromId);
    const toTask = tasks.find(task => task.id === toId);

    console.log(`Linked ${fromTask?.name || fromId} → ${toTask?.name || toId}`);
    return true;
  };

  const checkForCircularDependency = (fromId, toId) => {
    const visited = new Set();

    const checkPath = (currentId) => {
      if (currentId === fromId) return true;
      if (visited.has(currentId)) return false;

      visited.add(currentId);
      const predecessors = taskLinks
        .filter(link => link.toId === currentId)
        .map(link => link.fromId);

      return predecessors.some(predId => checkPath(predId));
    };

    return checkPath(toId);
  };

  const unlinkTasks = (fromId, toId) => {
    setTaskLinks(prev => prev.filter(link =>
      !(link.fromId === fromId && link.toId === toId)
    ));
    console.log(`Unlinked task ${fromId} → ${toId}`);
  };

  const value = {
    tasks,
    selectedTaskId,
    selectedTaskIds,
    taskLinks,
    linkingMode,
    linkStartTaskId,
    addTask,
    deleteTask,
    updateTask,
    selectTask,
    selectMultipleTasks,
    clearSelection,
    linkTasks,
    unlinkTasks,
    startLinkingMode,
    stopLinkingMode,
    handleTaskClickForLinking,
    // Grouping functions
    getHierarchicalTasks,
    getVisibleTasks,
    groupTasks,
    ungroupTask,
    toggleGroupCollapse,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
