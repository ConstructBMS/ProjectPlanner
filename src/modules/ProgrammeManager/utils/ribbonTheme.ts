import { getStorage, setStorage } from './persistentStorage.js';

// Ribbon theme utility for managing style preferences

export type RibbonMode = 'light' | 'dark';
export type RibbonAccent = 'blue' | 'cyan' | 'teal' | 'green' | 'orange' | 'magenta';

export interface RibbonStyle {
  mode: RibbonMode;
  accent: RibbonAccent;
}

const STORAGE_KEY = 'pm.ribbon.style';
const DEFAULT_STYLE: RibbonStyle = {
  mode: 'dark',
  accent: 'blue'
};

// Load ribbon style from persistent storage
export const loadRibbonStyle = async (): Promise<RibbonStyle> => {
  try {
    const stored = await getStorage(STORAGE_KEY);
    if (stored && stored.mode && stored.accent) {
      return {
        mode: stored.mode as RibbonMode,
        accent: stored.accent as RibbonAccent
      };
    }
  } catch (error) {
    console.warn('Failed to load ribbon style from storage:', error);
  }
  
  return DEFAULT_STYLE;
};

// Save ribbon style to persistent storage
export const saveRibbonStyle = async (style: RibbonStyle): Promise<void> => {
  try {
    await setStorage(STORAGE_KEY, style);
  } catch (error) {
    console.warn('Failed to save ribbon style to storage:', error);
  }
};

// Update ribbon style
export const updateRibbonStyle = (updates: Partial<RibbonStyle>): RibbonStyle => {
  const current = loadRibbonStyle();
  const updated = { ...current, ...updates };
  saveRibbonStyle(updated);
  return updated;
};

// Get current ribbon style
export const getRibbonStyle = (): RibbonStyle => {
  return loadRibbonStyle();
};

// Reset to default style
export const resetRibbonStyle = (): RibbonStyle => {
  saveRibbonStyle(DEFAULT_STYLE);
  return DEFAULT_STYLE;
};

// Validate ribbon style
export const isValidRibbonStyle = (style: any): style is RibbonStyle => {
  return (
    style &&
    typeof style.mode === 'string' &&
    ['light', 'dark'].includes(style.mode) &&
    typeof style.accent === 'string' &&
    ['blue', 'cyan', 'teal', 'green', 'orange', 'magenta'].includes(style.accent)
  );
};
