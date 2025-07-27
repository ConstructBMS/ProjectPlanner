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
  const [tasks, setTasks] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]); // For multi-selection
  const [taskLinks, setTaskLinks] = useState([]); // Store task dependencies

  const addTask = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const newTask = {
      id: nextId,
      name: `New Task ${nextId}`,
      startDate: today.toISOString().split('T')[0], // YYYY-MM-DD format
      endDate: tomorrow.toISOString().split('T')[0],
      status: 'Planned',
      description: '',
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
            // Reset to just this task
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

  const linkTasks = (fromId, toId) => {
    // Check if link already exists
    const linkExists = taskLinks.some(link => 
      link.fromId === fromId && link.toId === toId
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
    // Simple cycle detection - check if toId is already a predecessor of fromId
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
    addTask,
    deleteTask,
    updateTask,
    selectTask,
    selectMultipleTasks,
    clearSelection,
    linkTasks,
    unlinkTasks,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
