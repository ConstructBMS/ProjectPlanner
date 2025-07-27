import { useTaskContext } from '../context/TaskContext';

const useTaskManager = () => {
  const {
    addTask,
    deleteTask,
    linkTasks,
    unlinkTasks,
    groupTasks,
    ungroupTask,
    selectTask,
    clearSelection,
    selectedTaskId,
    selectedTaskIds
  } = useTaskContext();

  const openTaskDetails = () => {
    console.log('Open task details panel');
    // This will be handled by the TaskModal component
  };

  const openTaskNotes = () => {
    console.log('Open task notes modal');
    // TODO: Implement task notes modal
  };

  const addCode = () => {
    if (!selectedTaskId) {
      console.log('No task selected for adding code');
      return;
    }
    console.log('Add task code');
    // TODO: Implement code library integration
  };

  const createGroup = () => {
    if (selectedTaskIds.length < 2) {
      console.log('Need at least 2 tasks selected to create a group');
      return;
    }
    
    const groupName = prompt('Enter group name:');
    if (groupName) {
      groupTasks(selectedTaskIds, groupName);
    }
  };

  const ungroup = () => {
    if (!selectedTaskId) {
      console.log('No task selected for ungrouping');
      return;
    }
    ungroupTask(selectedTaskId);
  };

  const selectAll = () => {
    console.log('Select all tasks');
    // TODO: Implement select all functionality
  };

  const deselectAll = () => {
    console.log('Deselect all tasks');
    clearSelection();
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
    deselectAll
  };
};

export default useTaskManager;
