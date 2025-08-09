import { useState, useMemo } from 'react';
import { useTaskContext } from '../context/TaskContext';
import {
  CalendarDaysIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const ResourceCalendar = () => {
  const { tasks } = useTaskContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedResource, setSelectedResource] = useState('all');

  // Extract unique resources from tasks
  const resources = useMemo(() => {
    const resourceSet = new Set();
    tasks.forEach(task => {
      if (task.assignee) {
        resourceSet.add(task.assignee);
      }
    });
    return Array.from(resourceSet).sort();
  }, [tasks]);

  // Get tasks for selected resource and current month
  const resourceTasks = useMemo(() => {
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    return tasks.filter(task => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);

      // Check if task overlaps with current month
      const overlaps = taskStart <= endOfMonth && taskEnd >= startOfMonth;

      // Check resource filter
      const matchesResource =
        selectedResource === 'all' || task.assignee === selectedResource;

      return overlaps && matchesResource && task.assignee;
    });
  }, [tasks, currentDate, selectedResource]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const startOfCalendar = new Date(startOfMonth);
    startOfCalendar.setDate(
      startOfCalendar.getDate() - startOfCalendar.getDay()
    );

    const days = [];
    const currentDay = new Date(startOfCalendar);

    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dayTasks = resourceTasks.filter(task => {
        const taskStart = new Date(task.startDate);
        const taskEnd = new Date(task.endDate);
        return currentDay >= taskStart && currentDay <= taskEnd;
      });

      days.push({
        date: new Date(currentDay),
        isCurrentMonth: currentDay.getMonth() === currentDate.getMonth(),
        isToday: currentDay.toDateString() === new Date().toDateString(),
        tasks: dayTasks,
        workload: dayTasks.length,
      });

      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  }, [currentDate, resourceTasks]);

  const navigateMonth = direction => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getWorkloadColor = workload => {
    if (workload === 0) return 'bg-gray-100';
    if (workload === 1) return 'bg-green-100';
    if (workload === 2) return 'bg-yellow-100';
    if (workload >= 3) return 'bg-red-100';
    return 'bg-gray-100';
  };

  return (
    <div className='bg-white border border-gray-200 rounded-lg p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <CalendarDaysIcon className='w-6 h-6 text-blue-600' />
          <h2 className='text-lg font-semibold text-gray-900'>
            Resource Calendar
          </h2>
        </div>

        <div className='flex items-center gap-4'>
          {/* Resource Filter */}
          <select
            value={selectedResource}
            onChange={e => setSelectedResource(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          >
            <option value='all'>All Resources</option>
            {resources.map(resource => (
              <option key={resource} value={resource}>
                {resource}
              </option>
            ))}
          </select>

          {/* Month Navigation */}
          <div className='flex items-center gap-2'>
            <button
              onClick={() => navigateMonth(-1)}
              className='p-2 hover:bg-gray-100 rounded-full transition-colors'
            >
              <ChevronLeftIcon className='w-5 h-5 text-gray-600' />
            </button>

            <div className='text-lg font-semibold text-gray-900 min-w-[140px] text-center'>
              {currentDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </div>

            <button
              onClick={() => navigateMonth(1)}
              className='p-2 hover:bg-gray-100 rounded-full transition-colors'
            >
              <ChevronRightIcon className='w-5 h-5 text-gray-600' />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className='grid grid-cols-7 gap-1'>
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            className='p-3 text-center text-sm font-medium text-gray-500 border-b border-gray-200'
          >
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map(day => (
          <div
            key={`day-${day.date.toISOString()}`}
            className={`
              min-h-[80px] p-2 border border-gray-100 ${getWorkloadColor(day.workload)}
              ${day.isCurrentMonth ? '' : 'opacity-50'}
              ${day.isToday ? 'ring-2 ring-blue-500' : ''}
            `}
          >
            <div className='flex items-center justify-between mb-1'>
              <span
                className={`text-sm ${day.isToday ? 'font-bold text-blue-600' : 'text-gray-700'}`}
              >
                {day.date.getDate()}
              </span>
              {day.workload > 0 && (
                <span className='text-xs bg-white px-1 rounded'>
                  {day.workload}
                </span>
              )}
            </div>

            {/* Task indicators */}
            <div className='space-y-1'>
              {day.tasks.slice(0, 2).map(task => (
                <div
                  key={task.id}
                  className='text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate'
                  title={`${task.name} - ${task.assignee}`}
                >
                  {task.name}
                </div>
              ))}
              {day.tasks.length > 2 && (
                <div className='text-xs text-gray-500'>
                  +{day.tasks.length - 2} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className='mt-6 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <ClockIcon className='w-4 h-4 text-gray-500' />
            <span className='text-sm text-gray-600'>Workload:</span>
          </div>
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-1'>
              <div className='w-4 h-4 bg-gray-100 border border-gray-300 rounded' />
              <span className='text-xs text-gray-600'>Available</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='w-4 h-4 bg-green-100 border border-gray-300 rounded' />
              <span className='text-xs text-gray-600'>Light</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='w-4 h-4 bg-yellow-100 border border-gray-300 rounded' />
              <span className='text-xs text-gray-600'>Moderate</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='w-4 h-4 bg-red-100 border border-gray-300 rounded' />
              <span className='text-xs text-gray-600'>Heavy</span>
            </div>
          </div>
        </div>

        <div className='text-sm text-gray-500'>
          Showing {resourceTasks.length} tasks for{' '}
          {selectedResource === 'all' ? 'all resources' : selectedResource}
        </div>
      </div>
    </div>
  );
};

export default ResourceCalendar;
