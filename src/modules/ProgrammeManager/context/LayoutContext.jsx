import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';

const LayoutContext = createContext();

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
};

export const LayoutProvider = ({ children }) => {
  const [currentLayout, setCurrentLayout] = useState({
    columnWidths: {
      taskName: 200,
      startDate: 120,
      endDate: 120,
      duration: 80,
      resource: 120,
      status: 100,
      progress: 80,
      work: 80,
      cost: 100,
      units: 80,
      startVariance: 100,
      finishVariance: 100,
      durationVariance: 100,
      scheduleStatus: 120,
      deadline: 120,
      criticalPath: 100,
    },
    paneSizes: {
      sidebar: 300,
      properties: 280,
      gantt: 'flex-1',
    },
    visibleColumns: [
      'taskName',
      'startDate',
      'endDate',
      'duration',
      'resource',
      'status',
      'progress',
      'work',
      'cost',
      'units',
      'startVariance',
      'finishVariance',
      'durationVariance',
      'scheduleStatus',
      'deadline',
      'criticalPath',
    ],
  });

  const [savedPresets, setSavedPresets] = useState([]);

  // Load saved presets from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gantt.layoutPresets');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedPresets(parsed);
      }
    } catch (error) {
      console.error('Error loading layout presets from localStorage:', error);
    }
  }, []);

  // Save presets to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('gantt.layoutPresets', JSON.stringify(savedPresets));
    } catch (error) {
      console.error('Error saving layout presets to localStorage:', error);
    }
  }, [savedPresets]);

  // Update column width
  const updateColumnWidth = useCallback((columnName, width) => {
    setCurrentLayout(prev => ({
      ...prev,
      columnWidths: {
        ...prev.columnWidths,
        [columnName]: Math.max(80, width), // Minimum width of 80px
      },
    }));
  }, []);

  // Update pane size
  const updatePaneSize = useCallback((paneName, size) => {
    setCurrentLayout(prev => ({
      ...prev,
      paneSizes: {
        ...prev.paneSizes,
        [paneName]: size,
      },
    }));
  }, []);

  // Toggle column visibility
  const toggleColumnVisibility = useCallback(columnName => {
    setCurrentLayout(prev => {
      const isVisible = prev.visibleColumns.includes(columnName);
      const newVisibleColumns = isVisible
        ? prev.visibleColumns.filter(col => col !== columnName)
        : [...prev.visibleColumns, columnName];

      return {
        ...prev,
        visibleColumns: newVisibleColumns,
      };
    });
  }, []);

  // Set column visibility
  const setColumnVisibility = useCallback((columnName, isVisible) => {
    setCurrentLayout(prev => {
      const newVisibleColumns = isVisible
        ? [...new Set([...prev.visibleColumns, columnName])]
        : prev.visibleColumns.filter(col => col !== columnName);

      return {
        ...prev,
        visibleColumns: newVisibleColumns,
      };
    });
  }, []);

  // Save current layout as a preset
  const savePreset = useCallback(
    name => {
      const newPreset = {
        id: Date.now().toString(),
        name,
        layout: { ...currentLayout },
        createdAt: new Date().toISOString(),
      };

      setSavedPresets(prev => {
        // Check if preset with same name already exists
        const existingIndex = prev.findIndex(preset => preset.name === name);
        if (existingIndex !== -1) {
          // Update existing preset
          const updated = [...prev];
          updated[existingIndex] = newPreset;
          return updated;
        }
        // Add new preset
        return [...prev, newPreset];
      });

      return newPreset;
    },
    [currentLayout]
  );

  // Load a preset
  const loadPreset = useCallback(
    presetId => {
      const preset = savedPresets.find(p => p.id === presetId);
      if (preset) {
        setCurrentLayout({ ...preset.layout });
        return preset;
      }
      return null;
    },
    [savedPresets]
  );

  // Delete a preset
  const deletePreset = useCallback(presetId => {
    setSavedPresets(prev => prev.filter(preset => preset.id !== presetId));
  }, []);

  // Reset to default layout
  const resetToDefault = useCallback(() => {
    const defaultLayout = {
      columnWidths: {
        taskName: 200,
        startDate: 120,
        endDate: 120,
        duration: 80,
        resource: 120,
        status: 100,
        progress: 80,
        work: 80,
        cost: 100,
        units: 80,
      },
      paneSizes: {
        sidebar: 300,
        properties: 280,
        gantt: 'flex-1',
      },
      visibleColumns: [
        'taskName',
        'startDate',
        'endDate',
        'duration',
        'resource',
        'status',
        'progress',
        'work',
        'cost',
        'units',
      ],
    };
    setCurrentLayout(defaultLayout);
  }, []);

  // Get available column definitions
  const getAvailableColumns = useCallback(() => {
    return [
      { key: 'taskName', label: 'Task Name', defaultWidth: 200 },
      { key: 'startDate', label: 'Start Date', defaultWidth: 120 },
      { key: 'endDate', label: 'End Date', defaultWidth: 120 },
      { key: 'duration', label: 'Duration', defaultWidth: 80 },
      { key: 'resource', label: 'Resource', defaultWidth: 120 },
      { key: 'status', label: 'Status', defaultWidth: 100 },
      { key: 'progress', label: 'Progress', defaultWidth: 80 },
      { key: 'work', label: 'Work (hrs)', defaultWidth: 80 },
      { key: 'cost', label: 'Cost (£)', defaultWidth: 100 },
      { key: 'units', label: 'Units (%)', defaultWidth: 80 },
      { key: 'startVariance', label: 'Start Variance', defaultWidth: 100 },
      { key: 'finishVariance', label: 'Finish Variance', defaultWidth: 100 },
      {
        key: 'durationVariance',
        label: 'Duration Variance',
        defaultWidth: 100,
      },
      { key: 'scheduleStatus', label: 'Schedule Status', defaultWidth: 120 },
      { key: 'deadline', label: 'Deadline', defaultWidth: 120 },
      { key: 'criticalPath', label: 'Critical Path', defaultWidth: 100 },
      { key: 'priority', label: 'Priority', defaultWidth: 80 },
      { key: 'assignedTo', label: 'Assigned To', defaultWidth: 120 },
      { key: 'notes', label: 'Notes', defaultWidth: 150 },
    ];
  }, []);

  // Check if a column is visible
  const isColumnVisible = useCallback(
    columnName => {
      return currentLayout.visibleColumns.includes(columnName);
    },
    [currentLayout.visibleColumns]
  );

  // Get column width
  const getColumnWidth = useCallback(
    columnName => {
      return currentLayout.columnWidths[columnName] || 120;
    },
    [currentLayout.columnWidths]
  );

  // Get pane size
  const getPaneSize = useCallback(
    paneName => {
      return currentLayout.paneSizes[paneName] || 'auto';
    },
    [currentLayout.paneSizes]
  );

  const value = {
    // Current layout state
    currentLayout,

    // Layout setters
    updateColumnWidth,
    updatePaneSize,
    toggleColumnVisibility,
    setColumnVisibility,

    // Preset management
    savedPresets,
    savePreset,
    loadPreset,
    deletePreset,
    resetToDefault,

    // Utility functions
    getAvailableColumns,
    isColumnVisible,
    getColumnWidth,
    getPaneSize,
  };

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
};
