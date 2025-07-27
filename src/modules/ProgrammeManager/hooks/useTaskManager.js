import { useState } from 'react';

const useTaskManager = () => {
  const [lastAction, setLastAction] = useState('No actions yet');

  const addTask = () => {
    console.log('Task added');
    setLastAction('Add Task');
  };

  const deleteTask = () => {
    console.log('Task deleted');
    setLastAction('Delete Task');
  };

  const linkTasks = () => {
    console.log('Tasks linked');
    setLastAction('Link Tasks');
  };

  const unlinkTasks = () => {
    console.log('Tasks unlinked');
    setLastAction('Unlink Tasks');
  };

  const openTaskDetails = () => {
    console.log('Open task details panel');
    setLastAction('Open Task Details');
  };

  const openTaskNotes = () => {
    console.log('Open task notes modal');
    setLastAction('Open Task Notes');
  };

  const addCode = () => {
    console.log('Add task code');
    setLastAction('Add Code');
  };

  const createGroup = () => {
    console.log('Create group');
    setLastAction('Create Group');
  };

  const ungroup = () => {
    console.log('Ungroup');
    setLastAction('Ungroup');
  };

  const selectAll = () => {
    console.log('Select all tasks');
    setLastAction('Select All');
  };

  const deselect = () => {
    console.log('Deselect all tasks');
    setLastAction('Deselect');
  };

  const scrollToToday = () => {
    console.log('Scroll to today');
    setLastAction('Scroll to Today');
  };

  return {
    addTask,
    deleteTask,
    linkTasks,
    unlinkTasks,
    openTaskDetails,
    openTaskNotes,
    addCode,
    createGroup,
    ungroup,
    selectAll,
    deselect,
    scrollToToday,
    lastAction,
  };
};

export default useTaskManager; 