// Preferences utility for managing user settings
export interface LayoutRatios {
  [key: string]: number[];
}

export interface UserPreferences {
  layoutRatios: LayoutRatios;
  ribbonMinimised: boolean;
  qatPosition: 'above' | 'below';
}

const STORAGE_KEY = 'pm.preferences';

// Load preferences from localStorage
export const loadPreferences = (): UserPreferences => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load preferences:', error);
  }
  
  return {
    layoutRatios: {},
    ribbonMinimised: false,
    qatPosition: 'above'
  };
};

// Save preferences to localStorage
export const savePreferences = (prefs: Partial<UserPreferences>): void => {
  try {
    const current = loadPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
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
