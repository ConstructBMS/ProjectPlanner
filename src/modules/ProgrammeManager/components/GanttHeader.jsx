import React, { useMemo } from 'react';

const GanttHeader = ({
  startDate,
  endDate,
  zoomScale,
  showWeekends = true,
  viewScale = 'Day',
  scrollLeft = 0,
}) => {
  // Generate month headers (top row)
  const monthHeaders = useMemo(() => {
    const headers = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Group days by month
    const monthGroups = [];
    let currentMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    let currentGroup = {
      month: currentMonth,
      startDate: start,
      days: 0,
    };

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (!showWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
        continue;
      }

      // Check if we've moved to a new month
      if (d.getMonth() !== currentGroup.month.getMonth() || d.getFullYear() !== currentGroup.month.getFullYear()) {
        // Add the previous group if it has days
        if (currentGroup.days > 0) {
          monthGroups.push(currentGroup);
        }
        
        // Start new group
        currentMonth = new Date(d.getFullYear(), d.getMonth(), 1);
        currentGroup = {
          month: currentMonth,
          startDate: new Date(d),
          days: 1,
        };
      } else {
        currentGroup.days++;
      }
    }
    
    // Add the last group
    if (currentGroup.days > 0) {
      monthGroups.push(currentGroup);
    }

    // Generate header elements
    monthGroups.forEach((group, index) => {
      const monthName = group.month.toLocaleDateString('en-US', { month: 'short' });
      const year = group.month.getFullYear();
      const width = group.days * zoomScale;
      
      headers.push(
        <div
          key={`month-${group.month.toISOString()}`}
          className='text-sm font-semibold text-gray-700 py-2 border-r border-gray-300 flex items-center justify-center bg-gray-100'
          style={{ 
            width: `${width}px`,
            minWidth: `${width}px`,
          }}
        >
          {monthName} {year}
        </div>
      );
    });

    return headers;
  }, [startDate, endDate, zoomScale, showWeekends]);

  // Generate day headers (bottom row)
  const dayHeaders = useMemo(() => {
    const headers = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (!showWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
        continue;
      }

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const dayNumber = d.getDate();
      
      headers.push(
        <div
          key={d.toISOString()}
          className={`text-xs py-1 border-r border-gray-200 flex items-center justify-center font-medium ${
            isWeekend ? 'text-gray-400 bg-gray-50' : 'text-gray-600'
          }`}
          style={{ 
            width: `${zoomScale}px`,
            minWidth: `${zoomScale}px`,
          }}
        >
          {dayNumber.toString().padStart(2, '0')}
        </div>
      );
    }

    return headers;
  }, [startDate, endDate, zoomScale, showWeekends]);

  return (
    <div 
      className='sticky top-0 z-50 bg-white border-b border-gray-300 shadow-sm'
      style={{ 
        transform: `translateX(-${scrollLeft}px)`,
        width: 'fit-content',
      }}
    >
      {/* Month Headers Row */}
      <div className='flex border-b border-gray-200'>
        {monthHeaders}
      </div>
      
      {/* Day Headers Row */}
      <div className='flex'>
        {dayHeaders}
      </div>
    </div>
  );
};

export default GanttHeader;
