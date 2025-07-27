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

    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete));

    // Clear selection if the deleted task was selected
    if (selectedTaskId === taskToDelete) {
      setSelectedTaskId(null);
    }

    // Remove from multi-selection if present
    setSelectedTaskIds(prev => prev.filter(id => id !== taskToDelete));

    // Remove any links involving the deleted task
    setTaskLinks(prevLinks => prevLinks.filter(link =>
      link.fromId !== taskToDelete && link.toId !== taskToDelete
    ));

    console.log('Task deleted:', taskToDeleteData);
  };

  const updateTask = (taskId, updates) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
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
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
