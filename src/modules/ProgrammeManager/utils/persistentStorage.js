import { supabase } from '../../../supabase/client.js';

// Storage service for persistent database storage
class PersistentStorageService {
  constructor() {
    this.tableName = 'user_preferences';
    this.userId = 'mock-user-id'; // In real app, get from auth
  }

  // Generic get method
  async get(key, defaultValue = null) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('value')
        .eq('user_id', this.userId)
        .eq('key', key)
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
  async set(key, value) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .upsert({
          user_id: this.userId,
          key: key,
          value: JSON.stringify(value),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,key'
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
  async remove(key) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', this.userId)
        .eq('key', key);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.warn(`Failed to remove ${key} from database:`, error);
      throw error;
    }
  }

  // Get multiple keys at once
  async getMultiple(keys) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('key, value')
        .eq('user_id', this.userId)
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
  async setMultiple(keyValuePairs) {
    try {
      const records = Object.entries(keyValuePairs).map(([key, value]) => ({
        user_id: this.userId,
        key: key,
        value: JSON.stringify(value),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from(this.tableName)
        .upsert(records, {
          onConflict: 'user_id,key'
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

// Convenience functions for common storage operations
export const getStorage = (key, defaultValue = null) => persistentStorage.get(key, defaultValue);
export const setStorage = (key, value) => persistentStorage.set(key, value);
export const removeStorage = (key) => persistentStorage.remove(key);
export const getMultipleStorage = (keys) => persistentStorage.getMultiple(keys);
export const setMultipleStorage = (keyValuePairs) => persistentStorage.setMultiple(keyValuePairs);
