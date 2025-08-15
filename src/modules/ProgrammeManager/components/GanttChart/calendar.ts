// Holiday set - can be hydrated from DB later
const HOLIDAYS = new Set<string>();

/**
 * Check if a date is a working day (Monday-Friday, excluding holidays)
 */
export function isWorkingDay(d: Date): boolean {
  const dow = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  if (dow === 0 || dow === 6) return false; // Weekend
  return !HOLIDAYS.has(d.toISOString().slice(0, 10)); // Not a holiday
}

/**
 * Add working days to a start date, skipping weekends and holidays
 */
export function addWorkingDays(start: Date, days: number): Date {
  const dir = Math.sign(days) || 1;
  let remain = Math.abs(days);
  let cur = new Date(start);
  
  while (remain > 0) {
    cur.setDate(cur.getDate() + dir);
    if (isWorkingDay(cur)) remain--;
  }
  
  return cur;
}

/**
 * Calculate the number of working days between two dates (exclusive of start)
 */
export function diffWorkingDays(a: Date, b: Date): number {
  let cur = new Date(Math.min(a.getTime(), b.getTime()));
  const end = new Date(Math.max(a.getTime(), b.getTime()));
  let n = 0;
  
  while (cur <= end) {
    if (isWorkingDay(cur)) n++;
    cur.setDate(cur.getDate() + 1);
  }
  
  return n - 1; // Exclusive of start
}

/**
 * Get the next working day from a given date
 */
export function getNextWorkingDay(date: Date): Date {
  let next = new Date(date);
  next.setDate(next.getDate() + 1);
  
  while (!isWorkingDay(next)) {
    next.setDate(next.getDate() + 1);
  }
  
  return next;
}

/**
 * Get the previous working day from a given date
 */
export function getPreviousWorkingDay(date: Date): Date {
  let prev = new Date(date);
  prev.setDate(prev.getDate() - 1);
  
  while (!isWorkingDay(prev)) {
    prev.setDate(prev.getDate() - 1);
  }
  
  return prev;
}

/**
 * Add holidays to the holiday set
 */
export function addHoliday(date: Date | string): void {
  const dateStr = typeof date === 'string' ? date : date.toISOString().slice(0, 10);
  HOLIDAYS.add(dateStr);
}

/**
 * Remove holidays from the holiday set
 */
export function removeHoliday(date: Date | string): void {
  const dateStr = typeof date === 'string' ? date : date.toISOString().slice(0, 10);
  HOLIDAYS.delete(dateStr);
}

/**
 * Get all holidays
 */
export function getHolidays(): Set<string> {
  return new Set(HOLIDAYS);
}

/**
 * Set holidays from a list of date strings
 */
export function setHolidays(holidays: string[]): void {
  HOLIDAYS.clear();
  holidays.forEach(holiday => HOLIDAYS.add(holiday));
}

/**
 * Clear all holidays
 */
export function clearHolidays(): void {
  HOLIDAYS.clear();
}

/**
 * Check if a date is a holiday
 */
export function isHoliday(date: Date | string): boolean {
  const dateStr = typeof date === 'string' ? date : date.toISOString().slice(0, 10);
  return HOLIDAYS.has(dateStr);
}

/**
 * Get working days in a date range
 */
export function getWorkingDaysInRange(start: Date, end: Date): Date[] {
  const workingDays: Date[] = [];
  let current = new Date(start);
  
  while (current <= end) {
    if (isWorkingDay(current)) {
      workingDays.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  
  return workingDays;
}

/**
 * Get non-working days in a date range
 */
export function getNonWorkingDaysInRange(start: Date, end: Date): Date[] {
  const nonWorkingDays: Date[] = [];
  let current = new Date(start);
  
  while (current <= end) {
    if (!isWorkingDay(current)) {
      nonWorkingDays.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  
  return nonWorkingDays;
}
