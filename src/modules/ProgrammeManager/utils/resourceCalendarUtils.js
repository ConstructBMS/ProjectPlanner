/**
 * Resource Calendar Utilities
 * Handle per-resource calendar assignments and availability calculations
 */

/**
 * Default resource calendar configuration
 */
export const DEFAULT_RESOURCE_CALENDAR_CONFIG = {
  defaultCalendarId: 'standard',
  fallbackToProjectCalendar: true,
  respectResourceAvailability: true,
  includeOvertime: false,
  maxHoursPerDay: 8,
  maxHoursPerWeek: 40,
};

/**
 * Get resource calendar ID
 * @param {Object} resource - Resource object
 * @param {Object} projectCalendars - Available project calendars
 * @param {Object} config - Configuration
 * @returns {string} Calendar ID
 */
export const getResourceCalendarId = (
  resource,
  projectCalendars,
  config = DEFAULT_RESOURCE_CALENDAR_CONFIG
) => {
  // Check if resource has a specific calendar assigned
  if (resource.calendarId && projectCalendars[resource.calendarId]) {
    return resource.calendarId;
  }

  // Fallback to project default calendar
  if (
    config.fallbackToProjectCalendar &&
    projectCalendars[config.defaultCalendarId]
  ) {
    return config.defaultCalendarId;
  }

  // Return null if no valid calendar found
  return null;
};

/**
 * Get resource calendar object
 * @param {Object} resource - Resource object
 * @param {Object} projectCalendars - Available project calendars
 * @param {Object} config - Configuration
 * @returns {Object|null} Calendar object or null
 */
export const getResourceCalendar = (
  resource,
  projectCalendars,
  config = DEFAULT_RESOURCE_CALENDAR_CONFIG
) => {
  const calendarId = getResourceCalendarId(resource, projectCalendars, config);
  return calendarId ? projectCalendars[calendarId] : null;
};

/**
 * Check if resource is available on a specific date
 * @param {Object} resource - Resource object
 * @param {Date} date - Date to check
 * @param {Object} projectCalendars - Available project calendars
 * @param {Object} config - Configuration
 * @returns {boolean} Whether resource is available
 */
export const isResourceAvailableOnDate = (
  resource,
  date,
  projectCalendars,
  config = DEFAULT_RESOURCE_CALENDAR_CONFIG
) => {
  const calendar = getResourceCalendar(resource, projectCalendars, config);

  if (!calendar) {
    return false; // No calendar means not available
  }

  // Check if date is a working day in the calendar
  const dayOfWeek = date.getDay();
  const dayName = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ][dayOfWeek];

  return calendar.workingDays[dayName] || false;
};

/**
 * Get resource working hours for a specific date
 * @param {Object} resource - Resource object
 * @param {Date} date - Date to check
 * @param {Object} projectCalendars - Available project calendars
 * @param {Object} config - Configuration
 * @returns {Object} Working hours object
 */
export const getResourceWorkingHours = (
  resource,
  date,
  projectCalendars,
  config = DEFAULT_RESOURCE_CALENDAR_CONFIG
) => {
  const calendar = getResourceCalendar(resource, projectCalendars, config);

  if (!calendar) {
    return {
      startTime: null,
      endTime: null,
      totalHours: 0,
      isWorkingDay: false,
    };
  }

  const dayOfWeek = date.getDay();
  const dayName = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ][dayOfWeek];

  const workingDay = calendar.workingDays[dayName];

  if (!workingDay) {
    return {
      startTime: null,
      endTime: null,
      totalHours: 0,
      isWorkingDay: false,
    };
  }

  return {
    startTime: workingDay.startTime,
    endTime: workingDay.endTime,
    totalHours: workingDay.totalHours || 8,
    isWorkingDay: true,
  };
};

/**
 * Calculate resource availability for a date range
 * @param {Object} resource - Resource object
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {Object} projectCalendars - Available project calendars
 * @param {Object} config - Configuration
 * @returns {Object} Availability summary
 */
export const calculateResourceAvailability = (
  resource,
  startDate,
  endDate,
  projectCalendars,
  config = DEFAULT_RESOURCE_CALENDAR_CONFIG
) => {
  const calendar = getResourceCalendar(resource, projectCalendars, config);

  if (!calendar) {
    return {
      totalWorkingDays: 0,
      totalWorkingHours: 0,
      availableDates: [],
      unavailableDates: [],
    };
  }

  const availableDates = [];
  const unavailableDates = [];
  let totalWorkingDays = 0;
  let totalWorkingHours = 0;

  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const workingHours = getResourceWorkingHours(
      resource,
      currentDate,
      projectCalendars,
      config
    );

    if (workingHours.isWorkingDay) {
      availableDates.push(new Date(currentDate));
      totalWorkingDays++;
      totalWorkingHours += workingHours.totalHours;
    } else {
      unavailableDates.push(new Date(currentDate));
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    totalWorkingDays,
    totalWorkingHours,
    availableDates,
    unavailableDates,
  };
};

/**
 * Check resource allocation conflicts
 * @param {Object} resource - Resource object
 * @param {Date} startDate - Task start date
 * @param {Date} endDate - Task end date
 * @param {Array} existingTasks - Existing tasks for the resource
 * @param {Object} projectCalendars - Available project calendars
 * @param {Object} config - Configuration
 * @returns {Object} Conflict analysis
 */
export const checkResourceAllocationConflicts = (
  resource,
  startDate,
  endDate,
  existingTasks,
  projectCalendars,
  config = DEFAULT_RESOURCE_CALENDAR_CONFIG
) => {
  const conflicts = [];
  const calendar = getResourceCalendar(resource, projectCalendars, config);

  if (!calendar) {
    return {
      hasConflicts: true,
      conflicts: [
        { type: 'no_calendar', message: 'Resource has no assigned calendar' },
      ],
      totalConflicts: 1,
    };
  }

  // Check if task dates fall within resource's working days
  const availability = calculateResourceAvailability(
    resource,
    startDate,
    endDate,
    projectCalendars,
    config
  );

  if (availability.totalWorkingDays === 0) {
    conflicts.push({
      type: 'no_working_days',
      message: 'Task dates do not include any working days for this resource',
      dates: availability.unavailableDates,
    });
  }

  // Check for overlapping tasks
  const overlappingTasks = existingTasks.filter(task => {
    if (task.resourceId !== resource.id) return false;

    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);

    return startDate <= taskEnd && endDate >= taskStart;
  });

  if (overlappingTasks.length > 0) {
    conflicts.push({
      type: 'overlapping_tasks',
      message: `Resource has ${overlappingTasks.length} overlapping task(s)`,
      tasks: overlappingTasks,
    });
  }

  // Check for overtime violations
  if (config.respectResourceAvailability) {
    const weeklyAllocation = calculateWeeklyAllocation(
      resource,
      startDate,
      endDate,
      existingTasks,
      projectCalendars,
      config
    );

    if (weeklyAllocation.maxWeeklyHours > config.maxHoursPerWeek) {
      conflicts.push({
        type: 'overtime_violation',
        message: `Weekly allocation (${weeklyAllocation.maxWeeklyHours}h) exceeds limit (${config.maxHoursPerWeek}h)`,
        weeklyHours: weeklyAllocation.maxWeeklyHours,
        limit: config.maxHoursPerWeek,
      });
    }
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
    totalConflicts: conflicts.length,
  };
};

/**
 * Calculate weekly allocation for a resource
 * @param {Object} resource - Resource object
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {Array} existingTasks - Existing tasks
 * @param {Object} projectCalendars - Available project calendars
 * @param {Object} config - Configuration
 * @returns {Object} Weekly allocation summary
 */
export const calculateWeeklyAllocation = (
  resource,
  startDate,
  endDate,
  existingTasks,
  projectCalendars,
  config = DEFAULT_RESOURCE_CALENDAR_CONFIG
) => {
  const weeklyHours = {};
  const calendar = getResourceCalendar(resource, projectCalendars, config);

  if (!calendar) {
    return {
      weeklyHours: {},
      maxWeeklyHours: 0,
      averageWeeklyHours: 0,
    };
  }

  // Initialize weekly hours
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const weekStart = getWeekStart(currentDate);
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyHours[weekKey]) {
      weeklyHours[weekKey] = 0;
    }

    const workingHours = getResourceWorkingHours(
      resource,
      currentDate,
      projectCalendars,
      config
    );
    weeklyHours[weekKey] += workingHours.totalHours;

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Add existing task hours
  existingTasks.forEach(task => {
    if (task.resourceId !== resource.id) return;

    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);

    const taskCurrentDate = new Date(taskStart);
    while (taskCurrentDate <= taskEnd) {
      const weekStart = getWeekStart(taskCurrentDate);
      const weekKey = weekStart.toISOString().split('T')[0];

      if (weeklyHours[weekKey] !== undefined) {
        const workingHours = getResourceWorkingHours(
          resource,
          taskCurrentDate,
          projectCalendars,
          config
        );
        weeklyHours[weekKey] += workingHours.totalHours;
      }

      taskCurrentDate.setDate(taskCurrentDate.getDate() + 1);
    }
  });

  const weeklyHoursArray = Object.values(weeklyHours);
  const maxWeeklyHours = Math.max(...weeklyHoursArray, 0);
  const averageWeeklyHours =
    weeklyHoursArray.length > 0
      ? weeklyHoursArray.reduce((sum, hours) => sum + hours, 0) /
        weeklyHoursArray.length
      : 0;

  return {
    weeklyHours,
    maxWeeklyHours,
    averageWeeklyHours,
  };
};

/**
 * Get week start date (Monday)
 * @param {Date} date - Date to get week start for
 * @returns {Date} Week start date
 */
export const getWeekStart = date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

/**
 * Validate resource calendar assignment
 * @param {Object} resource - Resource object
 * @param {Object} projectCalendars - Available project calendars
 * @returns {Object} Validation result
 */
export const validateResourceCalendar = (resource, projectCalendars) => {
  const errors = [];
  const warnings = [];

  if (resource.calendarId && !projectCalendars[resource.calendarId]) {
    errors.push(
      `Calendar "${resource.calendarId}" not found in project calendars`
    );
  }

  if (!resource.calendarId) {
    warnings.push('No calendar assigned to resource');
  }

  // Check if calendar has valid working days
  if (resource.calendarId && projectCalendars[resource.calendarId]) {
    const calendar = projectCalendars[resource.calendarId];
    const workingDays = Object.values(calendar.workingDays).filter(day => day);

    if (workingDays.length === 0) {
      warnings.push('Assigned calendar has no working days defined');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Get available calendars for resource assignment
 * @param {Object} projectCalendars - Available project calendars
 * @param {Object} config - Configuration
 * @returns {Array} Available calendar options
 */
export const getAvailableCalendars = (
  projectCalendars,
  config = DEFAULT_RESOURCE_CALENDAR_CONFIG
) => {
  const calendars = [];

  Object.entries(projectCalendars).forEach(([id, calendar]) => {
    calendars.push({
      id,
      name: calendar.name,
      description: calendar.description,
      isDefault: id === config.defaultCalendarId,
    });
  });

  return calendars.sort((a, b) => {
    // Put default calendar first
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;

    // Then sort by name
    return a.name.localeCompare(b.name);
  });
};

/**
 * Update resource calendar assignment
 * @param {Object} resource - Resource object
 * @param {string} calendarId - New calendar ID
 * @param {Object} projectCalendars - Available project calendars
 * @returns {Object} Updated resource object
 */
export const updateResourceCalendar = (
  resource,
  calendarId,
  projectCalendars
) => {
  // Validate calendar exists
  if (calendarId && !projectCalendars[calendarId]) {
    throw new Error(`Calendar "${calendarId}" not found`);
  }

  return {
    ...resource,
    calendarId: calendarId || null,
  };
};

/**
 * Get resource calendar summary
 * @param {Object} resource - Resource object
 * @param {Object} projectCalendars - Available project calendars
 * @param {Object} config - Configuration
 * @returns {Object} Calendar summary
 */
export const getResourceCalendarSummary = (
  resource,
  projectCalendars,
  config = DEFAULT_RESOURCE_CALENDAR_CONFIG
) => {
  const calendar = getResourceCalendar(resource, projectCalendars, config);

  if (!calendar) {
    return {
      calendarName: 'No Calendar',
      calendarId: null,
      workingDays: 0,
      totalWeeklyHours: 0,
      status: 'unassigned',
    };
  }

  const workingDays = Object.values(calendar.workingDays).filter(
    day => day
  ).length;
  const totalWeeklyHours = Object.values(calendar.workingDays)
    .filter(day => day)
    .reduce((sum, day) => sum + (day.totalHours || 8), 0);

  return {
    calendarName: calendar.name,
    calendarId: resource.calendarId,
    workingDays,
    totalWeeklyHours,
    status: 'assigned',
  };
};

/**
 * Export resource calendar data
 * @param {Object} resource - Resource object
 * @param {Object} projectCalendars - Available project calendars
 * @returns {Object} Exportable calendar data
 */
export const exportResourceCalendar = (resource, projectCalendars) => {
  const calendar = getResourceCalendar(resource, projectCalendars);

  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    resourceId: resource.id,
    resourceName: resource.name,
    calendarId: resource.calendarId,
    calendarData: calendar
      ? {
          name: calendar.name,
          description: calendar.description,
          workingDays: calendar.workingDays,
        }
      : null,
    metadata: {
      description: 'Resource calendar assignment export',
    },
  };
};

/**
 * Import resource calendar data
 * @param {Object} importData - Import data object
 * @param {Object} projectCalendars - Available project calendars
 * @returns {Object} Import result
 */
export const importResourceCalendar = (importData, projectCalendars) => {
  const errors = [];
  const warnings = [];

  if (!importData.resourceId) {
    errors.push('Missing resource ID in import data');
  }

  if (!importData.calendarId) {
    warnings.push('No calendar ID specified in import data');
  }

  if (importData.calendarId && !projectCalendars[importData.calendarId]) {
    errors.push(`Calendar "${importData.calendarId}" not found in project`);
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    resourceId: importData.resourceId,
    calendarId: importData.calendarId,
  };
};
