import { supabase } from '../../../supabase/client.js';

// Cache for table existence checks
const tableExistenceCache = new Map();
let isInitialized = false;
let initializationPromise = null;

// Check if a table exists in the database
export const checkTableExists = async (tableName) => {
  // Wait for initialization to complete
  if (!isInitialized && initializationPromise) {
    await initializationPromise;
  }

  // Return cached result if available
  if (tableExistenceCache.has(tableName)) {
    return tableExistenceCache.get(tableName);
  }

  // If not initialized, assume table doesn't exist to prevent HTTP requests
  if (!isInitialized) {
    tableExistenceCache.set(tableName, false);
    return false;
  }

  try {
    // Try to query the table with a limit of 0 to just check existence
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(0);
    
    const exists = !error || !error.message.includes('does not exist');
    
    // Cache the result
    tableExistenceCache.set(tableName, exists);
    
    return exists;
  } catch (error) {
    // If there's any error, assume table doesn't exist
    tableExistenceCache.set(tableName, false);
    return false;
  }
};

// Check if a column exists in a table
export const checkColumnExists = async (tableName, columnName) => {
  const cacheKey = `${tableName}.${columnName}`;
  
  // Wait for initialization to complete
  if (!isInitialized && initializationPromise) {
    await initializationPromise;
  }

  // Return cached result if available
  if (tableExistenceCache.has(cacheKey)) {
    return tableExistenceCache.get(cacheKey);
  }

  // If not initialized, assume column doesn't exist to prevent HTTP requests
  if (!isInitialized) {
    tableExistenceCache.set(cacheKey, false);
    return false;
  }

  try {
    // Try to query the specific column
    const { error } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(0);
    
    const exists = !error || !error.message.includes(columnName);
    
    // Cache the result
    tableExistenceCache.set(cacheKey, exists);
    
    return exists;
  } catch (error) {
    // If there's any error, assume column doesn't exist
    tableExistenceCache.set(cacheKey, false);
    return false;
  }
};

// Clear the cache (useful for testing or when schema changes)
export const clearSchemaCache = () => {
  tableExistenceCache.clear();
  isInitialized = false;
  initializationPromise = null;
};

// Pre-check all required tables and columns
export const initializeSchemaCheck = async () => {
  // Prevent multiple simultaneous initializations
  if (initializationPromise) {
    return initializationPromise;
  }

  if (isInitialized) {
    return;
  }

  initializationPromise = (async () => {
    try {
      const requiredTables = ['projects', 'project_tasks', 'project_dependencies', 'user_settings'];
      const requiredColumns = [
        { table: 'user_settings', column: 'ribbon_state' }
      ];

      // Check all tables
      for (const table of requiredTables) {
        await checkTableExists(table);
      }

      // Check all columns
      for (const { table, column } of requiredColumns) {
        await checkColumnExists(table, column);
      }

      isInitialized = true;
    } catch (error) {
      console.warn('Database schema initialization failed:', error);
      isInitialized = true; // Mark as initialized to prevent retries
    }
  })();

  return initializationPromise;
};

// Get cached result without making HTTP request
export const getCachedTableExists = (tableName) => {
  return tableExistenceCache.get(tableName) || false;
};

// Get cached result without making HTTP request
export const getCachedColumnExists = (tableName, columnName) => {
  const cacheKey = `${tableName}.${columnName}`;
  return tableExistenceCache.get(cacheKey) || false;
};
