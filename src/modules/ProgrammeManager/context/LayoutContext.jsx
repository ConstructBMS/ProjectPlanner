import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  createDefaultGridConfig,
  loadGridConfigFromStorage,
  saveGridConfigToStorage,
  validateGridConfig,
  getAvailableColumns as getAvailableColumnsUtil,
  getVisibleColumns,
  getColumnWidth as getColumnWidthUtil,
  toggleColumnVisibility as toggleColumnVisibilityUtil,
  updateColumnWidth as updateColumnWidthUtil,
  reorderColumns,
  addColumnToGrid,
  removeColumnFromGrid,
} from '../utils/gridColumnUtils';

const LayoutContext = createContext();

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
};

export const LayoutProvider = ({ children }) => {
  const [gridConfig, setGridConfig] = useState(() => {
    return loadGridConfigFromStorage();
  });

  const [currentLayout, setCurrentLayout] = useState({
    paneSizes: {
      sidebar: 300,
      properties: 280,
      gantt: 'flex-1',
    },
  });

  const [savedPresets, setSavedPresets] = useState([]);

  // Save grid config to localStorage when it changes
  useEffect(() => {
    saveGridConfigToStorage(gridConfig);
  }, [gridConfig]);

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

  // Update grid configuration
  const updateGridConfig = useCallback((newConfig) => {
    const validation = validateGridConfig(newConfig);
    if (validation.isValid) {
      setGridConfig(newConfig);
    } else {
      console.error('Invalid grid configuration:', validation.errors);
    }
  }, []);

  // Update column width
  const updateColumnWidth = useCallback((columnName, width) => {
    const newConfig = updateColumnWidthUtil(gridConfig, columnName, width);
    setGridConfig(newConfig);
  }, [gridConfig]);

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
    const newConfig = toggleColumnVisibilityUtil(gridConfig, columnName);
    setGridConfig(newConfig);
  }, [gridConfig]);

  // Set column visibility
  const setColumnVisibility = useCallback((columnName, isVisible) => {
    const newConfig = {
      ...gridConfig,
      columns: gridConfig.columns.map(col => 
        col.key === columnName 
          ? { ...col, visible: isVisible }
          : col
      ),
      lastModified: new Date().toISOString(),
    };
    setGridConfig(newConfig);
  }, [gridConfig]);

  // Save current layout as a preset
  const savePreset = useCallback(
    name => {
      const newPreset = {
        id: Date.now().toString(),
        name,
        layout: { 
          ...currentLayout,
          gridConfig: { ...gridConfig }
        },
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
    [currentLayout, gridConfig]
  );

  // Load a preset
  const loadPreset = useCallback(
    presetId => {
      const preset = savedPresets.find(p => p.id === presetId);
      if (preset) {
        setCurrentLayout({ ...preset.layout });
        if (preset.layout.gridConfig) {
          setGridConfig(preset.layout.gridConfig);
        }
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
      paneSizes: {
        sidebar: 300,
        properties: 280,
        gantt: 'flex-1',
      },
    };
    setCurrentLayout(defaultLayout);
    setGridConfig(createDefaultGridConfig());
  }, []);

  // Get available column definitions
  const getAvailableColumns = useCallback(() => {
    return getAvailableColumnsUtil();
  }, []);

  // Check if a column is visible
  const isColumnVisible = useCallback(
    columnName => {
      return getVisibleColumns(gridConfig).some(col => col.key === columnName);
    },
    [gridConfig]
  );

  // Get column width
  const getColumnWidth = useCallback(
    columnName => {
      return getColumnWidthUtil(gridConfig, columnName);
    },
    [gridConfig]
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
    gridConfig,

    // Layout setters
    updateGridConfig,
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
