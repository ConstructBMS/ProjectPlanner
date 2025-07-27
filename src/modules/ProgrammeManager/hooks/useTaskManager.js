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
    tasks,
    linkTasks: contextLinkTasks,
    unlinkTasks: contextUnlinkTasks,
    clearSelection: contextClearSelection,
    linkingMode,
    startLinkingMode: contextStartLinkingMode,
    stopLinkingMode: contextStopLinkingMode,
    groupTasks: contextGroupTasks,
    ungroupTask: contextUngroupTask,
    toggleGroupCollapse: contextToggleGroupCollapse
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
    // Start linking mode instead of requiring 2 selected tasks
    contextStartLinkingMode();
    setLastAction('Link Tasks - Mode activated');
    console.log('Link Tasks button clicked - linking mode activated');
  };

  const unlinkTasks = () => {
    if (selectedTaskIds.length !== 2) {
      console.log('Please select exactly two tasks to unlink.');
      setLastAction('Unlink Tasks - Need 2 tasks');
      return;
    }

    const [fromId, toId] = selectedTaskIds;
    contextUnlinkTasks(fromId, toId);
    setLastAction('Unlink Tasks');
  };

  const openTaskNotes = () => {
    if (!selectedTaskId) {
      console.log('Open Task Notes - No task selected');
      setLastAction('Open Task Notes - No selection');
      return;
    }
    console.log('Open task notes modal for task:', selectedTaskId);
    setLastAction('Open Task Notes');
  };

  const addCode = () => {
    if (!selectedTaskId) {
      console.log('Add Code - No task selected');
      setLastAction('Add Code - No selection');
      return;
    }
    console.log('Add task code for task:', selectedTaskId);
    setLastAction('Add Code');
  };

  const createGroup = () => {
    if (selectedTaskIds.length < 2) {
      console.log('Create Group - Need at least 2 tasks selected');
      setLastAction('Create Group - Need 2+ tasks');
      return;
    }

    // Prompt for group name
    const groupName = prompt('Enter group name:', `Group ${selectedTaskIds.length} Tasks`);
    if (!groupName) {
      console.log('Create Group - Cancelled by user');
      setLastAction('Create Group - Cancelled');
      return;
    }

    const success = contextGroupTasks(selectedTaskIds, groupName);
    if (success) {
      setLastAction(`Create Group - "${groupName}"`);
    } else {
      setLastAction('Create Group - Failed');
    }
  };

  const ungroup = () => {
    if (!selectedTaskId) {
      console.log('Ungroup - No task selected');
      setLastAction('Ungroup - No selection');
      return;
    }

    const selectedTask = tasks.find(task => task.id === selectedTaskId);
    if (!selectedTask?.isGroup) {
      console.log('Ungroup - Selected task is not a group');
      setLastAction('Ungroup - Not a group');
      return;
    }

    const success = contextUngroupTask(selectedTaskId);
    if (success) {
      setLastAction(`Ungroup - "${selectedTask.name}"`);
    } else {
      setLastAction('Ungroup - Failed');
    }
  };

  const selectAll = () => {
    if (tasks.length === 0) {
      console.log('Select All - No tasks available');
      setLastAction('Select All - No tasks');
      return;
    }
    const allTaskIds = tasks.map(task => task.id);
    // Note: This would need to be implemented in TaskContext
    console.log('Select all tasks:', allTaskIds);
    setLastAction('Select All');
  };

  const deselect = () => {
    contextClearSelection();
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
    openTaskNotes,
    addCode,
    createGroup,
    ungroup,
    selectAll,
    deselect,
    scrollToToday,
    lastAction,
    linkingMode,
  };
};

export default useTaskManager;
