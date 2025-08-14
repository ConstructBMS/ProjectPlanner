import { Task, TaskLink } from '../../data/types';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface BarPosition {
  taskId: string;
  x: number;
  width: number;
  start: Date;
  end: Date;
}

export interface LinkPosition {
  fromTaskId: string;
  toTaskId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export interface GanttScale {
  pixelsPerDay: number;
  startDate: Date;
  endDate: Date;
  containerWidth: number;
  containerHeight: number;
  rowHeight: number;
}

// Convert task to date range
export const toDateRange = (task: Task): DateRange | null => {
  if (!task.start_date) {
    return null;
  }

  const start = new Date(task.start_date);
  let end: Date;

  if (task.end_date) {
    end = new Date(task.end_date);
  } else if (task.duration_days) {
    end = new Date(start);
    end.setDate(start.getDate() + task.duration_days);
  } else {
    // Default to 1 day if no duration specified
    end = new Date(start);
    end.setDate(start.getDate() + 1);
  }

  return { start, end };
};

// Calculate bar positions for all tasks
export const layoutBars = (tasks: Task[], scale: GanttScale): BarPosition[] => {
  const bars: BarPosition[] = [];
  
  tasks.forEach((task, index) => {
    const dateRange = toDateRange(task);
    if (!dateRange) return;

    // Calculate X position based on start date
    const daysFromStart = Math.floor((dateRange.start.getTime() - scale.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const x = daysFromStart * scale.pixelsPerDay;

    // Calculate width based on duration
    const durationDays = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const width = Math.max(durationDays * scale.pixelsPerDay, 4); // Minimum 4px width

    bars.push({
      taskId: task.id,
      x,
      width,
      start: dateRange.start,
      end: dateRange.end
    });
  });

  return bars;
};

// Calculate link positions for FS dependencies
export const layoutLinks = (links: TaskLink[], bars: BarPosition[], scale: GanttScale): LinkPosition[] => {
  const linkPositions: LinkPosition[] = [];
  
  links.forEach(link => {
    // Only handle FS (finish-to-start) links for now
    if (link.type !== 'finish-to-start') return;

    const fromBar = bars.find(bar => bar.taskId === link.pred_id);
    const toBar = bars.find(bar => bar.taskId === link.succ_id);
    
    if (!fromBar || !toBar) return;

    // Calculate positions
    const fromX = fromBar.x + fromBar.width; // End of predecessor
    const fromY = scale.rowHeight / 2; // Middle of row
    const toX = toBar.x; // Start of successor
    const toY = scale.rowHeight / 2; // Middle of row

    linkPositions.push({
      fromTaskId: link.pred_id,
      toTaskId: link.succ_id,
      fromX,
      fromY,
      toX,
      toY
    });
  });

  return linkPositions;
};

// Calculate timescale based on task date ranges
export const calculateTimescale = (tasks: Task[], containerWidth: number): GanttScale => {
  if (tasks.length === 0) {
    const today = new Date();
    return {
      pixelsPerDay: 20,
      startDate: today,
      endDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
      containerWidth,
      containerHeight: 400,
      rowHeight: 40
    };
  }

  // Find min and max dates
  let minDate = new Date();
  let maxDate = new Date();
  let hasValidDates = false;

  tasks.forEach(task => {
    const dateRange = toDateRange(task);
    if (dateRange) {
      if (!hasValidDates) {
        minDate = dateRange.start;
        maxDate = dateRange.end;
        hasValidDates = true;
      } else {
        if (dateRange.start < minDate) minDate = dateRange.start;
        if (dateRange.end > maxDate) maxDate = dateRange.end;
      }
    }
  });

  // Add padding
  const paddingDays = 7;
  minDate.setDate(minDate.getDate() - paddingDays);
  maxDate.setDate(maxDate.getDate() + paddingDays);

  // Calculate pixels per day
  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  const pixelsPerDay = Math.max(containerWidth / totalDays, 10); // Minimum 10px per day

  return {
    pixelsPerDay,
    startDate: minDate,
    endDate: maxDate,
    containerWidth,
    containerHeight: tasks.length * 40 + 100, // 40px per row + header
    rowHeight: 40
  };
};

// Check if a date is a working day (Monday-Friday)
export const isWorkingDay = (date: Date): boolean => {
  const day = date.getDay();
  return day >= 1 && day <= 5; // Monday = 1, Friday = 5
};

// Get working day shading positions
export const getWorkingDayShading = (scale: GanttScale): { x: number; width: number }[] => {
  const shading: { x: number; width: number }[] = [];
  const currentDate = new Date(scale.startDate);
  
  while (currentDate <= scale.endDate) {
    if (!isWorkingDay(currentDate)) {
      // Weekend shading
      const daysFromStart = Math.floor((currentDate.getTime() - scale.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const x = daysFromStart * scale.pixelsPerDay;
      const width = scale.pixelsPerDay;
      
      shading.push({ x, width });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return shading;
};

// Format date for display
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Get today's position
export const getTodayPosition = (scale: GanttScale): number | null => {
  const today = new Date();
  if (today < scale.startDate || today > scale.endDate) {
    return null;
  }
  
  const daysFromStart = Math.floor((today.getTime() - scale.startDate.getTime()) / (1000 * 60 * 60 * 24));
  return daysFromStart * scale.pixelsPerDay;
};
