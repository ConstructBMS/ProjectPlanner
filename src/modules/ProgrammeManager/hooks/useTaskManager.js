import { useTaskContext } from '../context/TaskContext';

const useTaskManager = () => {
  const {
    addTask,
    addMilestone,
    deleteTask,
    linkTasks,
    unlinkTasks,
    groupTasks,
    ungroupTask,
    selectTask,
    clearSelection,
    selectedTaskId,
    selectedTaskIds,
    tasks,
  } = useTaskContext();

  const openTaskDetails = () => {
    if (!selectedTaskId) {
      console.log('No task selected for details');
      return;
    }
    console.log('Open task details panel for task:', selectedTaskId);
    // This will be handled by the TaskModal component
  };

  const openTaskNotes = () => {
    if (!selectedTaskId) {
      console.log('No task selected for notes');
      return;
    }
    console.log('Open task notes modal for task:', selectedTaskId);
    // TODO: Implement task notes modal
  };

  const addCode = () => {
    if (!selectedTaskId) {
      console.log('No task selected for adding code');
      return;
    }
    console.log('Add task code for task:', selectedTaskId);
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
    if (tasks.length === 0) {
      console.log('No tasks available to select');
      return;
    }
    const allTaskIds = tasks.map(task => task.id);
    // Note: This would need to be implemented in TaskContext
    console.log('Select all tasks:', allTaskIds);
  };

  const deselectAll = () => {
    console.log('Deselect all tasks');
    clearSelection();
  };

  return {
    addTask,
    addMilestone,
    deleteTask,
    linkTasks,
    unlinkTasks,
    openTaskDetails,
    openTaskNotes,
    addCode,
    createGroup,
    ungroup,
    selectAll,
    deselectAll,
  };
};

export default useTaskManager;
