import React, { useState, useEffect } from 'react';
import { SketchPicker } from 'react-color';
import {
  TagIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import {
  getAvailableLabelTypes,
  getAvailablePositions,
  validateLabelConfig,
  createLabelConfig,
  getLabelPreview,
  exportBarLabels,
  importBarLabels,
  getSampleTask,
  DEFAULT_BAR_LABELS,
} from '../utils/barLabelUtils';

const BarLabelEditor = ({ userSettings, onSettingsUpdate }) => {
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [editingLabel, setEditingLabel] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(null);
  const [validation, setValidation] = useState({
    isValid: true,
    errors: [],
    warnings: [],
  });
  const [showPreview, setShowPreview] = useState(true);
  const [newLabelType, setNewLabelType] = useState('');
  const [newLabelPosition, setNewLabelPosition] = useState('center');

  const barLabels = userSettings.barLabels || DEFAULT_BAR_LABELS;
  const availableTypes = getAvailableLabelTypes();
  const availablePositions = getAvailablePositions();
  const sampleTask = getSampleTask();

  // Initialize editing label when selected label changes
  useEffect(() => {
    if (selectedLabel) {
      setEditingLabel({ ...selectedLabel });
    }
  }, [selectedLabel]);

  // Validate label when it changes
  useEffect(() => {
    if (editingLabel) {
      const validationResult = validateLabelConfig(editingLabel);
      setValidation(validationResult);
    }
  }, [editingLabel]);

  const handleLabelChange = (field, value) => {
    if (!editingLabel) return;

    setEditingLabel(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveLabel = () => {
    if (!selectedLabel || !editingLabel || !validation.isValid) return;

    const updatedLabels = barLabels.labels.map(label =>
      label.id === selectedLabel.id ? editingLabel : label
    );

    const updatedSettings = {
      ...userSettings,
      barLabels: {
        ...barLabels,
        labels: updatedLabels,
      },
    };

    onSettingsUpdate(updatedSettings);
  };

  const handleAddLabel = () => {
    if (!newLabelType) return;

    try {
      const newLabel = createLabelConfig(newLabelType, newLabelPosition);
      const updatedLabels = [...barLabels.labels, newLabel];

      const updatedSettings = {
        ...userSettings,
        barLabels: {
          ...barLabels,
          labels: updatedLabels,
        },
      };

      onSettingsUpdate(updatedSettings);
      setNewLabelType('');
      setNewLabelPosition('center');
      setSelectedLabel(newLabel);
    } catch (error) {
      console.error('Error creating label:', error);
    }
  };

  const handleDeleteLabel = labelId => {
    const updatedLabels = barLabels.labels.filter(
      label => label.id !== labelId
    );

    const updatedSettings = {
      ...userSettings,
      barLabels: {
        ...barLabels,
        labels: updatedLabels,
      },
    };

    onSettingsUpdate(updatedSettings);
    if (selectedLabel?.id === labelId) {
      setSelectedLabel(null);
      setEditingLabel(null);
    }
  };

  const handleToggleLabel = labelId => {
    const updatedLabels = barLabels.labels.map(label =>
      label.id === labelId ? { ...label, enabled: !label.enabled } : label
    );

    const updatedSettings = {
      ...userSettings,
      barLabels: {
        ...barLabels,
        labels: updatedLabels,
      },
    };

    onSettingsUpdate(updatedSettings);
  };

  const handleMoveLabel = (labelId, direction) => {
    const labels = [...barLabels.labels];
    const index = labels.findIndex(label => label.id === labelId);

    if (direction === 'up' && index > 0) {
      [labels[index], labels[index - 1]] = [labels[index - 1], labels[index]];
    } else if (direction === 'down' && index < labels.length - 1) {
      [labels[index], labels[index + 1]] = [labels[index + 1], labels[index]];
    }

    const updatedSettings = {
      ...userSettings,
      barLabels: {
        ...barLabels,
        labels,
      },
    };

    onSettingsUpdate(updatedSettings);
  };

  const handleGlobalSettingChange = (field, value) => {
    const updatedSettings = {
      ...userSettings,
      barLabels: {
        ...barLabels,
        globalSettings: {
          ...barLabels.globalSettings,
          [field]: value,
        },
      },
    };

    onSettingsUpdate(updatedSettings);
  };

  const handleExportLabels = () => {
    const exportData = exportBarLabels(userSettings);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gantt-bar-labels-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportLabels = event => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const importData = JSON.parse(e.target.result);
        const importResult = importBarLabels(importData);

        if (importResult.success) {
          const updatedSettings = {
            ...userSettings,
            barLabels: importResult.barLabels,
          };
          onSettingsUpdate(updatedSettings);
        } else {
          console.error('Import failed:', importResult.errors);
          alert(`Import failed: ${importResult.errors.join(', ')}`);
        }
      } catch (error) {
        console.error('Error parsing import file:', error);
        alert('Error parsing import file. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const getLabelPreview = label => {
    if (!label) return null;
    return getLabelPreview(label, sampleTask);
  };

  return (
    <div className='bg-white border border-gray-200 rounded-lg p-4'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <TagIcon className='w-5 h-5 text-blue-600' />
          <h3 className='text-lg font-semibold text-gray-900'>Bar Labels</h3>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className='flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors'
          >
            {showPreview ? (
              <EyeIcon className='w-4 h-4' />
            ) : (
              <EyeSlashIcon className='w-4 h-4' />
            )}
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
        </div>
      </div>

      {/* Global Settings */}
      <div className='mb-4 p-3 bg-gray-50 rounded-lg'>
        <h4 className='text-sm font-semibold text-gray-700 mb-3'>
          Global Settings
        </h4>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1'>
              Enable Labels
            </label>
            <input
              type='checkbox'
              checked={barLabels.enabled}
              onChange={e => {
                const updatedSettings = {
                  ...userSettings,
                  barLabels: {
                    ...barLabels,
                    enabled: e.target.checked,
                  },
                };
                onSettingsUpdate(updatedSettings);
              }}
              className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1'>
              Max Labels
            </label>
            <input
              type='number'
              min='1'
              max='5'
              value={barLabels.globalSettings?.maxLabels || 3}
              onChange={e =>
                handleGlobalSettingChange('maxLabels', parseInt(e.target.value))
              }
              className='w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1'>
              Min Bar Width
            </label>
            <input
              type='number'
              min='30'
              max='200'
              value={barLabels.globalSettings?.minBarWidth || 60}
              onChange={e =>
                handleGlobalSettingChange(
                  'minBarWidth',
                  parseInt(e.target.value)
                )
              }
              className='w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1'>
              Max Label Length
            </label>
            <input
              type='number'
              min='5'
              max='50'
              value={barLabels.globalSettings?.maxLabelLength || 20}
              onChange={e =>
                handleGlobalSettingChange(
                  'maxLabelLength',
                  parseInt(e.target.value)
                )
              }
              className='w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
        </div>
      </div>

      {/* Import/Export Controls */}
      <div className='flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg'>
        <button
          onClick={handleExportLabels}
          className='flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
        >
          <DocumentArrowDownIcon className='w-3 h-3' />
          Export
        </button>
        <label className='flex items-center gap-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors cursor-pointer'>
          <DocumentArrowUpIcon className='w-3 h-3' />
          Import
          <input
            type='file'
            accept='.json'
            onChange={handleImportLabels}
            className='hidden'
          />
        </label>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        {/* Label List */}
        <div className='space-y-2'>
          <h4 className='text-sm font-semibold text-gray-700'>
            Configured Labels
          </h4>
          <div className='space-y-1 max-h-64 overflow-y-auto'>
            {barLabels.labels.map((label, index) => {
              const labelType = availableTypes.find(
                t => t.value === label.type
              );
              const isSelected = selectedLabel?.id === label.id;

              return (
                <div
                  key={label.id}
                  className={`p-2 border rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedLabel(label)}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1'>
                        <input
                          type='checkbox'
                          checked={label.enabled}
                          onChange={e => {
                            e.stopPropagation();
                            handleToggleLabel(label.id);
                          }}
                          className='w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                        />
                        <span className='text-sm font-medium text-gray-900 truncate'>
                          {labelType?.label || label.type}
                        </span>
                      </div>
                      <div className='text-xs text-gray-500'>
                        Position: {label.position}
                      </div>
                    </div>
                    <div className='flex items-center gap-1'>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleMoveLabel(label.id, 'up');
                        }}
                        disabled={index === 0}
                        className='p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30'
                        title='Move up'
                      >
                        <ArrowsUpDownIcon className='w-3 h-3 rotate-90' />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteLabel(label.id);
                        }}
                        className='p-1 text-gray-400 hover:text-red-600 transition-colors'
                        title='Delete label'
                      >
                        <TrashIcon className='w-3 h-3' />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {barLabels.labels.length === 0 && (
              <div className='text-center text-gray-500 py-4'>
                <TagIcon className='w-8 h-8 mx-auto mb-2 text-gray-400' />
                <p className='text-sm'>No labels configured</p>
              </div>
            )}
          </div>
        </div>

        {/* Add New Label */}
        <div className='space-y-2'>
          <h4 className='text-sm font-semibold text-gray-700'>Add New Label</h4>
          <div className='space-y-3'>
            <div>
              <label className='block text-xs font-medium text-gray-600 mb-1'>
                Label Type
              </label>
              <select
                value={newLabelType}
                onChange={e => setNewLabelType(e.target.value)}
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>Select label type</option>
                {availableTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-xs font-medium text-gray-600 mb-1'>
                Position
              </label>
              <select
                value={newLabelPosition}
                onChange={e => setNewLabelPosition(e.target.value)}
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                {availablePositions.map(position => (
                  <option key={position.value} value={position.value}>
                    {position.label} - {position.description}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddLabel}
              disabled={!newLabelType}
              className='w-full px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
            >
              <PlusIcon className='w-4 h-4' />
              Add Label
            </button>
          </div>
        </div>

        {/* Label Editor */}
        <div className='space-y-4'>
          {selectedLabel && editingLabel ? (
            <>
              <div className='flex items-center justify-between'>
                <h4 className='text-sm font-semibold text-gray-700'>
                  Edit:{' '}
                  {
                    availableTypes.find(t => t.value === editingLabel.type)
                      ?.label
                  }
                </h4>
              </div>

              {/* Label Preview */}
              {showPreview &&
                (() => {
                  const preview = getLabelPreview(editingLabel);
                  if (!preview) return null;

                  return (
                    <div className='p-3 bg-gray-50 border border-gray-200 rounded'>
                      <div className='text-xs text-gray-600 mb-2'>Preview:</div>
                      <div className='relative h-8 bg-blue-500 rounded'>
                        <div
                          className={`absolute ${preview.className} text-xs font-medium`}
                          style={preview.style}
                        >
                          {preview.value}
                        </div>
                      </div>
                    </div>
                  );
                })()}

              {/* Label Properties */}
              <div className='space-y-3'>
                <div>
                  <label className='block text-xs font-medium text-gray-600 mb-1'>
                    Position
                  </label>
                  <select
                    value={editingLabel.position}
                    onChange={e =>
                      handleLabelChange('position', e.target.value)
                    }
                    className='w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    {availablePositions.map(position => (
                      <option key={position.value} value={position.value}>
                        {position.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Font Size
                    </label>
                    <input
                      type='number'
                      min='8'
                      max='20'
                      value={editingLabel.fontSize}
                      onChange={e =>
                        handleLabelChange('fontSize', parseInt(e.target.value))
                      }
                      className='w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Padding
                    </label>
                    <input
                      type='number'
                      min='0'
                      max='10'
                      value={editingLabel.padding}
                      onChange={e =>
                        handleLabelChange('padding', parseInt(e.target.value))
                      }
                      className='w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-xs font-medium text-gray-600 mb-1'>
                    Font Weight
                  </label>
                  <select
                    value={editingLabel.fontWeight}
                    onChange={e =>
                      handleLabelChange('fontWeight', e.target.value)
                    }
                    className='w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value='normal'>Normal</option>
                    <option value='medium'>Medium</option>
                    <option value='semibold'>Semibold</option>
                    <option value='bold'>Bold</option>
                  </select>
                </div>

                {/* Color Pickers */}
                <div className='space-y-2'>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Text Color
                    </label>
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() => setShowColorPicker('color')}
                        className='w-6 h-6 rounded border border-gray-300'
                        style={{ backgroundColor: editingLabel.color }}
                      />
                      <input
                        type='text'
                        value={editingLabel.color}
                        onChange={e =>
                          handleLabelChange('color', e.target.value)
                        }
                        className='flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        placeholder='#FFFFFF'
                      />
                    </div>
                    {showColorPicker === 'color' && (
                      <div className='absolute z-10 mt-1'>
                        <SketchPicker
                          color={editingLabel.color}
                          onChange={color =>
                            handleLabelChange('color', color.hex)
                          }
                          onClose={() => setShowColorPicker(null)}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Background Color
                    </label>
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() => setShowColorPicker('backgroundColor')}
                        className='w-6 h-6 rounded border border-gray-300'
                        style={{
                          backgroundColor: editingLabel.backgroundColor,
                        }}
                      />
                      <input
                        type='text'
                        value={editingLabel.backgroundColor}
                        onChange={e =>
                          handleLabelChange('backgroundColor', e.target.value)
                        }
                        className='flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        placeholder='rgba(0, 0, 0, 0.3)'
                      />
                    </div>
                    {showColorPicker === 'backgroundColor' && (
                      <div className='absolute z-10 mt-1'>
                        <SketchPicker
                          color={editingLabel.backgroundColor}
                          onChange={color =>
                            handleLabelChange('backgroundColor', color.hex)
                          }
                          onClose={() => setShowColorPicker(null)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={editingLabel.showBackground}
                    onChange={e =>
                      handleLabelChange('showBackground', e.target.checked)
                    }
                    className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                  />
                  <label className='text-xs text-gray-600'>
                    Show background
                  </label>
                </div>

                {/* Validation */}
                {!validation.isValid && (
                  <div className='p-2 bg-red-50 border border-red-200 rounded'>
                    <div className='flex items-center gap-2 mb-1'>
                      <ExclamationTriangleIcon className='w-3 h-3 text-red-600' />
                      <span className='text-xs font-medium text-red-900'>
                        Validation Errors
                      </span>
                    </div>
                    <ul className='text-xs text-red-700 space-y-1'>
                      {validation.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validation.warnings.length > 0 && (
                  <div className='p-2 bg-yellow-50 border border-yellow-200 rounded'>
                    <div className='flex items-center gap-2 mb-1'>
                      <ExclamationTriangleIcon className='w-3 h-3 text-yellow-600' />
                      <span className='text-xs font-medium text-yellow-900'>
                        Warnings
                      </span>
                    </div>
                    <ul className='text-xs text-yellow-700 space-y-1'>
                      {validation.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Save Button */}
                <button
                  onClick={handleSaveLabel}
                  disabled={!validation.isValid}
                  className='w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                >
                  <CheckIcon className='w-4 h-4' />
                  Save Label
                </button>
              </div>
            </>
          ) : (
            <div className='text-center text-gray-500 py-8'>
              <TagIcon className='w-12 h-12 mx-auto mb-2 text-gray-400' />
              <p className='text-sm'>Select a label to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarLabelEditor;
