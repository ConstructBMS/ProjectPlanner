// Ribbon storage adapter with Supabase + localStorage fallback
import { createClient } from '@supabase/supabase-js';

export type RibbonPrefs = {
  minimised: boolean;
  qatPosition: 'above' | 'below';
  style?: {
    mode: 'light' | 'dark';
    accent: string;
  };
};

// In-memory flag to track if we should always fallback to localStorage
let useLocalStorageFallback = false;
let fallbackLogged = false;

// Default ribbon preferences
const DEFAULT_RIBBON_PREFS: RibbonPrefs = {
  minimised: false,
  qatPosition: 'above',
  style: {
    mode: 'dark',
    accent: 'blue'
  }
};

// Local storage key
const LOCAL_STORAGE_KEY = 'pm.ribbon.prefs';

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
    // Try to query the ribbon_state column to see if it exists
    const { data, error } = await supabase
      .from('user_settings')
      .select('ribbon_state')
      .limit(1);
    
    if (error) {
      // If we get a column error, the column doesn't exist
      if (error.message.includes('ribbon_state') || error.message.includes('column')) {
        return false;
      }
      throw error;
    }
    
    return true;
  } catch (error) {
    console.warn('Database schema check failed:', error);
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

// Get ribbon preferences from localStorage
const getRibbonPrefsFromLocalStorage = (): RibbonPrefs => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') {
        return {
          minimised: parsed.minimised ?? DEFAULT_RIBBON_PREFS.minimised,
          qatPosition: parsed.qatPosition ?? DEFAULT_RIBBON_PREFS.qatPosition,
          style: parsed.style ?? DEFAULT_RIBBON_PREFS.style
        };
      }
    }
  } catch (error) {
    console.warn('Failed to load ribbon prefs from localStorage:', error);
  }
  
  return DEFAULT_RIBBON_PREFS;
};

// Set ribbon preferences in localStorage
const setRibbonPrefsInLocalStorage = (prefs: RibbonPrefs): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.warn('Failed to save ribbon prefs to localStorage:', error);
  }
};

// Get current user ID (if available)
const getCurrentUserId = (): string | undefined => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return undefined;
    }

    // Try to get user from auth session
    const session = supabase.auth.getSession();
    return session?.user?.id;
  } catch (error) {
    console.warn('Failed to get current user ID:', error);
    return undefined;
  }
};

// Main function to get ribbon preferences
export const getRibbonPrefs = async (userId?: string): Promise<RibbonPrefs | null> => {
  // If we're already using localStorage fallback, use it directly
  if (useLocalStorageFallback) {
    return getRibbonPrefsFromLocalStorage();
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return getRibbonPrefsFromLocalStorage();
    }

    // Check if database schema supports ribbon_state
    const schemaOk = await checkDatabaseSchema(supabase);
    if (!schemaOk) {
      useLocalStorageFallback = true;
      return getRibbonPrefsFromLocalStorage();
    }

    // Try to get from Supabase
    const currentUserId = userId || getCurrentUserId();
    const dbPrefs = await getRibbonPrefsFromSupabase(supabase, currentUserId);
    
    if (dbPrefs) {
      return dbPrefs;
    }

    // If no DB prefs found, return localStorage prefs (or defaults)
    return getRibbonPrefsFromLocalStorage();
  } catch (error) {
    useLocalStorageFallback = true;
    return getRibbonPrefsFromLocalStorage();
  }
};

// Main function to set ribbon preferences
export const setRibbonPrefs = async (prefs: RibbonPrefs, userId?: string): Promise<void> => {
  // Always save to localStorage as backup
  setRibbonPrefsInLocalStorage(prefs);

  // If we're already using localStorage fallback, don't try Supabase
  if (useLocalStorageFallback) {
    return;
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return;
    }

    // Check if database schema supports ribbon_state
    const schemaOk = await checkDatabaseSchema(supabase);
    if (!schemaOk) {
      useLocalStorageFallback = true;
      return;
    }

    // Try to save to Supabase
    const currentUserId = userId || getCurrentUserId();
    await setRibbonPrefsInSupabase(supabase, prefs, currentUserId);
  } catch (error) {
    useLocalStorageFallback = true;
  }
};

// Reset fallback flag (useful for testing)
export const resetStorageFallback = (): void => {
  useLocalStorageFallback = false;
  fallbackLogged = false;
};
