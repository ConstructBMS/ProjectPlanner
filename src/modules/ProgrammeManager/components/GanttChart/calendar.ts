// Calendar utilities for working time shading

export interface Holiday {
  date: string; // YYYY-MM-DD format
  name: string;
  type: 'public' | 'company' | 'custom';
}

export interface ProjectCalendar {
  workingDays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  workingHours: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };
  holidays: Array<{
    date: string;
    label: string;
  }>;
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

// Project calendar cache
const projectCalendars = new Map<string, ProjectCalendar>();

// Default calendar
const DEFAULT_CALENDAR: ProjectCalendar = {
  workingDays: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  },
  workingHours: {
    monday: 8,
    tuesday: 8,
    wednesday: 8,
    thursday: 8,
    friday: 8,
    saturday: 0,
    sunday: 0,
  },
  holidays: [],
};

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

/**
 * Set project calendar
 * @param projectId - Project ID
 * @param calendar - Calendar configuration
 */
export function setProjectCalendar(projectId: string, calendar: ProjectCalendar): void {
  projectCalendars.set(projectId, calendar);
  
  // Emit event for Gantt chart updates
  window.dispatchEvent(new CustomEvent('PROJECT_CALENDAR_UPDATED', {
    detail: { projectId, calendar }
  }));
}

/**
 * Get project calendar
 * @param projectId - Project ID
 * @returns Project calendar or default calendar
 */
export function getProjectCalendar(projectId: string): ProjectCalendar {
  return projectCalendars.get(projectId) || DEFAULT_CALENDAR;
}

/**
 * Check if a given date is a working day for a specific project
 * @param date - Date to check
 * @param projectId - Project ID
 * @returns true if the date is a working day
 */
export function isProjectWorkingDay(date: Date, projectId: string): boolean {
  const calendar = getProjectCalendar(projectId);
  const dayOfWeek = date.getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayOfWeek];
  
  // Check if it's a working day
  if (!calendar.workingDays[dayName]) {
    return false;
  }
  
  // Check if it's a holiday
  const dateString = date.toISOString().split('T')[0];
  const isHoliday = calendar.holidays.some(holiday => holiday.date === dateString);
  
  return !isHoliday;
}

/**
 * Get working hours for a specific day and project
 * @param date - Date to check
 * @param projectId - Project ID
 * @returns Working hours for the day
 */
export function getProjectWorkingHours(date: Date, projectId: string): number {
  const calendar = getProjectCalendar(projectId);
  const dayOfWeek = date.getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayOfWeek];
  
  return calendar.workingHours[dayName] || 0;
}

/**
 * Get holidays for a specific project
 * @param projectId - Project ID
 * @param startDate - Start of date range (optional)
 * @param endDate - End of date range (optional)
 * @returns Array of holidays
 */
export function getProjectHolidays(projectId: string, startDate?: Date, endDate?: Date): Array<{date: string, label: string}> {
  const calendar = getProjectCalendar(projectId);
  
  if (!startDate || !endDate) {
    return calendar.holidays;
  }
  
  return calendar.holidays.filter(holiday => {
    const holidayDate = new Date(holiday.date);
    return holidayDate >= startDate && holidayDate <= endDate;
  });
}

/**
 * Initialize calendar system and listen for updates
 */
export function initializeCalendarSystem(): void {
  // Listen for calendar updates from the Working Time dialog
  window.addEventListener('PROJECT_CALENDAR_UPDATED', (event) => {
    const { projectId, calendar } = event.detail;
    setProjectCalendar(projectId, calendar);
    console.log('Calendar updated for project:', projectId, calendar);
  });
}
