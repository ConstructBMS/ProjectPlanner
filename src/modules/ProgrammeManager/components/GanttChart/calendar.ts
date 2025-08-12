// Calendar utilities for working time shading

export interface Holiday {
  date: string; // YYYY-MM-DD format
  name: string;
  type: 'public' | 'company' | 'custom';
}

// Default working days: Monday to Friday
const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5]; // Monday = 1, Sunday = 0

// Sample holidays (can be extended with real data)
const SAMPLE_HOLIDAYS: Holiday[] = [
  { date: '2024-01-01', name: 'New Year\'s Day', type: 'public' },
  { date: '2024-12-25', name: 'Christmas Day', type: 'public' },
  { date: '2024-12-26', name: 'Boxing Day', type: 'public' },
  // Add more holidays as needed
];

/**
 * Check if a given date is a working day
 * @param date - Date to check
 * @returns true if the date is a working day (Monday-Friday and not a holiday)
 */
export function isWorkingDay(date: Date): boolean {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Check if it's a weekend
  if (!DEFAULT_WORKING_DAYS.includes(dayOfWeek)) {
    return false;
  }
  
  // Check if it's a holiday
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
  const isHoliday = SAMPLE_HOLIDAYS.some(holiday => holiday.date === dateString);
  
  return !isHoliday;
}

/**
 * Get all holidays for a given date range
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @returns Array of holidays in the range
 */
export function getHolidays(startDate?: Date, endDate?: Date): Holiday[] {
  if (!startDate || !endDate) {
    return SAMPLE_HOLIDAYS;
  }
  
  return SAMPLE_HOLIDAYS.filter(holiday => {
    const holidayDate = new Date(holiday.date);
    return holidayDate >= startDate && holidayDate <= endDate;
  });
}

/**
 * Get the next working day from a given date
 * @param date - Starting date
 * @returns Next working day
 */
export function getNextWorkingDay(date: Date): Date {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  
  while (!isWorkingDay(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  
  return nextDay;
}

/**
 * Get the previous working day from a given date
 * @param date - Starting date
 * @returns Previous working day
 */
export function getPreviousWorkingDay(date: Date): Date {
  const prevDay = new Date(date);
  prevDay.setDate(prevDay.getDate() - 1);
  
  while (!isWorkingDay(prevDay)) {
    prevDay.setDate(prevDay.getDate() - 1);
  }
  
  return prevDay;
}

/**
 * Calculate working days between two dates (inclusive)
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of working days
 */
export function getWorkingDaysBetween(startDate: Date, endDate: Date): number {
  let workingDays = 0;
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    if (isWorkingDay(currentDate)) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
}
