// Wrapper for persistent storage that uses the same logic as ConstructBMS
// This ensures consistent user ID management and database access

import { supabase } from '../../../supabase/client.js';

// Get current user ID (consistent with ConstructBMS)
const getCurrentUserId = () => {
  // For now, return a valid UUID for the demo user
  // In a real app, this would get the actual user from auth session
  return '550e8400-e29b-41d4-a716-446655440010';
};

// Storage service for persistent database storage
class PersistentStorageService {
  constructor() {
    this.tableName = 'user_preferences';
  }

  // Generic get method
  async getSetting(key, defaultValue = null, category = 'general') {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        return defaultValue;
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .select('value')
        .eq('user_id', userId)
        .eq('key', key)
        .eq('category', category)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found, return default
          return defaultValue;
        }
        throw error;
      }

      return data?.value ? JSON.parse(data.value) : defaultValue;
    } catch (error) {
      console.warn(`Failed to get ${key} from database:`, error);
      return defaultValue;
    }
  }

  // Generic set method
  async setSetting(key, value, category = 'general') {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        return;
      }

      const { error } = await supabase
        .from(this.tableName)
        .upsert({
          user_id: userId,
          key,
          value: JSON.stringify(value),
          category,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,key,category'
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.warn(`Failed to set ${key} in database:`, error);
      throw error;
    }
  }

  // Generic remove method
  async removeSetting(key, category = 'general') {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        return;
      }

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', userId)
        .eq('key', key)
        .eq('category', category);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.warn(`Failed to remove ${key} from database:`, error);
      throw error;
    }
  }

  // Get multiple keys at once
  async getMultipleSettings(keys, category = 'general') {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        return keys.reduce((acc, key) => {
          acc[key] = null;
          return acc;
        }, {});
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .select('key, value')
        .eq('user_id', userId)
        .eq('category', category)
        .in('key', keys);

      if (error) {
        throw error;
      }

      const result = {};
      keys.forEach(key => {
        const item = data.find(d => d.key === key);
        result[key] = item?.value ? JSON.parse(item.value) : null;
      });

      return result;
    } catch (error) {
      console.warn('Failed to get multiple keys from database:', error);
      return keys.reduce((acc, key) => {
        acc[key] = null;
        return acc;
      }, {});
    }
  }

  // Set multiple keys at once
  async setMultipleSettings(keyValuePairs, category = 'general') {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        return;
      }

      const records = Object.entries(keyValuePairs).map(([key, value]) => ({
        user_id: userId,
        key,
        value: JSON.stringify(value),
        category,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from(this.tableName)
        .upsert(records, {
          onConflict: 'user_id,key,category'
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.warn('Failed to set multiple keys in database:', error);
      throw error;
    }
  }
}

// Create singleton instance
const persistentStorage = new PersistentStorageService();

// Export the singleton
export default persistentStorage;

// Re-export convenience functions
export const getStorage = (key, defaultValue = null) => persistentStorage.getSetting(key, defaultValue);
export const setStorage = (key, value) => persistentStorage.setSetting(key, value);
export const removeStorage = (key) => persistentStorage.removeSetting(key);
export const getMultipleStorage = (keys) => persistentStorage.getMultipleSettings(keys);
export const setMultipleStorage = (keyValuePairs) => persistentStorage.setMultipleSettings(keyValuePairs);
