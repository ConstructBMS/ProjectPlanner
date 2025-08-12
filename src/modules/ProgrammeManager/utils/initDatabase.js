import { initializeSchemaCheck } from './databaseSchema.js';

// Initialize database schema checks
export const initializeDatabase = async () => {
  try {
    console.info('Initializing database schema checks...');
    await initializeSchemaCheck();
    console.info('Database schema checks completed');
  } catch (error) {
    console.warn('Database schema initialization failed:', error);
  }
};
