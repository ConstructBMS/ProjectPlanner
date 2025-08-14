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
  const prefs = loadPreferences();
  return prefs.layoutRatios[route] || null;
};

// Save layout ratios for a specific route
export const saveLayoutRatios = (route: string, ratios: number[]): void => {
  const prefs = loadPreferences();
  prefs.layoutRatios[route] = ratios;
  savePreferences(prefs);
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
