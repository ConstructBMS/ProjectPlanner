import { initializeSchemaCheck } from './databaseSchema.js';

// Initialize database schema checks
export const initializeDatabase = async () => {
  try {
    await initializeSchemaCheck();
  } catch (error) {
    console.warn('Database schema initialization failed:', error);
  }
};
