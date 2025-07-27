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

  const deleteTask = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    console.log('Task deleted:', taskId);
  };

  const updateTask = (taskId, updates) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
    console.log('Task updated:', taskId, updates);
  };

  const value = {
    tasks,
    addTask,
    deleteTask,
    updateTask,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
