// Preferences utility for managing user settings
export interface LayoutRatios {
  [key: string]: number[];
}

export interface SavedFilter {
  id: string;
  name: string;
  query: string;
  createdAt: string;
  lastUsed?: string;
}

export interface UserPreferences {
  layoutRatios: LayoutRatios;
  ribbonMinimised: boolean;
  qatPosition: 'above' | 'below';
  savedFilters: SavedFilter[];
  lastFilterId?: string;
}

import { getStorage, setStorage } from './persistentStorage.js';

const STORAGE_KEY = 'pm.preferences';

// Load preferences from persistent storage
export const loadPreferences = async (): Promise<UserPreferences> => {
  try {
    const stored = await getStorage(STORAGE_KEY);
    if (stored) {
      return stored;
    }
  } catch (error) {
    console.warn('Failed to load preferences:', error);
  }
  
  return {
    layoutRatios: {},
    ribbonMinimised: false,
    qatPosition: 'above',
    savedFilters: [],
    lastFilterId: undefined
  };
};

// Save preferences to persistent storage
export const savePreferences = async (prefs: Partial<UserPreferences>): Promise<void> => {
  try {
    const current = await loadPreferences();
    const updated = { ...current, ...prefs };
    await setStorage(STORAGE_KEY, updated);
  } catch (error) {
    console.warn('Failed to save preferences:', error);
  }
};

// Get layout ratios for a specific route
export const getLayoutRatios = (route: string): number[] | null => {
  try {
    // Use localStorage directly for synchronous access
    const stored = localStorage.getItem('pm.preferences');
    if (stored) {
      const prefs = JSON.parse(stored);
      return prefs.layoutRatios?.[route] || null;
    }
    return null;
  } catch (error) {
    console.warn('Failed to get layout ratios:', error);
    return null;
  }
};

// Save layout ratios for a specific route
export const saveLayoutRatios = (route: string, ratios: number[]): void => {
  try {
    // Use localStorage directly for synchronous access
    const stored = localStorage.getItem('pm.preferences');
    let prefs = stored ? JSON.parse(stored) : { layoutRatios: {} };
    
    if (!prefs.layoutRatios) {
      prefs.layoutRatios = {};
    }
    
    prefs.layoutRatios[route] = ratios;
    localStorage.setItem('pm.preferences', JSON.stringify(prefs));
  } catch (error) {
    console.warn('Failed to save layout ratios:', error);
  }
};

// Reset layout ratios for a specific route
export const resetLayoutRatios = (route: string): void => {
  const prefs = loadPreferences();
  delete prefs.layoutRatios[route];
  savePreferences(prefs);
};

// Get ribbon minimised state
export const getRibbonMinimised = (): boolean => {
  const prefs = loadPreferences();
  return prefs.ribbonMinimised;
};

// Save ribbon minimised state
export const saveRibbonMinimised = (minimised: boolean): void => {
  savePreferences({ ribbonMinimised: minimised });
};

// Get QAT position
export const getQatPosition = (): 'above' | 'below' => {
  const prefs = loadPreferences();
  return prefs.qatPosition;
};

// Save QAT position
export const saveQatPosition = (position: 'above' | 'below'): void => {
  savePreferences({ qatPosition: position });
};

// Filter management functions
export const getSavedFilters = (): SavedFilter[] => {
  const prefs = loadPreferences();
  return prefs.savedFilters || [];
};

export const saveFilter = (filter: SavedFilter): void => {
  const prefs = loadPreferences();
  const existingIndex = prefs.savedFilters.findIndex(f => f.id === filter.id);
  
  if (existingIndex >= 0) {
    prefs.savedFilters[existingIndex] = filter;
  } else {
    prefs.savedFilters.push(filter);
  }
  
  savePreferences(prefs);
};

export const deleteFilter = (filterId: string): void => {
  const prefs = loadPreferences();
  prefs.savedFilters = prefs.savedFilters.filter(f => f.id !== filterId);
  
  // If we're deleting the last used filter, clear the lastFilterId
  if (prefs.lastFilterId === filterId) {
    prefs.lastFilterId = undefined;
  }
  
  savePreferences(prefs);
};

export const getLastFilterId = (): string | undefined => {
  const prefs = loadPreferences();
  return prefs.lastFilterId;
};

export const setLastFilterId = (filterId: string | undefined): void => {
  savePreferences({ lastFilterId: filterId });
};

// Preferences utility for allocation pane settings

export interface AllocationPreferences {
  paneVisible: boolean;
  paneWidth: number;
}

const DEFAULT_PREFERENCES: AllocationPreferences = {
  paneVisible: false,
  paneWidth: 320,
};

const STORAGE_KEYS = {
  PANE_VISIBLE: 'pm.alloc.pane.visible',
  PANE_WIDTH: 'pm.alloc.pane.width',
} as const;

/**
 * Load allocation preferences from localStorage
 */
export function loadAllocationPreferences(): AllocationPreferences {
  try {
    const visible = localStorage.getItem(STORAGE_KEYS.PANE_VISIBLE);
    const width = localStorage.getItem(STORAGE_KEYS.PANE_WIDTH);
    
    return {
      paneVisible: visible !== null ? visible === 'true' : DEFAULT_PREFERENCES.paneVisible,
      paneWidth: width !== null ? Math.max(260, parseInt(width, 10)) : DEFAULT_PREFERENCES.paneWidth,
    };
  } catch (error) {
    console.warn('Failed to load allocation preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Save allocation preferences to localStorage
 */
export function saveAllocationPreferences(prefs: Partial<AllocationPreferences>): void {
  try {
    if (prefs.paneVisible !== undefined) {
      localStorage.setItem(STORAGE_KEYS.PANE_VISIBLE, prefs.paneVisible.toString());
    }
    
    if (prefs.paneWidth !== undefined) {
      const clampedWidth = Math.max(260, Math.min(500, prefs.paneWidth));
      localStorage.setItem(STORAGE_KEYS.PANE_WIDTH, clampedWidth.toString());
    }
  } catch (error) {
    console.warn('Failed to save allocation preferences:', error);
  }
}

/**
 * Get pane visibility preference
 */
export function getPaneVisible(): boolean {
  try {
    const visible = localStorage.getItem(STORAGE_KEYS.PANE_VISIBLE);
    return visible !== null ? visible === 'true' : DEFAULT_PREFERENCES.paneVisible;
  } catch (error) {
    console.warn('Failed to get pane visibility preference:', error);
    return DEFAULT_PREFERENCES.paneVisible;
  }
}

/**
 * Set pane visibility preference
 */
export function setPaneVisible(visible: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PANE_VISIBLE, visible.toString());
  } catch (error) {
    console.warn('Failed to set pane visibility preference:', error);
  }
}

/**
 * Get pane width preference
 */
export function getPaneWidth(): number {
  try {
    const width = localStorage.getItem(STORAGE_KEYS.PANE_WIDTH);
    if (width !== null) {
      const parsedWidth = parseInt(width, 10);
      return Math.max(260, Math.min(500, parsedWidth));
    }
    return DEFAULT_PREFERENCES.paneWidth;
  } catch (error) {
    console.warn('Failed to get pane width preference:', error);
    return DEFAULT_PREFERENCES.paneWidth;
  }
}

/**
 * Set pane width preference
 */
export function setPaneWidth(width: number): void {
  try {
    const clampedWidth = Math.max(260, Math.min(500, width));
    localStorage.setItem(STORAGE_KEYS.PANE_WIDTH, clampedWidth.toString());
  } catch (error) {
    console.warn('Failed to set pane width preference:', error);
  }
}

/**
 * Reset allocation preferences to defaults
 */
export function resetAllocationPreferences(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PANE_VISIBLE);
    localStorage.removeItem(STORAGE_KEYS.PANE_WIDTH);
  } catch (error) {
    console.warn('Failed to reset allocation preferences:', error);
  }
}

// 4D Model Panel preferences

export interface FourDPreferences {
  panelVisible: boolean;
  panelWidth: number;
}

const DEFAULT_FOURD_PREFERENCES: FourDPreferences = {
  panelVisible: false,
  panelWidth: 320,
};

const FOURD_STORAGE_KEYS = {
  PANEL_VISIBLE: 'pm.4d.panel.visible',
  PANEL_WIDTH: 'pm.4d.panel.width',
} as const;

/**
 * Load 4D preferences from localStorage
 */
export function loadFourDPreferences(): FourDPreferences {
  try {
    const visible = localStorage.getItem(FOURD_STORAGE_KEYS.PANEL_VISIBLE);
    const width = localStorage.getItem(FOURD_STORAGE_KEYS.PANEL_WIDTH);
    
    return {
      panelVisible: visible !== null ? visible === 'true' : DEFAULT_FOURD_PREFERENCES.panelVisible,
      panelWidth: width !== null ? Math.max(260, parseInt(width, 10)) : DEFAULT_FOURD_PREFERENCES.panelWidth,
    };
  } catch (error) {
    console.warn('Failed to load 4D preferences:', error);
    return DEFAULT_FOURD_PREFERENCES;
  }
}

/**
 * Save 4D preferences to localStorage
 */
export function saveFourDPreferences(prefs: Partial<FourDPreferences>): void {
  try {
    if (prefs.panelVisible !== undefined) {
      localStorage.setItem(FOURD_STORAGE_KEYS.PANEL_VISIBLE, prefs.panelVisible.toString());
    }
    
    if (prefs.panelWidth !== undefined) {
      const clampedWidth = Math.max(260, Math.min(500, prefs.panelWidth));
      localStorage.setItem(FOURD_STORAGE_KEYS.PANEL_WIDTH, clampedWidth.toString());
    }
  } catch (error) {
    console.warn('Failed to save 4D preferences:', error);
  }
}

/**
 * Get 4D panel visibility preference
 */
export function getFourDPanelVisible(): boolean {
  try {
    const visible = localStorage.getItem(FOURD_STORAGE_KEYS.PANEL_VISIBLE);
    return visible !== null ? visible === 'true' : DEFAULT_FOURD_PREFERENCES.panelVisible;
  } catch (error) {
    console.warn('Failed to get 4D panel visibility preference:', error);
    return DEFAULT_FOURD_PREFERENCES.panelVisible;
  }
}

/**
 * Set 4D panel visibility preference
 */
export function setFourDPanelVisible(visible: boolean): void {
  try {
    localStorage.setItem(FOURD_STORAGE_KEYS.PANEL_VISIBLE, visible.toString());
  } catch (error) {
    console.warn('Failed to set 4D panel visibility preference:', error);
  }
}

/**
 * Get 4D panel width preference
 */
export function getFourDPanelWidth(): number {
  try {
    const width = localStorage.getItem(FOURD_STORAGE_KEYS.PANEL_WIDTH);
    if (width !== null) {
      const parsedWidth = parseInt(width, 10);
      return Math.max(260, Math.min(500, parsedWidth));
    }
    return DEFAULT_FOURD_PREFERENCES.panelWidth;
  } catch (error) {
    console.warn('Failed to get 4D panel width preference:', error);
    return DEFAULT_FOURD_PREFERENCES.panelWidth;
  }
}

/**
 * Set 4D panel width preference
 */
export function setFourDPanelWidth(width: number): void {
  try {
    const clampedWidth = Math.max(260, Math.min(500, width));
    localStorage.setItem(FOURD_STORAGE_KEYS.PANEL_WIDTH, clampedWidth.toString());
  } catch (error) {
    console.warn('Failed to set 4D panel width preference:', error);
  }
}

/**
 * Reset 4D preferences to defaults
 */
export function resetFourDPreferences(): void {
  try {
    localStorage.removeItem(FOURD_STORAGE_KEYS.PANEL_VISIBLE);
    localStorage.removeItem(FOURD_STORAGE_KEYS.PANEL_WIDTH);
  } catch (error) {
    console.warn('Failed to reset 4D preferences:', error);
  }
}

export interface GanttZoomPrefs {
  scale: number;
  timeUnit: 'day' | 'week' | 'month' | 'quarter' | 'year';
  timeScale: 'single' | 'dual';
  centerDate?: string; // ISO date string for zoom center
}

export interface ProjectPrefs {
  gantt: {
    [projectId: string]: GanttZoomPrefs;
  };
}

const DEFAULT_ZOOM_PREFS: GanttZoomPrefs = {
  scale: 1.0,
  timeUnit: 'day',
  timeScale: 'single'
};

/**
 * Get Gantt zoom preferences for a specific project
 */
export const getGanttZoomPrefs = async (projectId: string): Promise<GanttZoomPrefs> => {
  try {
    const prefs = await getStorage('pm.gantt') as ProjectPrefs;
    if (prefs?.gantt?.[projectId]) {
      return { ...DEFAULT_ZOOM_PREFS, ...prefs.gantt[projectId] };
    }
    return { ...DEFAULT_ZOOM_PREFS };
  } catch (error) {
    console.warn('Error loading Gantt zoom preferences:', error);
    return { ...DEFAULT_ZOOM_PREFS };
  }
};

/**
 * Save Gantt zoom preferences for a specific project
 */
export const saveGanttZoomPrefs = async (projectId: string, zoomPrefs: Partial<GanttZoomPrefs>): Promise<void> => {
  try {
    const existingPrefs = await getStorage('pm.gantt') as ProjectPrefs || { gantt: {} };
    
    const updatedPrefs: ProjectPrefs = {
      gantt: {
        ...existingPrefs.gantt,
        [projectId]: {
          ...(existingPrefs.gantt[projectId] || DEFAULT_ZOOM_PREFS),
          ...zoomPrefs
        }
      }
    };
    
    await setStorage('pm.gantt', updatedPrefs);
  } catch (error) {
    console.error('Error saving Gantt zoom preferences:', error);
  }
};

/**
 * Clear Gantt zoom preferences for a specific project
 */
export const clearGanttZoomPrefs = async (projectId: string): Promise<void> => {
  try {
    const existingPrefs = await getStorage('pm.gantt') as ProjectPrefs;
    if (existingPrefs?.gantt?.[projectId]) {
      const { [projectId]: removed, ...remainingPrefs } = existingPrefs.gantt;
      await setStorage('pm.gantt', { gantt: remainingPrefs });
    }
  } catch (error) {
    console.error('Error clearing Gantt zoom preferences:', error);
  }
};

/**
 * Get all project zoom preferences
 */
export const getAllGanttZoomPrefs = async (): Promise<ProjectPrefs> => {
  try {
    return (await getStorage('pm.gantt')) as ProjectPrefs || { gantt: {} };
  } catch (error) {
    console.warn('Error loading all Gantt zoom preferences:', error);
    return { gantt: {} };
  }
};
