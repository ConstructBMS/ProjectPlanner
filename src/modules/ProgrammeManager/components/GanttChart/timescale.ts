export interface TimescaleConfig {
  minDate: Date;
  maxDate: Date;
  pxPerDay: number;
  viewportWidth: number;
  scrollLeft: number;
}

export interface DatePosition {
  date: Date;
  x: number;
}

/**
 * Calculate the date at a specific pixel position
 */
export function getDateAtPixel(
  pixelX: number, 
  config: TimescaleConfig
): Date {
  const daysFromStart = (pixelX + config.scrollLeft) / config.pxPerDay;
  const date = new Date(config.minDate);
  date.setDate(date.getDate() + daysFromStart);
  return date;
}

/**
 * Calculate the pixel position for a specific date
 */
export function getPixelAtDate(
  date: Date, 
  config: TimescaleConfig
): number {
  const daysDiff = (date.getTime() - config.minDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff * config.pxPerDay - config.scrollLeft;
}

/**
 * Check if a date is within the visible range
 */
export function isDateInRange(
  date: Date, 
  config: TimescaleConfig
): boolean {
  return date >= config.minDate && date <= config.maxDate;
}

/**
 * Calculate zoom parameters to keep a specific date under cursor
 */
export function calculateZoomAtCursor(
  cursorX: number,
  targetDate: Date,
  newPxPerDay: number,
  config: TimescaleConfig
): { newScrollLeft: number; newPxPerDay: number } {
  // Calculate the date under cursor before zoom
  const dateAtCursor = getDateAtPixel(cursorX, config);
  
  // Calculate new scroll position to keep the same date under cursor
  const daysFromStart = (targetDate.getTime() - config.minDate.getTime()) / (1000 * 60 * 60 * 24);
  const newScrollLeft = daysFromStart * newPxPerDay - cursorX;
  
  return {
    newScrollLeft: Math.max(0, newScrollLeft),
    newPxPerDay: newPxPerDay
  };
}

/**
 * Calculate fit parameters for all tasks
 */
export function calculateFitProject(
  tasks: any[],
  viewportWidth: number,
  paddingDays: number = 30
): { minDate: Date; maxDate: Date; pxPerDay: number } {
  if (!tasks || tasks.length === 0) {
    const today = new Date();
    return {
      minDate: new Date(today.getTime() - paddingDays * 24 * 60 * 60 * 1000),
      maxDate: new Date(today.getTime() + paddingDays * 24 * 60 * 60 * 1000),
      pxPerDay: 20
    };
  }

  // Find min and max dates from tasks
  let minDate = new Date(tasks[0]?.start_date || Date.now());
  let maxDate = new Date(tasks[0]?.end_date || Date.now());

  tasks.forEach(task => {
    if (task.start_date) {
      const startDate = new Date(task.start_date);
      if (startDate < minDate) minDate = startDate;
    }
    if (task.end_date) {
      const endDate = new Date(task.end_date);
      if (endDate > maxDate) maxDate = endDate;
    }
  });

  // Add padding
  minDate.setDate(minDate.getDate() - paddingDays);
  maxDate.setDate(maxDate.getDate() + paddingDays);

  // Calculate pxPerDay to fit in viewport
  const totalDays = (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
  const pxPerDay = Math.max(5, Math.min(100, (viewportWidth - 200) / totalDays));

  return { minDate, maxDate, pxPerDay };
}

/**
 * Calculate fit parameters for selected tasks
 */
export function calculateFitSelection(
  selectedTasks: any[],
  viewportWidth: number,
  paddingDays: number = 15
): { minDate: Date; maxDate: Date; pxPerDay: number } {
  return calculateFitProject(selectedTasks, viewportWidth, paddingDays);
}

/**
 * Get today's date for today line rendering
 */
export function getTodayDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
