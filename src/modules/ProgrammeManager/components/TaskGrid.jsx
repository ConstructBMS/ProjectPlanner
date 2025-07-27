import React from 'react';
import { useTaskContext } from '../context/TaskContext';

const TaskGrid = () => {
  const { tasks, deleteTask, updateTask } = useTaskContext();

  const handleDeleteTask = (taskId) => {
    deleteTask(taskId);
  };

  const handleNameChange = (taskId, newName) => {
    updateTask(taskId, { name: newName });
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

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-700">Task Grid</h3>
        <p className="text-xs text-gray-500 mt-1">Task list and management</p>
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
              {tasks.map((task) => (
                <div key={task.id} className="grid grid-cols-12 gap-2 px-3 py-2 hover:bg-gray-50 text-sm">
                  {/* Task Name */}
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={task.name}
                      onChange={(e) => handleNameChange(task.id, e.target.value)}
                      className="w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 py-0.5"
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
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-600 hover:text-red-800 text-xs"
                      title="Delete task"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t px-4 py-2">
        <div className="text-xs text-gray-500">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} • Click "Add Task" to create new tasks
        </div>
      </div>
    </div>
  );
};

export default TaskGrid;
