import { useState, useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { useCalendarContext } from '../context/CalendarContext';
import { useUndoRedoContext } from '../context/UndoRedoContext';
import { supabase } from '../../../supabase/client';
import DeleteTaskModal from './modals/DeleteTaskModal';
import NotesTab from './TaskPropertiesPane/NotesTab';
import AttachmentsTab from './TaskPropertiesPane/AttachmentsTab';
import { SketchPicker } from 'react-color';
import {
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  FlagIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  CogIcon,
  PaintBrushIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import {
  CONSTRAINT_TYPES,
  getConstraintLabel,
  getConstraintDescription,
  getConstraintStyling,
  validateConstraint,
  checkConstraintConflicts,
  getConstraintTooltip,
  getAvailableConstraintTypes,
} from '../utils/constraintUtils';
import RecurringTaskConfig from './RecurringTaskConfig';
import {
  calculateTaskCost,
  formatCost,
  getCostVariance,
} from '../utils/costUtils';

// Task Properties Pane Component
const TaskPropertiesPane = () => {
  const {
    selectedTaskId,
    tasks,
    updateTask,
    taskLinks,
    linkTasks,
    unlinkTasks,
    updateLink,
  } = useTaskContext();

  const {
    getCalendarForTask,
    setTaskCalendar,
    removeTaskCalendar,
    hasTaskCalendar,
    globalCalendar,
    projectCalendars,
    getProjectCalendarById,
  } = useCalendarContext();

  const { isUndoRedoAction } = useUndoRedoContext();
  const [editingTask, setEditingTask] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddDependencyModal, setShowAddDependencyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalSelectedTaskId, setModalSelectedTaskId] = useState('');
  const [modalLinkType, setModalLinkType] = useState('FS');
  const [modalLag, setModalLag] = useState(0);
  const [activeTab, setActiveTab] = useState('properties');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [constraintValidation, setConstraintValidation] = useState({
    isValid: true,
    errors: [],
    warnings: [],
  });

  // Get the currently selected task
  const selectedTask = tasks.find(task => task.id === selectedTaskId);

  // Default colors for different task types
  const getDefaultColor = task => {
    if (task.type === 'milestone' || task.isMilestone) {
      return '#8B5CF6'; // Purple for milestones
    } else if (task.isGroup) {
      return '#10B981'; // Green for groups
    } else {
      return '#3B82F6'; // Blue for regular tasks
    }
  };

  // Get current task color or default
  const getCurrentColor = task => {
    return task.color || getDefaultColor(task);
  };

  // Handle color change
  const handleColorChange = color => {
    handleFieldChange('color', color.hex);
  };

  // Reset to default color
  const handleResetColor = () => {
    handleFieldChange('color', null);
  };

  // Constraint handling functions
  const handleConstraintChange = constraintType => {
    if (!editingTask) return;

    let newConstraint = null;

    if (constraintType === CONSTRAINT_TYPES.ASAP) {
      // Remove constraint for ASAP
      newConstraint = null;
    } else {
      // Set constraint type, keep existing date if applicable
      const currentDate =
        editingTask.constraints?.date || new Date().toISOString().split('T')[0];
      newConstraint = {
        type: constraintType,
        date: [
          CONSTRAINT_TYPES.MSO,
          CONSTRAINT_TYPES.MFO,
          CONSTRAINT_TYPES.SNET,
          CONSTRAINT_TYPES.FNLT,
        ].includes(constraintType)
          ? currentDate
          : null,
      };
    }

    const updatedTask = { ...editingTask, constraints: newConstraint };
    setEditingTask(updatedTask);
    setHasChanges(true);

    // Validate constraint
    const validation = validateConstraint(newConstraint);
    setConstraintValidation(validation);
  };

  const handleConstraintDateChange = date => {
    if (!editingTask || !editingTask.constraints) return;

    const updatedConstraint = { ...editingTask.constraints, date };
    const updatedTask = { ...editingTask, constraints: updatedConstraint };
    setEditingTask(updatedTask);
    setHasChanges(true);

    // Validate constraint
    const validation = validateConstraint(updatedConstraint);
    setConstraintValidation(validation);
  };

  const clearConstraint = () => {
    if (!editingTask) return;

    const updatedTask = { ...editingTask, constraints: null };
    setEditingTask(updatedTask);
    setHasChanges(true);
    setConstraintValidation({ isValid: true, errors: [], warnings: [] });
  };

  // Initialize editing task when selection changes
  useEffect(() => {
    if (selectedTask) {
      setEditingTask({ ...selectedTask });
      setHasChanges(false);

      // Validate constraints
      if (selectedTask.constraints) {
        const validation = validateConstraint(selectedTask.constraints);
        setConstraintValidation(validation);
      } else {
        setConstraintValidation({ isValid: true, errors: [], warnings: [] });
      }
    } else {
      setEditingTask(null);
      setHasChanges(false);
      setConstraintValidation({ isValid: true, errors: [], warnings: [] });
    }
  }, [selectedTask]);

  const handleFieldChange = (field, value) => {
    if (!editingTask) return;

    const updatedTask = { ...editingTask, [field]: value };
    setEditingTask(updatedTask);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!editingTask || !hasChanges || !selectedTask) return;

    // Add history entries for changed fields
    Object.keys(editingTask).forEach(field => {
      if (editingTask[field] !== selectedTask[field] && field !== 'history') {
        const oldValue = selectedTask[field];
        const newValue = editingTask[field];

        // Format values for display
        const formatValue = value => {
          if (value === null || value === undefined) return 'None';
          if (typeof value === 'boolean') return value ? 'Yes' : 'No';
          if (field === 'startDate' || field === 'endDate') {
            return new Date(value).toLocaleDateString();
          }
          return String(value);
        };

        addHistoryEntry(
          editingTask.id,
          'Changed',
          field,
          formatValue(oldValue),
          formatValue(newValue)
        );
      }
    });

    updateTask(editingTask.id, editingTask);
    setHasChanges(false);
    console.log('Task properties saved:', editingTask);
  };

  const handleCancel = () => {
    if (selectedTask) {
      setEditingTask({ ...selectedTask });
      setHasChanges(false);
    }
  };

  // Get task predecessors and successors with link information
  const predecessors = taskLinks
    .filter(link => link.toId === selectedTaskId)
    .map(link => {
      const task = tasks.find(task => task.id === link.fromId);
      return task
        ? { ...task, linkId: link.id, lag: link.lag || 0, linkType: link.type }
        : null;
    })
    .filter(Boolean);

  const successors = taskLinks
    .filter(link => link.fromId === selectedTaskId)
    .map(link => {
      const task = tasks.find(task => task.id === link.toId);
      return task
        ? { ...task, linkId: link.id, lag: link.lag || 0, linkType: link.type }
        : null;
    })
    .filter(Boolean);

  const handleRemoveDependency = linkId => {
    if (linkId) {
      const link = taskLinks.find(l => l.id === linkId);
      if (link) {
        unlinkTasks(link.fromId, link.toId);
        console.log('Removed dependency:', link);
      }
    }
  };

  const handleUpdateLag = (linkId, newLag) => {
    if (linkId) {
      const lag = parseInt(newLag) || 0;
      updateLink(linkId, { lag });
      console.log('Updated lag for link:', linkId, 'to:', lag);
    }
  };

  const handleAddDependency = () => {
    if (!modalSelectedTaskId || !selectedTaskId) return;

    // Validate that we're not creating a self-link
    if (modalSelectedTaskId === selectedTaskId) {
      console.error('Cannot link a task to itself');
      return;
    }

    // Create the link based on the selected task and current task
    linkTasks(modalSelectedTaskId, selectedTaskId, modalLinkType, modalLag);

    // Reset modal state
    setShowAddDependencyModal(false);
    setModalSelectedTaskId('');
    setModalLinkType('FS');
    setModalLag(0);
  };

  // Add history entry to task
  const addHistoryEntry = (taskId, action, field, oldValue, newValue) => {
    if (isUndoRedoAction) return; // Don't add history for undo/redo actions

    const historyEntry = {
      id: `history-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      field,
      oldValue,
      newValue,
      user: 'Current User', // TODO: Get from user context
    };

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedHistory = [...(task.history || []), historyEntry];
      updateTask(taskId, { history: updatedHistory });
    }
  };

  // Get available tasks for linking (exclude current task and already linked tasks)
  const availableTasks = tasks.filter(
    task =>
      task.id !== selectedTaskId &&
      !predecessors.some(p => p.id === task.id) &&
      !successors.some(s => s.id === task.id)
  );

  if (!selectedTask || !editingTask) {
    return (
      <div className='bg-gray-50 border-t border-gray-200 shadow-inner flex flex-col overflow-hidden h-full'>
        <div className='px-4 py-3 border-b border-gray-200 bg-white'>
          <h3 className='text-sm font-semibold text-gray-700'>
            Task Properties
          </h3>
          <p className='text-xs text-gray-500 mt-1'>
            Select a task to view properties
          </p>
        </div>
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <PencilIcon className='w-12 h-12 text-gray-300 mx-auto mb-4' />
            <div className='text-sm font-medium text-gray-500 mb-1'>
              No Task Selected
            </div>
            <div className='text-xs text-gray-400'>
              Select a task to edit its properties
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='bg-gray-50 border-t border-gray-200 shadow-inner flex flex-col overflow-hidden h-full'>
        {/* Header with Save/Cancel buttons */}
        <div className='px-4 py-3 border-b border-gray-200 bg-white'>
          <div className='flex items-center justify-between mb-3'>
            <div>
              <h3 className='text-sm font-semibold text-gray-700'>
                Task Properties
              </h3>
              <p className='text-xs text-gray-500 mt-1'>
                Editing: {editingTask.name}
              </p>
            </div>
            <div className='flex gap-2'>
              {/* Delete Button */}
              <button
                onClick={() => setShowDeleteModal(true)}
                className='px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1'
                title='Delete task'
              >
                <TrashIcon className='w-3 h-3' />
                Delete
              </button>
              {hasChanges && (
                <>
                  <button
                    onClick={handleCancel}
                    className='px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors'
                  >
                    <XMarkIcon className='w-3 h-3 inline mr-1' />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className='px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
                  >
                    <CheckIcon className='w-3 h-3 inline mr-1' />
                    Save
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className='flex border-b border-gray-200'>
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'properties'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Properties
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'notes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => setActiveTab('attachments')}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'attachments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Attachments
            </button>
          </div>
        </div>

        {/* Properties Content */}
        <div className='flex-1 overflow-auto p-4 space-y-4'>
          {activeTab === 'properties' && (
            <>
              {/* Task Information Section */}
              <div className='bg-white border border-gray-200 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-3'>
                  <DocumentTextIcon className='w-4 h-4 text-blue-600' />
                  <h4 className='text-sm font-semibold text-gray-700'>
                    Task Information
                  </h4>
                </div>

                <div className='space-y-3'>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Task Name
                    </label>
                    <input
                      type='text'
                      value={editingTask.name}
                      onChange={e => handleFieldChange('name', e.target.value)}
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='Enter task name'
                    />
                  </div>

                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Description
                    </label>
                    <textarea
                      value={editingTask.description || ''}
                      onChange={e =>
                        handleFieldChange('description', e.target.value)
                      }
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      rows={3}
                      placeholder='Enter task description'
                    />
                  </div>

                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Notes
                    </label>
                    <textarea
                      value={editingTask.notes || ''}
                      onChange={e => handleFieldChange('notes', e.target.value)}
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      rows={2}
                      placeholder='Additional notes'
                    />
                  </div>
                </div>
              </div>

              {/* Schedule Section */}
              <div className='bg-white border border-gray-200 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-3'>
                  <CalendarIcon className='w-4 h-4 text-green-600' />
                  <h4 className='text-sm font-semibold text-gray-700'>
                    Schedule
                  </h4>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Start Date
                    </label>
                    <input
                      type='date'
                      value={
                        editingTask.startDate
                          ? new Date(editingTask.startDate)
                              .toISOString()
                              .split('T')[0]
                          : ''
                      }
                      onChange={e =>
                        handleFieldChange(
                          'startDate',
                          new Date(e.target.value).toISOString()
                        )
                      }
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>

                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      End Date
                    </label>
                    <input
                      type='date'
                      value={
                        editingTask.endDate
                          ? new Date(editingTask.endDate)
                              .toISOString()
                              .split('T')[0]
                          : ''
                      }
                      onChange={e =>
                        handleFieldChange(
                          'endDate',
                          new Date(e.target.value).toISOString()
                        )
                      }
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>

                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Duration (days)
                    </label>
                    <input
                      type='number'
                      value={editingTask.duration || 0}
                      onChange={e =>
                        handleFieldChange(
                          'duration',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      min='0'
                    />
                  </div>

                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      % Complete
                    </label>
                    <div className='flex items-center gap-2'>
                      <input
                        type='number'
                        value={editingTask.progress || 0}
                        onChange={e =>
                          handleFieldChange(
                            'progress',
                            Math.min(
                              100,
                              Math.max(0, parseInt(e.target.value) || 0)
                            )
                          )
                        }
                        className='flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        min='0'
                        max='100'
                      />
                      <span className='text-xs text-gray-500'>%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Calendar Section */}
              <div className='bg-white border border-gray-200 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-3'>
                  <CalendarIcon className='w-4 h-4 text-green-600' />
                  <h4 className='text-sm font-semibold text-gray-700'>
                    Task Calendar
                  </h4>
                </div>

                <div className='space-y-3'>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Calendar Override
                    </label>
                    <select
                      value={editingTask.calendarId || 'global'}
                      onChange={e => {
                        const calendarId =
                          e.target.value === 'global' ? null : e.target.value;
                        handleFieldChange('calendarId', calendarId);
                      }}
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    >
                      <option value='global'>Use Global Calendar</option>
                      {projectCalendars.map(calendar => (
                        <option key={calendar.id} value={calendar.id}>
                          {calendar.name}
                        </option>
                      ))}
                    </select>
                    <div className='mt-1 text-xs text-gray-500'>
                      {editingTask.calendarId
                        ? (() => {
                            const selectedCalendar = getProjectCalendarById(
                              editingTask.calendarId
                            );
                            if (selectedCalendar) {
                              const workingDays = Object.entries(
                                selectedCalendar.workingDays
                              )
                                .filter(([_, isWorking]) => isWorking)
                                .map(
                                  ([day, _]) =>
                                    day.charAt(0).toUpperCase() + day.slice(1)
                                )
                                .join(', ');
                              return `${workingDays} • ${selectedCalendar.holidays.length} holidays`;
                            }
                            return 'Calendar not found';
                          })()
                        : "Uses the project's global working calendar"}
                    </div>
                  </div>

                  {/* Current Calendar Info */}
                  {editingTask.calendarId &&
                    (() => {
                      const selectedCalendar = getProjectCalendarById(
                        editingTask.calendarId
                      );
                      if (!selectedCalendar) return null;

                      return (
                        <div className='p-2 bg-blue-50 border border-blue-200 rounded'>
                          <div className='text-xs font-medium text-blue-700 mb-1'>
                            {selectedCalendar.name}
                          </div>
                          <div className='text-xs text-blue-600 space-y-1'>
                            <div>
                              <span className='font-medium'>Working Days:</span>{' '}
                              {Object.entries(selectedCalendar.workingDays)
                                .filter(([_, isWorking]) => isWorking)
                                .map(
                                  ([day, _]) =>
                                    day.charAt(0).toUpperCase() + day.slice(1)
                                )
                                .join(', ')}
                            </div>
                            {selectedCalendar.holidays.length > 0 && (
                              <div>
                                <span className='font-medium'>Holidays:</span>{' '}
                                {selectedCalendar.holidays.length} date(s)
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                  {/* Duration Recalculation Notice */}
                  {editingTask.calendarId && (
                    <div className='p-2 bg-yellow-50 border border-yellow-200 rounded'>
                      <div className='flex items-center gap-1'>
                        <ExclamationTriangleIcon className='w-3 h-3 text-yellow-600' />
                        <span className='text-xs font-medium text-yellow-700'>
                          Duration will be recalculated based on selected
                          calendar
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Deadline Section */}
              <div className='bg-white border border-gray-200 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-3'>
                  <ClockIcon className='w-4 h-4 text-red-600' />
                  <h4 className='text-sm font-semibold text-gray-700'>
                    Deadline
                  </h4>
                </div>

                <div className='space-y-3'>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Deadline Date
                    </label>
                    <input
                      type='date'
                      value={editingTask.deadline || ''}
                      onChange={e =>
                        handleFieldChange('deadline', e.target.value || null)
                      }
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                    <div className='mt-1 text-xs text-gray-500'>
                      {editingTask.deadline
                        ? (() => {
                            const deadline = new Date(editingTask.deadline);
                            const endDate = editingTask.endDate
                              ? new Date(editingTask.endDate)
                              : null;
                            const isOverdue = endDate && endDate > deadline;
                            const daysUntilDeadline = Math.ceil(
                              (deadline.getTime() - new Date().getTime()) /
                                (1000 * 60 * 60 * 24)
                            );

                            if (isOverdue) {
                              const daysOverdue = Math.ceil(
                                (endDate.getTime() - deadline.getTime()) /
                                  (1000 * 60 * 60 * 24)
                              );
                              return `⚠️ Overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}`;
                            } else if (daysUntilDeadline < 0) {
                              return `⚠️ Deadline has passed`;
                            } else if (daysUntilDeadline === 0) {
                              return `⚠️ Deadline is today`;
                            } else if (daysUntilDeadline <= 7) {
                              return `⚠️ Due in ${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''}`;
                            } else {
                              return `Due in ${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''}`;
                            }
                          })()
                        : 'No deadline set'}
                    </div>
                  </div>

                  {/* Deadline Status Display */}
                  {editingTask.deadline &&
                    (() => {
                      const deadline = new Date(editingTask.deadline);
                      const endDate = editingTask.endDate
                        ? new Date(editingTask.endDate)
                        : null;
                      const isOverdue = endDate && endDate > deadline;
                      const daysUntilDeadline = Math.ceil(
                        (deadline.getTime() - new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      );

                      if (isOverdue) {
                        const daysOverdue = Math.ceil(
                          (endDate.getTime() - deadline.getTime()) /
                            (1000 * 60 * 60 * 24)
                        );
                        return (
                          <div className='p-2 bg-red-50 border border-red-200 rounded'>
                            <div className='flex items-center gap-1'>
                              <ExclamationTriangleIcon className='w-3 h-3 text-red-600' />
                              <span className='text-xs font-medium text-red-700'>
                                Deadline Exceeded
                              </span>
                            </div>
                            <div className='text-xs text-red-600 mt-1'>
                              Task finished {daysOverdue} day
                              {daysOverdue !== 1 ? 's' : ''} after deadline
                            </div>
                          </div>
                        );
                      } else if (daysUntilDeadline < 0) {
                        return (
                          <div className='p-2 bg-red-50 border border-red-200 rounded'>
                            <div className='flex items-center gap-1'>
                              <ExclamationTriangleIcon className='w-3 h-3 text-red-600' />
                              <span className='text-xs font-medium text-red-700'>
                                Deadline Passed
                              </span>
                            </div>
                            <div className='text-xs text-red-600 mt-1'>
                              Task is overdue and should be completed
                              immediately
                            </div>
                          </div>
                        );
                      } else if (daysUntilDeadline <= 7) {
                        return (
                          <div className='p-2 bg-yellow-50 border border-yellow-200 rounded'>
                            <div className='flex items-center gap-1'>
                              <ExclamationTriangleIcon className='w-3 h-3 text-yellow-600' />
                              <span className='text-xs font-medium text-yellow-700'>
                                Deadline Approaching
                              </span>
                            </div>
                            <div className='text-xs text-yellow-600 mt-1'>
                              Due in {daysUntilDeadline} day
                              {daysUntilDeadline !== 1 ? 's' : ''}
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className='p-2 bg-green-50 border border-green-200 rounded'>
                            <div className='flex items-center gap-1'>
                              <CheckIcon className='w-3 h-3 text-green-600' />
                              <span className='text-xs font-medium text-green-700'>
                                On Track
                              </span>
                            </div>
                            <div className='text-xs text-green-600 mt-1'>
                              Due in {daysUntilDeadline} day
                              {daysUntilDeadline !== 1 ? 's' : ''}
                            </div>
                          </div>
                        );
                      }
                    })()}

                  {/* Clear Deadline Button */}
                  {editingTask.deadline && (
                    <button
                      onClick={() => handleFieldChange('deadline', null)}
                      className='w-full px-3 py-2 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors'
                      title='Remove deadline'
                    >
                      Clear Deadline
                    </button>
                  )}
                </div>
              </div>

              {/* Recurring Task Configuration */}
              <RecurringTaskConfig
                task={editingTask}
                onRecurrenceChange={recurrenceRule => {
                  handleFieldChange('recurrence', recurrenceRule);
                }}
              />

              {/* Cost Information Section */}
              <div className='bg-white border border-gray-200 rounded-lg p-4 mb-4'>
                <div className='flex items-center gap-2 mb-3'>
                  <CurrencyDollarIcon className='w-4 h-4 text-green-600' />
                  <h4 className='text-sm font-semibold text-gray-700'>
                    Cost Information
                  </h4>
                </div>

                <div className='space-y-3'>
                  {/* Resource Assignment */}
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Assigned Resource
                    </label>
                    <input
                      type='text'
                      value={
                        editingTask.resource || editingTask.assignedTo || ''
                      }
                      onChange={e =>
                        handleFieldChange('resource', e.target.value)
                      }
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='Enter resource name'
                    />
                  </div>

                  {/* Cost Calculation */}
                  {(() => {
                    const resource = {
                      name: editingTask.resource || editingTask.assignedTo,
                      costRate: 0,
                    };
                    const taskCost = calculateTaskCost(editingTask, resource);
                    const costVariance = getCostVariance(editingTask, resource);

                    return (
                      <div className='p-3 bg-gray-50 border border-gray-200 rounded'>
                        <div className='grid grid-cols-2 gap-4 text-sm'>
                          <div>
                            <span className='text-gray-600'>Task Cost:</span>
                            <div className='font-semibold text-green-600'>
                              {formatCost(taskCost.cost)}
                            </div>
                          </div>
                          <div>
                            <span className='text-gray-600'>Duration:</span>
                            <div className='font-semibold text-gray-900'>
                              {editingTask.duration || 0} days
                            </div>
                          </div>
                        </div>

                        {taskCost.cost > 0 && (
                          <div className='mt-2 text-xs text-gray-600'>
                            {taskCost.breakdown.calculation}
                          </div>
                        )}

                        {costVariance.isOverBudget && (
                          <div className='mt-2 p-2 bg-red-50 border border-red-200 rounded'>
                            <div className='flex items-center gap-2'>
                              <ExclamationTriangleIcon className='w-3 h-3 text-red-600' />
                              <span className='text-xs text-red-700'>
                                Over budget by{' '}
                                {formatCost(costVariance.variance)} (
                                {costVariance.variancePercentage.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Status & Priority Section */}
              <div className='bg-white border border-gray-200 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-3'>
                  <FlagIcon className='w-4 h-4 text-orange-600' />
                  <h4 className='text-sm font-semibold text-gray-700'>
                    Status & Priority
                  </h4>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Status
                    </label>
                    <select
                      value={editingTask.status || 'Planned'}
                      onChange={e =>
                        handleFieldChange('status', e.target.value)
                      }
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    >
                      <option value='Planned'>Planned</option>
                      <option value='In Progress'>In Progress</option>
                      <option value='Complete'>Complete</option>
                      <option value='Delayed'>Delayed</option>
                      <option value='On Hold'>On Hold</option>
                      <option value='Cancelled'>Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Priority
                    </label>
                    <select
                      value={editingTask.priority || 'Medium'}
                      onChange={e =>
                        handleFieldChange('priority', e.target.value)
                      }
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    >
                      <option value='Low'>Low</option>
                      <option value='Medium'>Medium</option>
                      <option value='High'>High</option>
                      <option value='Critical'>Critical</option>
                    </select>
                  </div>

                  <div className='col-span-2'>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Task Type
                    </label>
                    <select
                      value={
                        editingTask.type === 'milestone' ||
                        editingTask.isMilestone
                          ? 'Milestone'
                          : 'Task'
                      }
                      onChange={e => {
                        const isMilestone = e.target.value === 'Milestone';
                        // Update both the new type field and the legacy isMilestone field
                        handleFieldChange(
                          'type',
                          isMilestone ? 'milestone' : 'task'
                        );
                        handleFieldChange('isMilestone', isMilestone);
                      }}
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    >
                      <option value='Task'>Task</option>
                      <option value='Milestone'>Milestone</option>
                    </select>
                  </div>

                  {/* Bar Color Section */}
                  <div className='col-span-2'>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Bar Color
                    </label>
                    <div className='flex items-center gap-2'>
                      <div className='relative'>
                        <button
                          type='button'
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          className='flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        >
                          <div
                            className='w-4 h-4 rounded border border-gray-300'
                            style={{
                              backgroundColor: getCurrentColor(editingTask),
                            }}
                          />
                          <span className='text-gray-700'>
                            {editingTask.color ? 'Custom' : 'Default'}
                          </span>
                          <PaintBrushIcon className='w-4 h-4 text-gray-500' />
                        </button>

                        {showColorPicker && (
                          <div className='absolute z-50 mt-2'>
                            <div
                              className='fixed inset-0'
                              onClick={() => setShowColorPicker(false)}
                            />
                            <SketchPicker
                              color={getCurrentColor(editingTask)}
                              onChange={handleColorChange}
                              presetColors={[
                                '#3B82F6', // Blue (default task)
                                '#10B981', // Green (default group)
                                '#8B5CF6', // Purple (default milestone)
                                '#F59E0B', // Orange
                                '#EF4444', // Red
                                '#06B6D4', // Cyan
                                '#84CC16', // Lime
                                '#F97316', // Orange
                                '#EC4899', // Pink
                                '#6366F1', // Indigo
                              ]}
                            />
                          </div>
                        )}
                      </div>

                      {editingTask.color && (
                        <button
                          type='button'
                          onClick={handleResetColor}
                          className='px-3 py-2 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors'
                          title='Reset to default color'
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    <div className='mt-1 text-xs text-gray-500'>
                      Default: {getDefaultColor(editingTask)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Constraints Section */}
              <div className='bg-white border border-gray-200 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-3'>
                  <CogIcon className='w-4 h-4 text-blue-600' />
                  <h4 className='text-sm font-semibold text-gray-700'>
                    Scheduling Constraints
                  </h4>
                </div>

                <div className='space-y-3'>
                  {/* Constraint Type */}
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Constraint Type
                    </label>
                    <select
                      value={
                        editingTask.constraints?.type || CONSTRAINT_TYPES.ASAP
                      }
                      onChange={e => handleConstraintChange(e.target.value)}
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    >
                      {getAvailableConstraintTypes().map(constraintType => (
                        <option
                          key={constraintType.value}
                          value={constraintType.value}
                        >
                          {constraintType.icon} {constraintType.label}
                        </option>
                      ))}
                    </select>
                    <div className='mt-1 text-xs text-gray-500'>
                      {getConstraintDescription(
                        editingTask.constraints?.type || CONSTRAINT_TYPES.ASAP
                      )}
                    </div>
                  </div>

                  {/* Constraint Date */}
                  {editingTask.constraints &&
                    [
                      CONSTRAINT_TYPES.MSO,
                      CONSTRAINT_TYPES.MFO,
                      CONSTRAINT_TYPES.SNET,
                      CONSTRAINT_TYPES.FNLT,
                    ].includes(editingTask.constraints.type) && (
                      <div>
                        <label className='block text-xs font-medium text-gray-600 mb-1'>
                          Constraint Date
                        </label>
                        <input
                          type='date'
                          value={editingTask.constraints.date || ''}
                          onChange={e =>
                            handleConstraintDateChange(e.target.value)
                          }
                          className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                      </div>
                    )}

                  {/* Constraint Validation */}
                  {!constraintValidation.isValid && (
                    <div className='p-2 bg-red-50 border border-red-200 rounded'>
                      <div className='flex items-center gap-1 mb-1'>
                        <ExclamationTriangleIcon className='w-3 h-3 text-red-600' />
                        <span className='text-xs font-medium text-red-700'>
                          Validation Errors
                        </span>
                      </div>
                      <ul className='text-xs text-red-600 space-y-1'>
                        {constraintValidation.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {constraintValidation.warnings.length > 0 && (
                    <div className='p-2 bg-yellow-50 border border-yellow-200 rounded'>
                      <div className='flex items-center gap-1 mb-1'>
                        <ExclamationTriangleIcon className='w-3 h-3 text-yellow-600' />
                        <span className='text-xs font-medium text-yellow-700'>
                          Warnings
                        </span>
                      </div>
                      <ul className='text-xs text-yellow-600 space-y-1'>
                        {constraintValidation.warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Current Constraint Display */}
                  {editingTask.constraints &&
                    editingTask.constraints.type !== CONSTRAINT_TYPES.ASAP && (
                      <div className='p-2 bg-blue-50 border border-blue-200 rounded'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <span className='text-xs font-medium text-blue-700'>
                              {getConstraintLabel(editingTask.constraints.type)}
                            </span>
                            {editingTask.constraints.date && (
                              <span className='text-xs text-blue-600'>
                                {new Date(
                                  editingTask.constraints.date
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={clearConstraint}
                            className='text-xs text-blue-600 hover:text-blue-700 underline'
                            title='Clear constraint'
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Resource Assignment Section */}
              <div className='bg-white border border-gray-200 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-3'>
                  <UserIcon className='w-4 h-4 text-purple-600' />
                  <h4 className='text-sm font-semibold text-gray-700'>
                    Resource Assignment
                  </h4>
                </div>

                <div>
                  <label className='block text-xs font-medium text-gray-600 mb-1'>
                    Assignee
                  </label>
                  <input
                    type='text'
                    value={editingTask.assignee || ''}
                    onChange={e =>
                      handleFieldChange('assignee', e.target.value)
                    }
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Enter assignee name'
                  />
                </div>
              </div>

              {/* Dependencies Section */}
              <div className='bg-white border border-gray-200 rounded-lg p-4'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center gap-2'>
                    <LinkIcon className='w-4 h-4 text-indigo-600' />
                    <h4 className='text-sm font-semibold text-gray-700'>
                      Dependencies
                    </h4>
                  </div>
                  <button
                    onClick={() => setShowAddDependencyModal(true)}
                    className='px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1'
                  >
                    <PlusIcon className='w-3 h-3' />
                    Add Dependency
                  </button>
                </div>

                <div className='space-y-4'>
                  {/* Predecessors */}
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-2'>
                      Predecessors ({predecessors.length})
                    </label>
                    {predecessors.length > 0 ? (
                      <div className='space-y-2'>
                        {predecessors.map(task => (
                          <div
                            key={task.id}
                            className='text-xs bg-gray-50 px-3 py-2 rounded border border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors'
                          >
                            <div className='flex-1 min-w-0'>
                              <div className='font-medium text-gray-700 truncate'>
                                {task.name}
                              </div>
                              <div className='text-gray-500 text-xs'>
                                {task.linkType} •{' '}
                                {task.lag >= 0
                                  ? `${task.lag} days lag`
                                  : `${Math.abs(task.lag)} days lead`}
                              </div>
                            </div>
                            <div className='flex items-center gap-2 ml-2'>
                              <div className='flex items-center gap-1'>
                                <input
                                  type='number'
                                  value={task.lag}
                                  onChange={e =>
                                    handleUpdateLag(
                                      task.linkId,
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className='w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                                  title='Lag in days (negative for lead)'
                                  min='-365'
                                  max='365'
                                />
                                <span className='text-xs text-gray-400'>
                                  days
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  handleRemoveDependency(task.linkId)
                                }
                                className='text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors'
                                title='Remove dependency'
                              >
                                <TrashIcon className='w-3 h-3' />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='text-xs text-gray-400 italic bg-gray-50 px-3 py-2 rounded border border-gray-200'>
                        No predecessors
                      </div>
                    )}
                  </div>

                  {/* Successors */}
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-2'>
                      Successors ({successors.length})
                    </label>
                    {successors.length > 0 ? (
                      <div className='space-y-2'>
                        {successors.map(task => (
                          <div
                            key={task.id}
                            className='text-xs bg-gray-50 px-3 py-2 rounded border border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors'
                          >
                            <div className='flex-1 min-w-0'>
                              <div className='font-medium text-gray-700 truncate'>
                                {task.name}
                              </div>
                              <div className='text-gray-500 text-xs'>
                                {task.linkType} •{' '}
                                {task.lag >= 0
                                  ? `${task.lag} days lag`
                                  : `${Math.abs(task.lag)} days lead`}
                              </div>
                            </div>
                            <div className='flex items-center gap-2 ml-2'>
                              <div className='flex items-center gap-1'>
                                <input
                                  type='number'
                                  value={task.lag}
                                  onChange={e =>
                                    handleUpdateLag(
                                      task.linkId,
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className='w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                                  title='Lag in days (negative for lead)'
                                  min='-365'
                                  max='365'
                                />
                                <span className='text-xs text-gray-400'>
                                  days
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  handleRemoveDependency(task.linkId)
                                }
                                className='text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors'
                                title='Remove dependency'
                              >
                                <TrashIcon className='w-3 h-3' />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='text-xs text-gray-400 italic bg-gray-50 px-3 py-2 rounded border border-gray-200'>
                        No successors
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Validation Messages */}
              {hasChanges && (
                <div className='bg-amber-50 border border-amber-200 rounded-lg p-3'>
                  <div className='flex items-center gap-2'>
                    <ExclamationTriangleIcon className='w-4 h-4 text-amber-600' />
                    <span className='text-xs font-medium text-amber-800'>
                      You have unsaved changes
                    </span>
                  </div>
                  <div className='text-xs text-amber-700 mt-1'>
                    Click Save to apply changes or Cancel to discard them.
                  </div>
                </div>
              )}
            </>
          )}

          {/* Notes Tab Content */}
          {activeTab === 'notes' && (
            <NotesTab task={selectedTask} onTaskUpdate={updateTask} />
          )}

          {/* Attachments Tab Content */}
          {activeTab === 'attachments' && (
            <AttachmentsTab
              task={selectedTask}
              onTaskUpdate={updateTask}
              supabaseClient={supabase}
            />
          )}

          {/* History Tab Content */}
          {activeTab === 'history' && (
            <div className='bg-white border border-gray-200 rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-3'>
                <DocumentTextIcon className='w-4 h-4 text-blue-600' />
                <h4 className='text-sm font-semibold text-gray-700'>
                  Task History
                </h4>
              </div>

              <div className='space-y-3'>
                {selectedTask.history && selectedTask.history.length > 0 ? (
                  <div className='space-y-2 max-h-96 overflow-y-auto'>
                    {selectedTask.history
                      .slice()
                      .reverse()
                      .map(entry => (
                        <div
                          key={entry.id}
                          className='p-3 bg-gray-50 border border-gray-200 rounded-lg'
                        >
                          <div className='flex items-start justify-between mb-1'>
                            <span className='text-xs font-medium text-gray-700'>
                              {entry.action} {entry.field}
                            </span>
                            <span className='text-xs text-gray-500'>
                              {new Date(entry.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className='text-xs text-gray-600'>
                            <span className='font-medium'>From:</span>{' '}
                            {entry.oldValue} →{' '}
                            <span className='font-medium'>To:</span>{' '}
                            {entry.newValue}
                          </div>
                          <div className='text-xs text-gray-500 mt-1'>
                            by {entry.user}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    <DocumentTextIcon className='w-8 h-8 text-gray-300 mx-auto mb-2' />
                    <p className='text-sm text-gray-500'>
                      No history available
                    </p>
                    <p className='text-xs text-gray-400 mt-1'>
                      Changes will appear here when you modify the task
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Add Dependency Modal */}
        {showAddDependencyModal && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg p-6 w-96 max-w-md max-h-[90vh] overflow-y-auto'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold'>Add Dependency</h3>
                <button
                  onClick={() => setShowAddDependencyModal(false)}
                  className='text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100'
                >
                  <XMarkIcon className='w-5 h-5' />
                </button>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Select Task
                  </label>
                  <select
                    value={modalSelectedTaskId}
                    onChange={e => setModalSelectedTaskId(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value=''>Choose a task...</option>
                    {availableTasks.map(task => (
                      <option key={task.id} value={task.id}>
                        {task.name} (
                        {task.startDate
                          ? new Date(task.startDate).toLocaleDateString()
                          : 'No date'}
                        )
                      </option>
                    ))}
                  </select>
                  {availableTasks.length === 0 && (
                    <p className='text-xs text-gray-500 mt-1'>
                      No available tasks to link. All tasks are already linked
                      or this is the only task.
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Link Type
                  </label>
                  <select
                    value={modalLinkType}
                    onChange={e => setModalLinkType(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value='FS'>
                      Finish-to-Start (FS) - Task B starts when Task A finishes
                    </option>
                    <option value='SS'>
                      Start-to-Start (SS) - Task B starts when Task A starts
                    </option>
                    <option value='FF'>
                      Finish-to-Finish (FF) - Task B finishes when Task A
                      finishes
                    </option>
                    <option value='SF'>
                      Start-to-Finish (SF) - Task B finishes when Task A starts
                    </option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Lag/Lead (days)
                  </label>
                  <div className='flex items-center gap-2'>
                    <input
                      type='number'
                      value={modalLag}
                      onChange={e => setModalLag(parseInt(e.target.value) || 0)}
                      className='flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='0'
                      min='-365'
                      max='365'
                    />
                    <span className='text-sm text-gray-500'>
                      {modalLag >= 0 ? 'lag' : 'lead'}
                    </span>
                  </div>
                  <p className='text-xs text-gray-500 mt-1'>
                    Positive values = lag (delay), Negative values = lead
                    (advance)
                  </p>
                </div>
              </div>

              <div className='flex justify-end gap-2 mt-6'>
                <button
                  onClick={() => setShowAddDependencyModal(false)}
                  className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors'
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDependency}
                  disabled={!modalSelectedTaskId}
                  className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  Add Dependency
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Task Modal */}
      <DeleteTaskModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        taskId={selectedTaskId}
      />
    </>
  );
};

export default TaskPropertiesPane;
