// Ribbon storage adapter using the main ConstructBMS persistent storage service
import { getStorage, setStorage } from './persistentStorage.js';

export type RibbonPrefs = {
  minimised: boolean;
  qatPosition: 'above' | 'below';
  style?: {
    mode: 'light' | 'dark';
    accent: string;
  };
};

// Default ribbon preferences
const DEFAULT_RIBBON_PREFS: RibbonPrefs = {
  minimised: false,
  qatPosition: 'above',
  style: {
    mode: 'dark',
    accent: 'blue'
  }
};

// Storage key
const STORAGE_KEY = 'pm.ribbon.prefs';

// Get ribbon preferences from storage
const getRibbonPrefsFromStorage = async (): Promise<RibbonPrefs> => {
  try {
    const stored = await getStorage(STORAGE_KEY);
    if (stored && typeof stored === 'object') {
      return {
        minimised: stored.minimised ?? DEFAULT_RIBBON_PREFS.minimised,
        qatPosition: stored.qatPosition ?? DEFAULT_RIBBON_PREFS.qatPosition,
        style: stored.style ?? DEFAULT_RIBBON_PREFS.style
      };
    }
  } catch (error) {
    console.warn('Failed to load ribbon prefs from storage:', error);
  }
  
  return DEFAULT_RIBBON_PREFS;
};

// Set ribbon preferences in storage
const setRibbonPrefsInStorage = async (prefs: RibbonPrefs): Promise<void> => {
  try {
    await setStorage(STORAGE_KEY, prefs);
  } catch (error) {
    console.warn('Failed to save ribbon prefs to storage:', error);
  }
};

// Main function to get ribbon preferences
export const getRibbonPrefs = async (): Promise<RibbonPrefs> => {
  return await getRibbonPrefsFromStorage();
};

// Main function to set ribbon preferences
export const setRibbonPrefs = async (prefs: RibbonPrefs): Promise<void> => {
  await setRibbonPrefsInStorage(prefs);
};
