export const formatDate = date =>
  new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const calculateDuration = (start, end) =>
  Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const calculateWorkingDays = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  // Set both dates to start of day for accurate calculation
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  let workingDays = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
};

/**
 * Snap a date to the nearest weekday (Monday-Friday)
 * @param {Date} date - The date to snap
 * @returns {Date} - The snapped date (weekday only)
 */
export const snapToWeekday = date => {
  const result = new Date(date);
  const dayOfWeek = result.getDay();

  // If it's Saturday (6), move to Friday (5)
  if (dayOfWeek === 6) {
    result.setDate(result.getDate() - 1);
  }
  // If it's Sunday (0), move to Monday (1)
  else if (dayOfWeek === 0) {
    result.setDate(result.getDate() + 1);
  }

  return result;
};

/**
 * Add working days to a date, skipping weekends
 * @param {Date} date - The starting date
 * @param {number} workingDays - Number of working days to add
 * @returns {Date} - The resulting date
 */
export const addWorkingDays = (date, workingDays) => {
  const result = new Date(date);
  let daysAdded = 0;
  let currentDay = 0;

  while (daysAdded < workingDays) {
    result.setDate(result.getDate() + 1);
    currentDay = result.getDay();

    // Only count weekdays (Monday = 1, Tuesday = 2, ..., Friday = 5)
    if (currentDay !== 0 && currentDay !== 6) {
      daysAdded++;
    }
  }

  return result;
};

/**
 * Calculate the number of working days between two dates
 * @param {Date} startDate - The start date
 * @param {Date} endDate - The end date
 * @returns {number} - Number of working days
 */
export const getWorkingDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Set both dates to start of day
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  let workingDays = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return workingDays;
};

/**
 * Get the ISO week number for a given date
 * @param {Date} date - The date to get the week number for
 * @returns {number} - The ISO week number (1-53)
 */
export const getWeek = date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  // January 4 is always in week 1
  const week1 = new Date(d.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1
  const week =
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    );
  return week;
};
