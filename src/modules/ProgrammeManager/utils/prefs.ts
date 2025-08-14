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
