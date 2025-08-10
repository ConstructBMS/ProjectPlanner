// Role-based permissions configuration
// Defines what ribbon buttons and features are available for each user role

// User roles hierarchy (from most to least permissions)
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  PLANNER: 'planner',
  VIEWER: 'viewer',
  GUEST: 'guest',
};

// Default role for new users
export const DEFAULT_ROLE = USER_ROLES.VIEWER;

// Role hierarchy for permission inheritance
export const ROLE_HIERARCHY = {
  [USER_ROLES.ADMIN]: 5,
  [USER_ROLES.MANAGER]: 4,
  [USER_ROLES.PLANNER]: 3,
  [USER_ROLES.VIEWER]: 2,
  [USER_ROLES.GUEST]: 1,
};

// Check if a role has sufficient permissions
export const hasRolePermission = (userRole, requiredRole) => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 999;
  return userLevel >= requiredLevel;
};

// Ribbon tab permissions
export const TAB_PERMISSIONS = {
  Home: {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: true,
    [USER_ROLES.GUEST]: true,
  },
  View: {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: true,
    [USER_ROLES.GUEST]: false,
  },
  Project: {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: false,
    [USER_ROLES.GUEST]: false,
  },
  Allocation: {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: false,
    [USER_ROLES.GUEST]: false,
  },
  '4D': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: false,
    [USER_ROLES.VIEWER]: false,
    [USER_ROLES.GUEST]: false,
  },
  Format: {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: false,
    [USER_ROLES.VIEWER]: false,
    [USER_ROLES.GUEST]: false,
  },
};

// Ribbon button permissions by feature
export const BUTTON_PERMISSIONS = {
  // Home Tab
  'new-task': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: false,
    [USER_ROLES.GUEST]: false,
  },
  'delete-task': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: false,
    [USER_ROLES.VIEWER]: false,
    [USER_ROLES.GUEST]: false,
  },
  'copy-task': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: false,
    [USER_ROLES.GUEST]: false,
  },
  'link-tasks': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: false,
    [USER_ROLES.GUEST]: false,
  },
  'expand-all': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: true,
    [USER_ROLES.GUEST]: true,
  },
  'collapse-all': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: true,
    [USER_ROLES.GUEST]: true,
  },

  // View Tab
  'show-critical-path': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: true,
    [USER_ROLES.GUEST]: false,
  },
  'show-baseline': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: true,
    [USER_ROLES.GUEST]: false,
  },
  'baseline-dropdown': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: true,
    [USER_ROLES.GUEST]: false,
  },
  'time-unit-toggle': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: true,
    [USER_ROLES.GUEST]: false,
  },
  'status-date-picker': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: true,
    [USER_ROLES.GUEST]: false,
  },
  'customize-columns': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: false,
    [USER_ROLES.GUEST]: false,
  },
  'resource-histogram': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: true,
    [USER_ROLES.GUEST]: false,
  },

  // Project Tab
  'project-info': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: false,
    [USER_ROLES.GUEST]: false,
  },
  'project-settings': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: false,
    [USER_ROLES.VIEWER]: false,
    [USER_ROLES.GUEST]: false,
  },
  'baseline-manager': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: false,
    [USER_ROLES.GUEST]: false,
  },
  'project-reports': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: true,
    [USER_ROLES.GUEST]: false,
  },
  'eva-dashboard': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: true,
    [USER_ROLES.GUEST]: false,
  },

  // Allocation Tab
  'analyze-resources': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: false,
    [USER_ROLES.GUEST]: false,
  },
  'level-resources': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: false,
    [USER_ROLES.GUEST]: false,
  },
  'advanced-leveling': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: false,
    [USER_ROLES.VIEWER]: false,
    [USER_ROLES.GUEST]: false,
  },

  // Format Tab
  'bar-styles': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: false,
    [USER_ROLES.VIEWER]: false,
    [USER_ROLES.GUEST]: false,
  },
  'bar-labels': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: false,
    [USER_ROLES.VIEWER]: false,
    [USER_ROLES.GUEST]: false,
  },
  'milestone-shapes': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: false,
    [USER_ROLES.VIEWER]: false,
    [USER_ROLES.GUEST]: false,
  },

  // Global features
  'global-search': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: true,
    [USER_ROLES.GUEST]: false,
  },
  'export-project': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: true,
    [USER_ROLES.GUEST]: false,
  },
  'import-project': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: true,
    [USER_ROLES.PLANNER]: true,
    [USER_ROLES.VIEWER]: false,
    [USER_ROLES.GUEST]: false,
  },
  'admin-settings': {
    [USER_ROLES.ADMIN]: true,
    [USER_ROLES.MANAGER]: false,
    [USER_ROLES.PLANNER]: false,
    [USER_ROLES.VIEWER]: false,
    [USER_ROLES.GUEST]: false,
  },
};

// Check if a user can access a specific tab
export const canAccessTab = (userRole, tabName) => {
  const permissions = TAB_PERMISSIONS[tabName];
  if (!permissions) return false;
  return permissions[userRole] || false;
};

// Check if a user can access a specific button/feature
export const canAccessButton = (userRole, buttonName) => {
  const permissions = BUTTON_PERMISSIONS[buttonName];
  if (!permissions) return true; // Default to allowed if not specified
  return permissions[userRole] || false;
};

// Get available tabs for a user role
export const getAvailableTabs = (userRole) => {
  return Object.keys(TAB_PERMISSIONS).filter(tab => 
    canAccessTab(userRole, tab)
  );
};

// Get available buttons for a user role
export const getAvailableButtons = (userRole) => {
  return Object.keys(BUTTON_PERMISSIONS).filter(button => 
    canAccessButton(userRole, button)
  );
};

// Role descriptions for UI
export const ROLE_DESCRIPTIONS = {
  [USER_ROLES.ADMIN]: {
    name: 'Administrator',
    description: 'Full access to all features and settings',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  [USER_ROLES.MANAGER]: {
    name: 'Project Manager',
    description: 'Can manage projects, tasks, and resources',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  [USER_ROLES.PLANNER]: {
    name: 'Planner',
    description: 'Can create and edit tasks, view reports',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  [USER_ROLES.VIEWER]: {
    name: 'Viewer',
    description: 'Can view projects and basic reports',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  [USER_ROLES.GUEST]: {
    name: 'Guest',
    description: 'Limited view-only access',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
  },
};

// Get role description
export const getRoleDescription = (role) => {
  return ROLE_DESCRIPTIONS[role] || ROLE_DESCRIPTIONS[USER_ROLES.GUEST];
};

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  PROJECT_MANAGEMENT: [
    'new-task',
    'delete-task',
    'copy-task',
    'link-tasks',
    'project-info',
    'project-settings',
    'baseline-manager',
  ],
  RESOURCE_MANAGEMENT: [
    'analyze-resources',
    'level-resources',
    'advanced-leveling',
  ],
  VIEWING: [
    'show-critical-path',
    'show-baseline',
    'baseline-dropdown',
    'time-unit-toggle',
    'status-date-picker',
    'resource-histogram',
    'project-reports',
    'eva-dashboard',
  ],
  FORMATTING: [
    'bar-styles',
    'bar-labels',
    'milestone-shapes',
  ],
  ADMINISTRATION: [
    'admin-settings',
    'import-project',
  ],
};

// Check if user has permission for a group of features
export const hasGroupPermission = (userRole, groupName) => {
  const group = PERMISSION_GROUPS[groupName];
  if (!group) return false;
  
  return group.some(feature => canAccessButton(userRole, feature));
};

// Get all permissions for a user role
export const getUserPermissions = (userRole) => {
  const permissions = {};
  
  // Tab permissions
  Object.keys(TAB_PERMISSIONS).forEach(tab => {
    permissions[`tab_${tab}`] = canAccessTab(userRole, tab);
  });
  
  // Button permissions
  Object.keys(BUTTON_PERMISSIONS).forEach(button => {
    permissions[`button_${button}`] = canAccessButton(userRole, button);
  });
  
  // Group permissions
  Object.keys(PERMISSION_GROUPS).forEach(group => {
    permissions[`group_${group}`] = hasGroupPermission(userRole, group);
  });
  
  return permissions;
};

// Validate user role
export const isValidRole = (role) => {
  return Object.values(USER_ROLES).includes(role);
};

// Get role level for comparison
export const getRoleLevel = (role) => {
  return ROLE_HIERARCHY[role] || 0;
};

// Check if role can manage other roles
export const canManageRole = (userRole, targetRole) => {
  return getRoleLevel(userRole) > getRoleLevel(targetRole);
};
