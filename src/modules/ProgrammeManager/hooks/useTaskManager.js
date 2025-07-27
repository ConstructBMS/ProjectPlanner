import { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';

const useTaskManager = () => {
  const [lastAction, setLastAction] = useState('No actions yet');
  const {
    addTask: contextAddTask,
    deleteTask: contextDeleteTask,
    updateTask: contextUpdateTask,
    selectedTaskId,
    selectedTaskIds,
    linkTasks: contextLinkTasks
  } = useTaskContext();

  const addTask = () => {
    const newTask = contextAddTask();
    setLastAction('Add Task');
    return newTask;
  };

  const deleteTask = () => {
    if (!selectedTaskId) {
      console.log('Delete Task - No task selected');
      setLastAction('Delete Task - No selection');
      return;
    }

    contextDeleteTask(); // Uses selectedTaskId from context
    setLastAction('Delete Task');
  };

  const linkTasks = () => {
    if (selectedTaskIds.length !== 2) {
      console.log('Link Tasks - Need exactly 2 tasks selected');
      setLastAction('Link Tasks - Need 2 tasks');
      return;
    }

    const [fromId, toId] = selectedTaskIds;
    const success = contextLinkTasks(fromId, toId);
    
    if (success) {
      setLastAction('Link Tasks');
    } else {
      setLastAction('Link Tasks - Failed');
    }
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
