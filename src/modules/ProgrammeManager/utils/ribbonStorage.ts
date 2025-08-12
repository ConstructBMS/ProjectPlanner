// Ribbon storage adapter with persistent database storage
import { createClient } from '@supabase/supabase-js';
import { getCachedColumnExists } from './databaseSchema.js';
import { getStorage, setStorage } from './persistentStorage.js';

export type RibbonPrefs = {
  minimised: boolean;
  qatPosition: 'above' | 'below';
  style?: {
    mode: 'light' | 'dark';
    accent: string;
  };
};

// In-memory flag to track if we should always fallback to persistent storage
let usePersistentStorageFallback = false;

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

// Get Supabase client (if available)
const getSupabaseClient = () => {
  try {
    const url = import.meta?.env?.VITE_SUPABASE_URL;
    const anon = import.meta?.env?.VITE_SUPABASE_ANON_KEY;
    
    if (!url || !anon) {
      return null;
    }
    
    return createClient(url, anon);
  } catch (error) {
    console.warn('Failed to create Supabase client:', error);
    return null;
  }
};

// Check if user_settings table and ribbon_state column exist
const checkDatabaseSchema = async (supabase: any): Promise<boolean> => {
  try {
    // Use cached result directly to avoid any HTTP requests
    return getCachedColumnExists('user_settings', 'ribbon_state');
  } catch (error) {
    return false;
  }
};

// Get ribbon preferences from Supabase
const getRibbonPrefsFromSupabase = async (supabase: any, userId?: string): Promise<RibbonPrefs | null> => {
  try {
    if (!userId) {
      return null;
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('ribbon_state')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found, return null to use defaults
        return null;
      }
      throw error;
    }

    if (data?.ribbon_state) {
      return data.ribbon_state as RibbonPrefs;
    }

    return null;
  } catch (error) {
    console.warn('Failed to get ribbon prefs from Supabase:', error);
    return null;
  }
};

// Set ribbon preferences in Supabase
const setRibbonPrefsInSupabase = async (supabase: any, prefs: RibbonPrefs, userId?: string): Promise<void> => {
  try {
    if (!userId) {
      return;
    }

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ribbon_state: prefs,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.warn('Failed to set ribbon prefs in Supabase:', error);
    throw error;
  }
};

// Get ribbon preferences from persistent storage
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

// Set ribbon preferences in persistent storage
const setRibbonPrefsInStorage = async (prefs: RibbonPrefs): Promise<void> => {
  try {
    await setStorage(STORAGE_KEY, prefs);
  } catch (error) {
    console.warn('Failed to save ribbon prefs to storage:', error);
  }
};

// Get current user ID (if available)
const getCurrentUserId = (): string | undefined => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return undefined;
    }

    // For now, return a mock user ID to avoid HTTP requests
    // In a real app, this would get the actual user from auth session
    return 'mock-user-id';
  } catch (error) {
    console.warn('Failed to get current user ID:', error);
    return undefined;
  }
};

// Main function to get ribbon preferences
export const getRibbonPrefs = async (userId?: string): Promise<RibbonPrefs | null> => {
  // If we're already using persistent storage fallback, use it directly
  if (usePersistentStorageFallback) {
    return await getRibbonPrefsFromStorage();
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return await getRibbonPrefsFromStorage();
    }

    // Check if database schema supports ribbon_state using cached result
    const schemaOk = getCachedColumnExists('user_settings', 'ribbon_state');
    if (!schemaOk) {
      usePersistentStorageFallback = true;
      return await getRibbonPrefsFromStorage();
    }

    // Only try Supabase if schema check passed
    const currentUserId = userId || getCurrentUserId();
    if (currentUserId) {
      const dbPrefs = await getRibbonPrefsFromSupabase(supabase, currentUserId);
      if (dbPrefs) {
        return dbPrefs;
      }
    }

    // If no DB prefs found, return persistent storage prefs (or defaults)
    return await getRibbonPrefsFromStorage();
  } catch (error) {
    usePersistentStorageFallback = true;
    return await getRibbonPrefsFromStorage();
  }
};

// Main function to set ribbon preferences
export const setRibbonPrefs = async (prefs: RibbonPrefs, userId?: string): Promise<void> => {
  // Always save to persistent storage as backup
  await setRibbonPrefsInStorage(prefs);

  // If we're already using persistent storage fallback, don't try Supabase
  if (usePersistentStorageFallback) {
    return;
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return;
    }

    // Check if database schema supports ribbon_state using cached result
    const schemaOk = getCachedColumnExists('user_settings', 'ribbon_state');
    if (!schemaOk) {
      usePersistentStorageFallback = true;
      return;
    }

    // Only try Supabase if schema check passed
    const currentUserId = userId || getCurrentUserId();
    if (currentUserId) {
      await setRibbonPrefsInSupabase(supabase, prefs, currentUserId);
    }
  } catch (error) {
    usePersistentStorageFallback = true;
  }
};

// Reset fallback flag (useful for testing)
export const resetStorageFallback = (): void => {
  usePersistentStorageFallback = false;
};
