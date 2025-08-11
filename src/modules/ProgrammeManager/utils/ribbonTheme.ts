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

// Load ribbon style from localStorage
export const loadRibbonStyle = (): RibbonStyle => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.mode && parsed.accent) {
        return {
          mode: parsed.mode as RibbonMode,
          accent: parsed.accent as RibbonAccent
        };
      }
    }
  } catch (error) {
    console.warn('Failed to load ribbon style:', error);
  }
  
  return DEFAULT_STYLE;
};

// Save ribbon style to localStorage
export const saveRibbonStyle = (style: RibbonStyle): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(style));
  } catch (error) {
    console.warn('Failed to save ribbon style:', error);
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
