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

  const clearSelection = () => {
    setSelectedTaskId(null);
    console.log('Task selection cleared');
  };

  const value = {
    tasks,
    selectedTaskId,
    addTask,
    deleteTask,
    updateTask,
    selectTask,
    clearSelection,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
