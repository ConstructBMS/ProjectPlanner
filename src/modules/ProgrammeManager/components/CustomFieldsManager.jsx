import { useState, useCallback } from 'react';
import { useTaskContext } from '../context/TaskContext';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  TagIcon,
  AdjustmentsHorizontalIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const CustomFieldsManager = () => {
  const { tasks, updateTask } = useTaskContext();
  const [customFields, setCustomFields] = useState([
    { id: 'cf1', name: 'Cost Center', type: 'text', required: false },
    {
      id: 'cf2',
      name: 'Phase',
      type: 'select',
      options: ['Planning', 'Execution', 'Closure'],
      required: true,
    },
    { id: 'cf3', name: 'Budget', type: 'number', required: false },
    {
      id: 'cf4',
      name: 'Risk Level',
      type: 'select',
      options: ['Low', 'Medium', 'High', 'Critical'],
      required: false,
    },
  ]);

  const [showNewFieldForm, setShowNewFieldForm] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [newField, setNewField] = useState({
    name: '',
    type: 'text',
    options: [],
    required: false,
  });

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'select', label: 'Select List' },
    { value: 'boolean', label: 'Yes/No' },
  ];

  const handleAddField = useCallback(() => {
    if (!newField.name.trim()) return;

    const field = {
      id: `cf${Date.now()}`,
      name: newField.name.trim(),
      type: newField.type,
      options:
        newField.type === 'select'
          ? newField.options.filter(opt => opt.trim())
          : [],
      required: newField.required,
    };

    setCustomFields(prev => [...prev, field]);
    setNewField({ name: '', type: 'text', options: [], required: false });
    setShowNewFieldForm(false);
    console.log('Added custom field:', field);
  }, [newField]);

  const handleDeleteField = useCallback(fieldId => {
    setCustomFields(prev => prev.filter(field => field.id !== fieldId));
    console.log('Deleted custom field:', fieldId);
  }, []);

  const handleEditField = useCallback(field => {
    setEditingField(field);
    setNewField({ ...field });
  }, []);

  const handleUpdateField = useCallback(() => {
    if (!newField.name.trim()) return;

    setCustomFields(prev =>
      prev.map(field => {
        return field.id === editingField.id
          ? {
              ...field,
              name: newField.name.trim(),
              type: newField.type,
              options:
                newField.type === 'select'
                  ? newField.options.filter(opt => opt.trim())
                  : [],
              required: newField.required,
            }
          : field;
      })
    );

    setEditingField(null);
    setNewField({ name: '', type: 'text', options: [], required: false });
    console.log('Updated custom field:', editingField.id);
  }, [newField, editingField]);

  const handleCancelEdit = useCallback(() => {
    setEditingField(null);
    setNewField({ name: '', type: 'text', options: [], required: false });
    setShowNewFieldForm(false);
  }, []);

  const updateTaskCustomField = useCallback(
    (taskId, fieldId, value) => {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const customFields = task.customFields || {};
      updateTask(taskId, {
        customFields: {
          ...customFields,
          [fieldId]: value,
        },
      });
    },
    [tasks, updateTask]
  );

  const addSelectOption = useCallback(() => {
    setNewField(prev => ({
      ...prev,
      options: [...prev.options, ''],
    }));
  }, []);

  const updateSelectOption = useCallback((index, value) => {
    setNewField(prev => ({
      ...prev,
      options: prev.options.map((option, i) => (i === index ? value : option)),
    }));
  }, []);

  const removeSelectOption = useCallback(index => {
    setNewField(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  }, []);

  const renderFieldValue = (field, task) => {
    const value = task.customFields?.[field.id] || '';

    switch (field.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={e =>
              updateTaskCustomField(task.id, field.id, e.target.value)
            }
            className='w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500'
          >
            <option value=''>Select...</option>
            {field.options.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'boolean':
        return (
          <input
            type='checkbox'
            checked={value === true || value === 'true'}
            onChange={e =>
              updateTaskCustomField(task.id, field.id, e.target.checked)
            }
            className='h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
          />
        );
      case 'number':
        return (
          <input
            type='number'
            value={value}
            onChange={e =>
              updateTaskCustomField(task.id, field.id, e.target.value)
            }
            className='w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500'
          />
        );
      case 'date':
        return (
          <input
            type='date'
            value={value}
            onChange={e =>
              updateTaskCustomField(task.id, field.id, e.target.value)
            }
            className='w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500'
          />
        );
      default:
        return (
          <input
            type='text'
            value={value}
            onChange={e =>
              updateTaskCustomField(task.id, field.id, e.target.value)
            }
            className='w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500'
            placeholder={field.required ? 'Required' : 'Optional'}
          />
        );
    }
  };

  return (
    <div className='bg-white border border-gray-200 rounded-lg'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-gray-200'>
        <div className='flex items-center gap-3'>
          <AdjustmentsHorizontalIcon className='w-6 h-6 text-purple-600' />
          <h2 className='text-lg font-semibold text-gray-900'>
            Custom Fields Manager
          </h2>
        </div>
        <button
          onClick={() => setShowNewFieldForm(true)}
          className='flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors'
        >
          <PlusIcon className='w-4 h-4' />
          Add Field
        </button>
      </div>

      <div className='p-4 space-y-6'>
        {/* Custom Fields Definition */}
        <div>
          <h3 className='text-sm font-medium text-gray-700 mb-3'>
            Field Definitions
          </h3>
          <div className='space-y-2'>
            {customFields.map(field => (
              <div
                key={field.id}
                className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
              >
                <div className='flex items-center gap-3'>
                  <TagIcon className='w-4 h-4 text-gray-500' />
                  <div>
                    <div className='text-sm font-medium text-gray-900'>
                      {field.name}
                      {field.required && (
                        <span className='text-red-500 ml-1'>*</span>
                      )}
                    </div>
                    <div className='text-xs text-gray-500'>
                      Type:{' '}
                      {fieldTypes.find(t => t.value === field.type)?.label}
                      {field.options?.length > 0 &&
                        ` (${field.options.length} options)`}
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => handleEditField(field)}
                    className='p-1 hover:bg-gray-200 rounded transition-colors'
                    title='Edit field'
                  >
                    <PencilIcon className='w-4 h-4 text-gray-500' />
                  </button>
                  <button
                    onClick={() => handleDeleteField(field.id)}
                    className='p-1 hover:bg-red-100 rounded transition-colors'
                    title='Delete field'
                  >
                    <TrashIcon className='w-4 h-4 text-red-500' />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add/Edit Field Form */}
        {(showNewFieldForm || editingField) && (
          <div className='border border-gray-200 rounded-lg p-4 bg-gray-50'>
            <h4 className='text-sm font-medium text-gray-700 mb-3'>
              {editingField ? 'Edit Field' : 'Add New Field'}
            </h4>

            <div className='grid grid-cols-2 gap-4 mb-4'>
              <div>
                <label className='block text-xs font-medium text-gray-600 mb-1'>
                  Field Name
                </label>
                <input
                  type='text'
                  value={newField.name}
                  onChange={e =>
                    setNewField(prev => ({ ...prev, name: e.target.value }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500'
                  placeholder='Enter field name'
                />
              </div>

              <div>
                <label className='block text-xs font-medium text-gray-600 mb-1'>
                  Field Type
                </label>
                <select
                  value={newField.type}
                  onChange={e =>
                    setNewField(prev => ({ ...prev, type: e.target.value }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500'
                >
                  {fieldTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Select Options */}
            {newField.type === 'select' && (
              <div className='mb-4'>
                <label className='block text-xs font-medium text-gray-600 mb-2'>
                  Options
                </label>
                <div className='space-y-2'>
                  {newField.options.map((option, index) => (
                    <div key={`option-${option}`} className='flex items-center gap-2'>
                      <input
                        type='text'
                        value={option}
                        onChange={e =>
                          updateSelectOption(index, e.target.value)
                        }
                        className='flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500'
                        placeholder='Enter option'
                      />
                      <button
                        onClick={() => removeSelectOption(index)}
                        className='p-2 hover:bg-red-100 rounded transition-colors'
                      >
                        <TrashIcon className='w-4 h-4 text-red-500' />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addSelectOption}
                    className='flex items-center gap-2 px-3 py-2 text-purple-600 border border-purple-300 rounded hover:bg-purple-50 transition-colors'
                  >
                    <PlusIcon className='w-4 h-4' />
                    Add Option
                  </button>
                </div>
              </div>
            )}

            {/* Required Checkbox */}
            <div className='mb-4'>
              <label className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={newField.required}
                  onChange={e =>
                    setNewField(prev => ({
                      ...prev,
                      required: e.target.checked,
                    }))
                  }
                  className='h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500'
                />
                <span className='text-sm text-gray-700'>Required field</span>
              </label>
            </div>

            {/* Form Actions */}
            <div className='flex items-center gap-3'>
              <button
                onClick={editingField ? handleUpdateField : handleAddField}
                className='flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors'
              >
                <CheckIcon className='w-4 h-4' />
                {editingField ? 'Update' : 'Add'} Field
              </button>
              <button
                onClick={handleCancelEdit}
                className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors'
              >
                <XMarkIcon className='w-4 h-4' />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tasks with Custom Fields */}
        {customFields.length > 0 && (
          <div>
            <h3 className='text-sm font-medium text-gray-700 mb-3'>
              Task Custom Fields
            </h3>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-gray-200'>
                    <th className='text-left py-2 px-3 font-medium text-gray-700'>
                      Task
                    </th>
                    {customFields.map(field => (
                      <th
                        key={field.id}
                        className='text-left py-2 px-3 font-medium text-gray-700'
                      >
                        {field.name}
                        {field.required && (
                          <span className='text-red-500 ml-1'>*</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.slice(0, 10).map(task => (
                    <tr key={task.id} className='border-b border-gray-100'>
                      <td className='py-2 px-3 font-medium text-gray-900'>
                        {task.name}
                      </td>
                      {customFields.map(field => (
                        <td key={field.id} className='py-2 px-3'>
                          {renderFieldValue(field, task)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {tasks.length > 10 && (
              <div className='text-sm text-gray-500 mt-2'>
                Showing first 10 tasks. Total: {tasks.length} tasks.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomFieldsManager;
