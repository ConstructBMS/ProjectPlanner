// eslint-disable-next-line no-unused-vars
import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowsUpDownIcon,
  PlusIcon,
  TrashIcon,
  Cog6ToothIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import {
  getAvailableColumns,
  getColumnsByCategory,
  filterColumnsBySearch,
  sortColumnsByCategory,
  COLUMN_CATEGORIES,
  COLUMN_TYPES,
  createDefaultGridConfig,
  validateGridConfig,
  exportGridConfig,
  importGridConfig,
  autoFitColumnWidths,
  getColumnStatistics,
} from '../../utils/gridColumnUtils';

const ColumnChooserDialog = ({
  isOpen,
  onClose,
  gridConfig,
  onConfigChange,
  tasks = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedItem: null,
    draggedOverItem: null,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [importError, setImportError] = useState('');
  const [showStatistics, setShowStatistics] = useState(false);
  const fileInputRef = useRef(null);

  // Get available columns and filter by search/category
  const availableColumns = useMemo(() => {
    let columns = getAvailableColumns();

    // Filter by search term
    if (searchTerm) {
      columns = filterColumnsBySearch(columns, searchTerm);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      columns = columns.filter(col => col.category === selectedCategory);
    }

    return sortColumnsByCategory(columns);
  }, [searchTerm, selectedCategory]);

  // Get current grid columns
  const currentColumns = useMemo(() => {
    return gridConfig?.columns || [];
  }, [gridConfig]);

  // Get categorized columns for display
  const categorizedColumns = useMemo(() => {
    return getColumnsByCategory();
  }, []);

  // Get column statistics
  const columnStats = useMemo(() => {
    return getColumnStatistics(gridConfig, tasks);
  }, [gridConfig, tasks]);

  // Check if a column is currently in the grid
  const isColumnInGrid = useCallback(
    columnKey => {
      return currentColumns.some(col => col.key === columnKey);
    },
    [currentColumns]
  );

  // Check if a column is visible in the grid
  const isColumnVisible = useCallback(
    columnKey => {
      const column = currentColumns.find(col => col.key === columnKey);
      return column?.visible || false;
    },
    [currentColumns]
  );

  // Add column to grid
  const handleAddColumn = useCallback(
    columnKey => {
      if (!onConfigChange) return;

      const newConfig = {
        ...gridConfig,
        columns: [
          ...currentColumns,
          {
            key: columnKey,
            visible: true,
            width: COLUMN_TYPES[columnKey]?.defaultWidth || 120,
            order: currentColumns.length,
          },
        ],
        lastModified: new Date().toISOString(),
      };

      onConfigChange(newConfig);
    },
    [gridConfig, currentColumns, onConfigChange]
  );

  // Remove column from grid
  const handleRemoveColumn = useCallback(
    columnKey => {
      if (!onConfigChange) return;

      const newConfig = {
        ...gridConfig,
        columns: currentColumns.filter(col => col.key !== columnKey),
        lastModified: new Date().toISOString(),
      };

      // Update order for remaining columns
      newConfig.columns.forEach((col, index) => {
        col.order = index;
      });

      onConfigChange(newConfig);
    },
    [gridConfig, currentColumns, onConfigChange]
  );

  // Toggle column visibility
  const handleToggleVisibility = useCallback(
    columnKey => {
      if (!onConfigChange) return;

      const newConfig = {
        ...gridConfig,
        columns: currentColumns.map(col =>
          (col.key === columnKey ? { ...col, visible: !col.visible } : col)
        ),
        lastModified: new Date().toISOString(),
      };

      onConfigChange(newConfig);
    },
    [gridConfig, currentColumns, onConfigChange]
  );

  // Handle drag start
  const handleDragStart = useCallback((e, columnKey) => {
    setDragState({
      isDragging: true,
      draggedItem: columnKey,
      draggedOverItem: null,
    });
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e, columnKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    setDragState(prev => ({
      ...prev,
      draggedOverItem: columnKey,
    }));
  }, []);

  // Handle drop
  const handleDrop = useCallback(
    (e, targetColumnKey) => {
      e.preventDefault();

      if (!dragState.isDragging || !dragState.draggedItem || !onConfigChange)
        return;

      const draggedKey = dragState.draggedItem;
      const targetKey = targetColumnKey;

      if (draggedKey === targetKey) {
        setDragState({
          isDragging: false,
          draggedItem: null,
          draggedOverItem: null,
        });
        return;
      }

      // Find indices
      const draggedIndex = currentColumns.findIndex(
        col => col.key === draggedKey
      );
      const targetIndex = currentColumns.findIndex(
        col => col.key === targetKey
      );

      if (draggedIndex === -1 || targetIndex === -1) {
        setDragState({
          isDragging: false,
          draggedItem: null,
          draggedOverItem: null,
        });
        return;
      }

      // Reorder columns
      const newColumns = [...currentColumns];
      const [draggedColumn] = newColumns.splice(draggedIndex, 1);
      newColumns.splice(targetIndex, 0, draggedColumn);

      // Update order
      newColumns.forEach((col, index) => {
        col.order = index;
      });

      const newConfig = {
        ...gridConfig,
        columns: newColumns,
        lastModified: new Date().toISOString(),
      };

      onConfigChange(newConfig);
      setDragState({
        isDragging: false,
        draggedItem: null,
        draggedOverItem: null,
      });
    },
    [dragState, currentColumns, gridConfig, onConfigChange]
  );

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedItem: null,
      draggedOverItem: null,
    });
  }, []);

  // Reset to default configuration
  const handleResetToDefault = useCallback(() => {
    if (!onConfigChange) return;

    const defaultConfig = createDefaultGridConfig();
    onConfigChange(defaultConfig);
  }, [onConfigChange]);

  // Auto-fit column widths
  const handleAutoFit = useCallback(() => {
    if (!onConfigChange) return;

    const newConfig = autoFitColumnWidths(gridConfig, tasks);
    onConfigChange(newConfig);
  }, [gridConfig, tasks, onConfigChange]);

  // Export configuration
  const handleExport = useCallback(() => {
    try {
      const exported = exportGridConfig(gridConfig);
      const blob = new Blob([JSON.stringify(exported, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grid-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting grid configuration:', error);
    }
  }, [gridConfig]);

  // Import configuration
  const handleImport = useCallback(
    event => {
      const file = event.target.files[0];
      if (!file || !onConfigChange) return;

      const reader = new FileReader();
      reader.onload = e => {
        try {
          const imported = JSON.parse(e.target.result);
          const newConfig = importGridConfig(imported);
          onConfigChange(newConfig);
          setImportError('');
        } catch (error) {
          setImportError(`Import failed: ${error.message}`);
        }
      };
      reader.readAsText(file);

      // Reset file input
      event.target.value = '';
    },
    [onConfigChange]
  );

  // Trigger file input
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center gap-3'>
            <Cog6ToothIcon className='w-6 h-6 text-blue-600' />
            <h2 className='text-xl font-semibold text-gray-900'>
              Customize Grid Columns
            </h2>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <XMarkIcon className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 flex overflow-hidden'>
          {/* Left Panel - Available Columns */}
          <div className='w-1/2 border-r border-gray-200 flex flex-col'>
            <div className='p-4 border-b border-gray-200'>
              <h3 className='text-lg font-medium text-gray-900 mb-3'>
                Available Columns
              </h3>

              {/* Search */}
              <div className='relative mb-3'>
                <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                <input
                  type='text'
                  placeholder='Search columns...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              {/* Category Filter */}
              <div className='flex flex-wrap gap-2'>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {Object.entries(COLUMN_CATEGORIES).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === key
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Available Columns List */}
            <div className='flex-1 overflow-y-auto p-4'>
              {availableColumns.length === 0 ? (
                <div className='text-center text-gray-500 py-8'>
                  No columns found matching your search criteria.
                </div>
              ) : (
                <div className='space-y-2'>
                  {availableColumns.map(column => (
                    <div
                      key={column.key}
                      className={`p-3 border rounded-lg transition-colors ${
                        isColumnInGrid(column.key)
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2'>
                            <span className='font-medium text-gray-900'>
                              {column.label}
                            </span>
                            {column.category && (
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium bg-${
                                  COLUMN_CATEGORIES[column.category]?.color ||
                                  'gray'
                                }-100 text-${
                                  COLUMN_CATEGORIES[column.category]?.color ||
                                  'gray'
                                }-800`}
                              >
                                {COLUMN_CATEGORIES[column.category]?.name}
                              </span>
                            )}
                          </div>
                          <p className='text-sm text-gray-600 mt-1'>
                            {column.description}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAddColumn(column.key)}
                          disabled={isColumnInGrid(column.key)}
                          className={`p-2 rounded-lg transition-colors ${
                            isColumnInGrid(column.key)
                              ? 'bg-green-100 text-green-600 cursor-not-allowed'
                              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                          }`}
                          title={
                            isColumnInGrid(column.key)
                              ? 'Already added'
                              : 'Add column'
                          }
                        >
                          <PlusIcon className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Current Grid Columns */}
          <div className='w-1/2 flex flex-col'>
            <div className='p-4 border-b border-gray-200'>
              <div className='flex items-center justify-between mb-3'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Current Grid Columns
                </h3>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={handleAutoFit}
                    className='px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors'
                    title='Auto-fit column widths'
                  >
                    Auto-fit
                  </button>
                  <button
                    onClick={() => setShowStatistics(!showStatistics)}
                    className='px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors'
                    title='Show statistics'
                  >
                    Stats
                  </button>
                </div>
              </div>

              {/* Statistics Panel */}
              {showStatistics && (
                <div className='bg-gray-50 rounded-lg p-3 mb-3'>
                  <div className='grid grid-cols-3 gap-4 text-sm'>
                    <div>
                      <div className='font-medium text-gray-900'>
                        {columnStats.totalColumns}
                      </div>
                      <div className='text-gray-600'>Total Columns</div>
                    </div>
                    <div>
                      <div className='font-medium text-gray-900'>
                        {columnStats.visibleColumns}
                      </div>
                      <div className='text-gray-600'>Visible</div>
                    </div>
                    <div>
                      <div className='font-medium text-gray-900'>
                        {columnStats.hiddenColumns}
                      </div>
                      <div className='text-gray-600'>Hidden</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Options */}
              <div className='flex items-center gap-4'>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className='flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors'
                >
                  <Cog6ToothIcon className='w-4 h-4' />
                  Advanced
                </button>

                {showAdvanced && (
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={handleResetToDefault}
                      className='flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 transition-colors'
                      title='Reset to default configuration'
                    >
                      <ArrowPathIcon className='w-4 h-4' />
                      Reset
                    </button>
                    <button
                      onClick={handleExport}
                      className='flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors'
                      title='Export configuration'
                    >
                      <DocumentArrowDownIcon className='w-4 h-4' />
                      Export
                    </button>
                    <button
                      onClick={handleImportClick}
                      className='flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors'
                      title='Import configuration'
                    >
                      <DocumentArrowUpIcon className='w-4 h-4' />
                      Import
                    </button>
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='.json'
                      onChange={handleImport}
                      className='hidden'
                    />
                  </div>
                )}
              </div>

              {importError && (
                <div className='mt-2 p-2 bg-red-100 text-red-700 rounded-lg text-sm'>
                  {importError}
                </div>
              )}
            </div>

            {/* Current Columns List */}
            <div className='flex-1 overflow-y-auto p-4'>
              {currentColumns.length === 0 ? (
                <div className='text-center text-gray-500 py-8'>
                  No columns configured. Add columns from the left panel.
                </div>
              ) : (
                <div className='space-y-2'>
                  {currentColumns
                    .sort((a, b) => a.order - b.order)
                    .map((column, index) => (
                      <div
                        key={column.key}
                        draggable
                        onDragStart={e => handleDragStart(e, column.key)}
                        onDragOver={e => handleDragOver(e, column.key)}
                        onDrop={e => handleDrop(e, column.key)}
                        onDragEnd={handleDragEnd}
                        className={`p-3 border rounded-lg transition-colors cursor-move ${
                          dragState.draggedOverItem === column.key
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${
                          dragState.draggedItem === column.key
                            ? 'opacity-50'
                            : ''
                        }`}
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-3'>
                            <ArrowsUpDownIcon className='w-4 h-4 text-gray-400' />
                            <div className='flex-1'>
                              <div className='flex items-center gap-2'>
                                <span className='font-medium text-gray-900'>
                                  {column.label ||
                                    COLUMN_TYPES[column.key]?.label}
                                </span>
                                <span className='text-sm text-gray-500'>
                                  ({column.width}px)
                                </span>
                              </div>
                              <p className='text-sm text-gray-600'>
                                {COLUMN_TYPES[column.key]?.description}
                              </p>
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <button
                              onClick={() => handleToggleVisibility(column.key)}
                              className={`p-2 rounded-lg transition-colors ${
                                column.visible
                                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                              title={
                                column.visible ? 'Hide column' : 'Show column'
                              }
                            >
                              {column.visible ? (
                                <EyeIcon className='w-4 h-4' />
                              ) : (
                                <EyeSlashIcon className='w-4 h-4' />
                              )}
                            </button>
                            <button
                              onClick={() => handleRemoveColumn(column.key)}
                              className='p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors'
                              title='Remove column'
                            >
                              <TrashIcon className='w-4 h-4' />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='p-4 border-t border-gray-200 bg-gray-50'>
          <div className='flex items-center justify-between'>
            <div className='text-sm text-gray-600'>
              {currentColumns.length} columns configured
              {currentColumns.filter(col => col.visible).length !==
                currentColumns.length && (
                <span className='ml-2 text-orange-600'>
                  ({currentColumns.filter(col => col.visible).length} visible)
                </span>
              )}
            </div>
            <div className='flex items-center gap-3'>
              <button
                onClick={onClose}
                className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnChooserDialog;
