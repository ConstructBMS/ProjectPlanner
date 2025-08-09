import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { DEFAULT_CALENDAR, validateCalendar } from '../utils/calendarUtils';

const CalendarContext = createContext();

export const useCalendarContext = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendarContext must be used within a CalendarProvider');
  }
  return context;
};

export const CalendarProvider = ({ children }) => {
  const [globalCalendar, setGlobalCalendar] = useState(DEFAULT_CALENDAR);
  const [taskCalendars, setTaskCalendars] = useState({});

  // Load calendars from localStorage on mount
  useEffect(() => {
    try {
      const savedGlobal = localStorage.getItem('gantt.globalCalendar');
      if (savedGlobal) {
        const parsed = JSON.parse(savedGlobal);
        if (validateCalendar(parsed).isValid) {
          setGlobalCalendar(parsed);
        }
      }

      const savedTaskCalendars = localStorage.getItem('gantt.taskCalendars');
      if (savedTaskCalendars) {
        const parsed = JSON.parse(savedTaskCalendars);
        setTaskCalendars(parsed);
      }
    } catch (error) {
      console.error('Error loading calendars from localStorage:', error);
    }
  }, []);

  // Save calendars to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('gantt.globalCalendar', JSON.stringify(globalCalendar));
    } catch (error) {
      console.error('Error saving global calendar to localStorage:', error);
    }
  }, [globalCalendar]);

  useEffect(() => {
    try {
      localStorage.setItem('gantt.taskCalendars', JSON.stringify(taskCalendars));
    } catch (error) {
      console.error('Error saving task calendars to localStorage:', error);
    }
  }, [taskCalendars]);

  // Update global calendar
  const updateGlobalCalendar = useCallback((updates) => {
    setGlobalCalendar(prev => {
      const updated = { ...prev, ...updates };
      const validation = validateCalendar(updated);
      if (!validation.isValid) {
        console.error('Invalid calendar configuration:', validation.errors);
        return prev;
      }
      return updated;
    });
  }, []);

  // Update working days
  const updateWorkingDays = useCallback((workingDays) => {
    updateGlobalCalendar({ workingDays });
  }, [updateGlobalCalendar]);

  // Add holiday
  const addHoliday = useCallback((dateString) => {
    setGlobalCalendar(prev => {
      if (!prev.holidays.includes(dateString)) {
        return {
          ...prev,
          holidays: [...prev.holidays, dateString].sort()
        };
      }
      return prev;
    });
  }, []);

  // Remove holiday
  const removeHoliday = useCallback((dateString) => {
    setGlobalCalendar(prev => ({
      ...prev,
      holidays: prev.holidays.filter(h => h !== dateString)
    }));
  }, []);

  // Get calendar for a specific task
  const getCalendarForTask = useCallback((taskId, task) => {
    if (task && task.useTaskCalendar && taskCalendars[taskId]) {
      return taskCalendars[taskId];
    }
    return globalCalendar;
  }, [globalCalendar, taskCalendars]);

  // Set task calendar
  const setTaskCalendar = useCallback((taskId, calendar) => {
    const validation = validateCalendar(calendar);
    if (!validation.isValid) {
      console.error('Invalid task calendar configuration:', validation.errors);
      return;
    }

    setTaskCalendars(prev => ({
      ...prev,
      [taskId]: calendar
    }));
  }, []);

  // Remove task calendar
  const removeTaskCalendar = useCallback((taskId) => {
    setTaskCalendars(prev => {
      const updated = { ...prev };
      delete updated[taskId];
      return updated;
    });
  }, []);

  // Reset global calendar to defaults
  const resetGlobalCalendar = useCallback(() => {
    setGlobalCalendar(DEFAULT_CALENDAR);
  }, []);

  // Get all task calendars
  const getAllTaskCalendars = useCallback(() => {
    return taskCalendars;
  }, [taskCalendars]);

  // Check if a task has a custom calendar
  const hasTaskCalendar = useCallback((taskId) => {
    return !!taskCalendars[taskId];
  }, [taskCalendars]);

  const value = {
    // State
    globalCalendar,
    taskCalendars,
    
    // Global calendar operations
    updateGlobalCalendar,
    updateWorkingDays,
    addHoliday,
    removeHoliday,
    resetGlobalCalendar,
    
    // Task calendar operations
    getCalendarForTask,
    setTaskCalendar,
    removeTaskCalendar,
    getAllTaskCalendars,
    hasTaskCalendar,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};
