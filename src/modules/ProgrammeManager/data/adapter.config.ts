// Adapter configuration for ConstructBMS schema
// Centralized table/column mapping with environment variable overrides

export interface TableConfig {
  name: string;
  id: string;
  [key: string]: string;
}

export interface AdapterConfig {
  projects: TableConfig;
  tasks: TableConfig;
  links: TableConfig;
}

// Default configuration
const defaultConfig: AdapterConfig = {
  projects: {
    name: 'projects',
    id: 'id',
    nameCol: 'name',
    code: 'code',
    start: 'start_date',
    end: 'end_date'
  },
  tasks: {
    name: 'project_tasks',
    id: 'id',
    project: 'project_id',
    nameCol: 'name',
    start: 'start_date',
    end: 'end_date',
    dur: 'duration_days',
    prog: 'progress',
    status: 'status',
    wbs: 'wbs',
    res: 'resource_id'
  },
  links: {
    name: 'task_links',
    id: 'id',
    project: 'project_id',
    pred: 'pred_id',
    succ: 'succ_id',
    type: 'type',
    lag: 'lag_days'
  }
} as const;

// Parse environment variable overrides
const parseEnvOverride = (envValue: string): Partial<TableConfig> => {
  try {
    return JSON.parse(envValue);
  } catch (error) {
    console.warn('Invalid environment variable format for table config:', envValue);
    return {};
  }
};

// Merge configuration with environment overrides
const mergeConfig = (defaultConfig: AdapterConfig): AdapterConfig => {
  const config = { ...defaultConfig };

  // Check for environment overrides
  const envPrefix = 'VITE_PP_TABLES__';
  
  Object.keys(config).forEach(tableKey => {
    const envKey = `${envPrefix}${tableKey.toUpperCase()}`;
    const envValue = import.meta.env[envKey];
    
    if (envValue) {
      const override = parseEnvOverride(envValue);
      config[tableKey as keyof AdapterConfig] = {
        ...config[tableKey as keyof AdapterConfig],
        ...override
      };
      console.log(`Applied environment override for ${tableKey}:`, override);
    }
  });

  return config;
};

// Export the final configuration
export const tables = mergeConfig(defaultConfig);

// Type guards for safe column access
export const hasColumn = (obj: any, column: string): boolean => {
  return obj && typeof obj === 'object' && column in obj;
};

export const getColumnValue = <T>(obj: any, column: string, fallback?: T): T | undefined => {
  return hasColumn(obj, column) ? obj[column] : fallback;
};

// Safe column access with logging
let missingColumnWarnings = new Set<string>();

export const safeGetColumn = (obj: any, tableName: string, column: string, fallback?: any): any => {
  if (!hasColumn(obj, column)) {
    const warningKey = `${tableName}.${column}`;
    if (!missingColumnWarnings.has(warningKey)) {
      console.warn(`Missing column '${column}' in ${tableName} table. Using fallback.`);
      missingColumnWarnings.add(warningKey);
    }
    return fallback;
  }
  return obj[column];
};

// Reset warnings (useful for testing)
export const resetColumnWarnings = (): void => {
  missingColumnWarnings.clear();
};

// Export table names for convenience
export const tableNames = {
  projects: tables.projects.name,
  tasks: tables.tasks.name,
  links: tables.links.name
} as const;

// Export column names for convenience
export const columns = {
  projects: {
    id: tables.projects.id,
    name: tables.projects.nameCol,
    code: tables.projects.code,
    start: tables.projects.start,
    end: tables.projects.end
  },
  tasks: {
    id: tables.tasks.id,
    project: tables.tasks.project,
    name: tables.tasks.nameCol,
    start: tables.tasks.start,
    end: tables.tasks.end,
    duration: tables.tasks.dur,
    progress: tables.tasks.prog,
    status: tables.tasks.status,
    wbs: tables.tasks.wbs,
    resource: tables.tasks.res
  },
  links: {
    id: tables.links.id,
    project: tables.links.project,
    pred: tables.links.pred,
    succ: tables.links.succ,
    type: tables.links.type,
    lag: tables.links.lag
  }
} as const;
