 
import { useState, useEffect } from 'react';
import { SketchPicker } from 'react-color';
import {
  PaintBrushIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  ExclamationTriangleIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import {
  getAvailableTaskTypes,
  getAvailableStatuses,
  getAvailablePriorities,
  getAvailableResources,
  validateBarStyle,
  createDefaultBarStyle,
  createBarStyleObject,
  exportBarStyles,
  importBarStyles,
  applyResourceColors,
} from '../utils/barStyleUtils';

const BarStyleEditor = ({ tasks, userSettings, onSettingsUpdate }) => {
  const [activeCategory, setActiveCategory] = useState('taskType');
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [editingStyle, setEditingStyle] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(null);
  const [validation, setValidation] = useState({
    isValid: true,
    errors: [],
    warnings: [],
  });
  const [showPreview, setShowPreview] = useState(true);

  const categories = [
    { id: 'taskType', label: 'Task Type', items: getAvailableTaskTypes() },
    { id: 'status', label: 'Status', items: getAvailableStatuses() },
    { id: 'priority', label: 'Priority', items: getAvailablePriorities() },
    { id: 'resource', label: 'Resource', items: getAvailableResources(tasks) },
  ];

  // Initialize editing style when selected style changes
  useEffect(() => {
    if (selectedStyle) {
      const currentStyles = userSettings.barStyles?.[activeCategory] || {};
      const existingStyle = currentStyles[selectedStyle.value];

      if (existingStyle) {
        setEditingStyle({ ...existingStyle });
      } else {
        setEditingStyle(
          createDefaultBarStyle(activeCategory, selectedStyle.value)
        );
      }
    }
  }, [selectedStyle, activeCategory, userSettings.barStyles]);

  // Validate style when it changes
  useEffect(() => {
    if (editingStyle) {
      const validationResult = validateBarStyle(editingStyle);
      setValidation(validationResult);
    }
  }, [editingStyle]);

  const handleStyleChange = (field, value) => {
    if (!editingStyle) return;

    setEditingStyle(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveStyle = () => {
    if (!selectedStyle || !editingStyle || !validation.isValid) return;

    const updatedSettings = {
      ...userSettings,
      barStyles: {
        ...userSettings.barStyles,
        [activeCategory]: {
          ...userSettings.barStyles?.[activeCategory],
          [selectedStyle.value]: editingStyle,
        },
      },
    };

    onSettingsUpdate(updatedSettings);
  };

  const handleResetStyle = () => {
    if (!selectedStyle) return;

    setEditingStyle(createDefaultBarStyle(activeCategory, selectedStyle.value));
  };

  const handleDeleteStyle = () => {
    if (!selectedStyle) return;

    const updatedSettings = {
      ...userSettings,
      barStyles: {
        ...userSettings.barStyles,
        [activeCategory]: {
          ...userSettings.barStyles?.[activeCategory],
        },
      },
    };

    delete updatedSettings.barStyles[activeCategory][selectedStyle.value];

    onSettingsUpdate(updatedSettings);
    setSelectedStyle(null);
    setEditingStyle(null);
  };

  const handleExportStyles = () => {
    const exportData = exportBarStyles(userSettings);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gantt-bar-styles-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportStyles = event => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const importData = JSON.parse(e.target.result);
        const importResult = importBarStyles(importData);

        if (importResult.success) {
          const updatedSettings = {
            ...userSettings,
            barStyles: importResult.barStyles,
          };
          onSettingsUpdate(updatedSettings);
        } else {
          console.error('Import failed:', importResult.errors);
        }
      } catch (error) {
        console.error('Error parsing import file:', error);
      }
    };
    reader.readAsText(file);
  };

  const handleAutoGenerateResourceColors = () => {
    const resources = getAvailableResources(tasks).map(r => r.value);
    const updatedStyles = applyResourceColors(
      userSettings.barStyles || {},
      resources
    );

    const updatedSettings = {
      ...userSettings,
      barStyles: updatedStyles,
    };

    onSettingsUpdate(updatedSettings);
  };

  const getCurrentStyles = () => {
    return userSettings.barStyles?.[activeCategory] || {};
  };

  const getStylePreview = style => {
    if (!style) return {};
    return createBarStyleObject(style);
  };

  return (
    <div className='bg-white border border-gray-200 rounded-lg p-4'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <PaintBrushIcon className='w-5 h-5 text-purple-600' />
          <h3 className='text-lg font-semibold text-gray-900'>Bar Styles</h3>
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

      {/* Import/Export Controls */}
      <div className='flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg'>
        <button
          onClick={handleExportStyles}
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
            onChange={handleImportStyles}
            className='hidden'
          />
        </label>
        {activeCategory === 'resource' && (
          <button
            onClick={handleAutoGenerateResourceColors}
            className='flex items-center gap-1 px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors'
          >
            <ArrowPathIcon className='w-3 h-3' />
            Auto Colors
          </button>
        )}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        {/* Category Selection */}
        <div className='space-y-2'>
          <h4 className='text-sm font-semibold text-gray-700'>Categories</h4>
          <div className='space-y-1'>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  setSelectedStyle(null);
                  setEditingStyle(null);
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                  activeCategory === category.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Style Selection */}
        <div className='space-y-2'>
          <h4 className='text-sm font-semibold text-gray-700'>
            {categories.find(c => c.id === activeCategory)?.label} Styles
          </h4>
          <div className='space-y-1 max-h-64 overflow-y-auto'>
            {categories
              .find(c => c.id === activeCategory)
              ?.items.map(item => {
                const currentStyles = getCurrentStyles();
                const style = currentStyles[item.value];

                return (
                  <button
                    key={item.value}
                    onClick={() => setSelectedStyle(item)}
                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                      selectedStyle?.value === item.value
                        ? 'bg-purple-100 text-purple-700 border border-purple-300'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className='flex items-center justify-between'>
                      <span>{item.label}</span>
                      {style && (
                        <div
                          className='w-4 h-4 rounded border border-gray-300'
                          style={getStylePreview(style)}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Style Editor */}
        <div className='space-y-4'>
          {selectedStyle && editingStyle ? (
            <>
              <div className='flex items-center justify-between'>
                <h4 className='text-sm font-semibold text-gray-700'>
                  Edit: {selectedStyle.label}
                </h4>
                <div className='flex items-center gap-1'>
                  <button
                    onClick={handleResetStyle}
                    className='px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors'
                    title='Reset to default'
                  >
                    <ArrowPathIcon className='w-3 h-3' />
                  </button>
                  <button
                    onClick={handleDeleteStyle}
                    className='px-2 py-1 text-xs text-red-600 hover:text-red-800 transition-colors'
                    title='Delete style'
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Style Preview */}
              {showPreview && (
                <div className='p-3 bg-gray-50 border border-gray-200 rounded'>
                  <div className='text-xs text-gray-600 mb-2'>Preview:</div>
                  <div
                    className='w-full h-8 rounded flex items-center justify-center text-sm font-medium'
                    style={getStylePreview(editingStyle)}
                  >
                    Sample Task
                  </div>
                </div>
              )}

              {/* Color Pickers */}
              <div className='space-y-3'>
                <div>
                  <label className='block text-xs font-medium text-gray-600 mb-1'>
                    Background Color
                  </label>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => setShowColorPicker('backgroundColor')}
                      className='w-8 h-8 rounded border border-gray-300'
                      style={{ backgroundColor: editingStyle.backgroundColor }}
                    />
                    <input
                      type='text'
                      value={editingStyle.backgroundColor}
                      onChange={e =>
                        handleStyleChange('backgroundColor', e.target.value)
                      }
                      className='flex-1 px-2 py-1 text-xs border border-gray-300 rounded'
                      placeholder='#3B82F6'
                    />
                  </div>
                  {showColorPicker === 'backgroundColor' && (
                    <div className='absolute z-10 mt-1'>
                      <SketchPicker
                        color={editingStyle.backgroundColor}
                        onChange={color =>
                          handleStyleChange('backgroundColor', color.hex)
                        }
                        onClose={() => setShowColorPicker(null)}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className='block text-xs font-medium text-gray-600 mb-1'>
                    Border Color
                  </label>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => setShowColorPicker('borderColor')}
                      className='w-8 h-8 rounded border border-gray-300'
                      style={{ backgroundColor: editingStyle.borderColor }}
                    />
                    <input
                      type='text'
                      value={editingStyle.borderColor}
                      onChange={e =>
                        handleStyleChange('borderColor', e.target.value)
                      }
                      className='flex-1 px-2 py-1 text-xs border border-gray-300 rounded'
                      placeholder='#2563EB'
                    />
                  </div>
                  {showColorPicker === 'borderColor' && (
                    <div className='absolute z-10 mt-1'>
                      <SketchPicker
                        color={editingStyle.borderColor}
                        onChange={color =>
                          handleStyleChange('borderColor', color.hex)
                        }
                        onClose={() => setShowColorPicker(null)}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className='block text-xs font-medium text-gray-600 mb-1'>
                    Text Color
                  </label>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => setShowColorPicker('textColor')}
                      className='w-8 h-8 rounded border border-gray-300'
                      style={{ backgroundColor: editingStyle.textColor }}
                    />
                    <input
                      type='text'
                      value={editingStyle.textColor}
                      onChange={e =>
                        handleStyleChange('textColor', e.target.value)
                      }
                      className='flex-1 px-2 py-1 text-xs border border-gray-300 rounded'
                      placeholder='#FFFFFF'
                    />
                  </div>
                  {showColorPicker === 'textColor' && (
                    <div className='absolute z-10 mt-1'>
                      <SketchPicker
                        color={editingStyle.textColor}
                        onChange={color =>
                          handleStyleChange('textColor', color.hex)
                        }
                        onClose={() => setShowColorPicker(null)}
                      />
                    </div>
                  )}
                </div>

                {/* Numeric Properties */}
                <div className='grid grid-cols-3 gap-2'>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Opacity
                    </label>
                    <input
                      type='number'
                      min='0'
                      max='1'
                      step='0.1'
                      value={editingStyle.opacity}
                      onChange={e =>
                        handleStyleChange('opacity', parseFloat(e.target.value))
                      }
                      className='w-full px-2 py-1 text-xs border border-gray-300 rounded'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Border Width
                    </label>
                    <input
                      type='number'
                      min='0'
                      max='10'
                      value={editingStyle.borderWidth}
                      onChange={e =>
                        handleStyleChange(
                          'borderWidth',
                          parseInt(e.target.value)
                        )
                      }
                      className='w-full px-2 py-1 text-xs border border-gray-300 rounded'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Border Radius
                    </label>
                    <input
                      type='number'
                      min='0'
                      max='20'
                      value={editingStyle.borderRadius}
                      onChange={e =>
                        handleStyleChange(
                          'borderRadius',
                          parseInt(e.target.value)
                        )
                      }
                      className='w-full px-2 py-1 text-xs border border-gray-300 rounded'
                    />
                  </div>
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
                        <li key={`style-error-${index}`}>• {error}</li>
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
                        <li key={`style-warning-${index}`}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Save Button */}
                <button
                  onClick={handleSaveStyle}
                  disabled={!validation.isValid}
                  className='w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                >
                  <CheckIcon className='w-4 h-4' />
                  Save Style
                </button>
              </div>
            </>
          ) : (
            <div className='text-center text-gray-500 py-8'>
              <PaintBrushIcon className='w-12 h-12 mx-auto mb-2 text-gray-400' />
              <p className='text-sm'>Select a style to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarStyleEditor;
