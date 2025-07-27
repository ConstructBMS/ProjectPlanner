import React from 'react';
import { useTaskContext } from '../context/TaskContext';

const TaskGrid = () => {
  const {
    tasks,
    selectedTaskId,
    selectedTaskIds,
    linkingMode,
    linkStartTaskId,
    deleteTask,
    updateTask,
    selectTask,
    selectMultipleTasks,
    handleTaskClickForLinking
  } = useTaskContext();

  const handleDeleteTask = (taskId, e) => {
    e.stopPropagation(); // Prevent row selection when clicking delete
    deleteTask(taskId);
  };

  const handleNameChange = (taskId, newName, e) => {
    e.stopPropagation(); // Prevent row selection when editing name
    updateTask(taskId, { name: newName });
  };

  const handleRowClick = (taskId, e) => {
    // If in linking mode, handle linking logic
    if (linkingMode) {
      handleTaskClickForLinking(taskId);
      return;
    }

    // Normal selection logic
    const isMultiSelect = e.shiftKey || e.ctrlKey || e.metaKey;
    selectMultipleTasks(taskId, isMultiSelect);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Planned':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'On Hold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRowHighlightClass = (taskId) => {
    const isSelected = selectedTaskId === taskId;
    const isMultiSelected = selectedTaskIds.includes(taskId);
    const isLinkStart = linkingMode && linkStartTaskId === taskId;

    if (isLinkStart) {
      return 'bg-purple-100 border-l-4 border-purple-500';
    } else if (isMultiSelected) {
      return 'bg-yellow-100 border-l-4 border-yellow-500';
    } else if (isSelected) {
      return 'bg-blue-100 border-l-4 border-blue-500';
    } else {
      return 'hover:bg-gray-50';
    }
  };

  const getSelectionStatus = () => {
    if (linkingMode) {
      if (linkStartTaskId) {
        const startTask = tasks.find(task => task.id === linkStartTaskId);
        return `Linking mode: Click another task to link from "${startTask?.name || linkStartTaskId}"`;
      } else {
        return 'Linking mode: Click first task to start link';
      }
    } else if (selectedTaskIds.length === 0) {
      return 'No task selected';
    } else if (selectedTaskIds.length === 1) {
      return '1 task selected';
    } else if (selectedTaskIds.length === 2) {
      return '2 tasks selected (ready to link)';
    } else {
      return `${selectedTaskIds.length} tasks selected`;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-700">Task Grid</h3>
        <p className="text-xs text-gray-500 mt-1">Task list and management</p>
        <p className="text-xs text-blue-600 mt-1">
          {linkingMode ? (
            <span className="text-purple-600 font-medium">
              🔗 Linking Mode Active - Click tasks to create dependencies
            </span>
          ) : (
            '💡 Tip: Shift+Click to select multiple tasks for linking'
          )}
        </p>
      </div>

      {/* Task Table */}
      <div className="flex-1 overflow-auto">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-2xl mb-2">📋</div>
              <div className="text-sm">No tasks yet</div>
              <div className="text-xs">Click "Add Task" in the ribbon to create your first task</div>
            </div>
          </div>
        ) : (
          <div className="min-w-full">
            {/* Table Header */}
            <div className="bg-gray-50 border-b grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-gray-600">
              <div className="col-span-4">Task Name</div>
              <div className="col-span-2">Start Date</div>
              <div className="col-span-2">End Date</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Priority</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Task Rows */}
            <div className="divide-y divide-gray-200">
              {tasks.map((task) => {
                const isSelected = selectedTaskId === task.id;
                const isMultiSelected = selectedTaskIds.includes(task.id);
                const isLinkStart = linkingMode && linkStartTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    className={`grid grid-cols-12 gap-2 px-3 py-2 text-sm cursor-pointer transition-colors duration-150 ${getRowHighlightClass(task.id)}`}
                    onClick={(e) => handleRowClick(task.id, e)}
                  >
                    {/* Task Name */}
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={task.name}
                        onChange={(e) => handleNameChange(task.id, e.target.value, e)}
                        className={`w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 py-0.5 ${
                          isLinkStart ? 'bg-purple-50' : isMultiSelected ? 'bg-yellow-50' : isSelected ? 'bg-blue-50' : ''
                        }`}
                      />
                    </div>

                    {/* Start Date */}
                    <div className="col-span-2 text-gray-600">
                      {task.startDate}
                    </div>

                    {/* End Date */}
                    <div className="col-span-2 text-gray-600">
                      {task.endDate}
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>

                    {/* Priority */}
                    <div className="col-span-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1">
                      <button
                        onClick={(e) => handleDeleteTask(task.id, e)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium"
                        title="Delete task"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t px-4 py-2">
        <div className="text-xs text-gray-500">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} • {getSelectionStatus()}
        </div>
      </div>
    </div>
  );
};

export default TaskGrid;
