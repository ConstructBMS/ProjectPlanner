import React, { useMemo } from 'react';

const getWeekNumber = date => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

const GanttHeader = ({
  startDate,
  endDate,
  zoomScale,
  showWeekends = true,
  timeScale = 'single',
  primaryTimeUnit = 'month',
  secondaryTimeUnit = 'day',
  scrollLeft = 0,
}) => {
  // Generate primary headers (top row)
  const primaryHeaders = useMemo(() => {
    const headers = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (timeScale === 'dual') {
      // Generate headers based on primary time unit
      switch (primaryTimeUnit) {
        case 'month': {
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
            if (
              d.getMonth() !== currentGroup.month.getMonth() ||
              d.getFullYear() !== currentGroup.month.getFullYear()
            ) {
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
          monthGroups.forEach(group => {
            const monthName = group.month.toLocaleDateString('en-US', {
              month: 'short',
            });
            const year = group.month.getFullYear();
            const width = group.days * zoomScale;

            headers.push(
              <div
                key={`primary-month-${group.month.toISOString()}`}
                className='text-sm font-semibold text-gray-800 py-2 border-r border-gray-300 flex items-center justify-center bg-blue-50'
                style={{
                  width: `${width}px`,
                  minWidth: `${width}px`,
                }}
                title={`${monthName} ${year}`}
              >
                {monthName} {year}
              </div>
            );
          });
          break;
        }

        case 'week': {
          // Generate week headers
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
            const weekNumber = getWeekNumber(d);
            const width = 7 * zoomScale;

            headers.push(
              <div
                key={`primary-week-${d.toISOString()}`}
                className='text-sm font-semibold text-gray-800 py-2 border-r border-gray-300 flex items-center justify-center bg-blue-50'
                style={{
                  width: `${width}px`,
                  minWidth: `${width}px`,
                }}
                title={`Week ${weekNumber}`}
              >
                W{weekNumber}
              </div>
            );
          }
          break;
        }

        case 'day': {
          // Generate day headers
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            if (!showWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
              continue;
            }

            headers.push(
              <div
                key={`primary-day-${d.toISOString()}`}
                className='text-sm font-semibold text-gray-800 py-2 border-r border-gray-300 flex items-center justify-center bg-blue-50'
                style={{
                  width: `${zoomScale}px`,
                  minWidth: `${zoomScale}px`,
                }}
                title={d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              >
                {d.getDate().toString().padStart(2, '0')}
              </div>
            );
          }
          break;
        }
      }
    } else {
      // Single scale - use traditional month headers
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
        if (
          d.getMonth() !== currentGroup.month.getMonth() ||
          d.getFullYear() !== currentGroup.month.getFullYear()
        ) {
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
      monthGroups.forEach(group => {
        const monthName = group.month.toLocaleDateString('en-US', {
          month: 'short',
        });
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
            title={`${monthName} ${year}`}
          >
            {monthName} {year}
          </div>
        );
      });
    }

    return headers;
  }, [startDate, endDate, zoomScale, showWeekends, timeScale, primaryTimeUnit]);

  // Generate secondary headers (bottom row)
  const secondaryHeaders = useMemo(() => {
    const headers = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (timeScale === 'dual') {
      // Generate headers based on secondary time unit
      switch (secondaryTimeUnit) {
        case 'month': {
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
            if (
              d.getMonth() !== currentGroup.month.getMonth() ||
              d.getFullYear() !== currentGroup.month.getFullYear()
            ) {
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
          monthGroups.forEach(group => {
            const monthName = group.month.toLocaleDateString('en-US', {
              month: 'short',
            });
            const year = group.month.getFullYear();
            const width = group.days * zoomScale;

            headers.push(
              <div
                key={`secondary-month-${group.month.toISOString()}`}
                className='text-xs text-gray-600 py-1 border-r border-gray-200 flex items-center justify-center font-medium bg-gray-100'
                style={{
                  width: `${width}px`,
                  minWidth: `${width}px`,
                }}
              >
                {monthName} {year}
              </div>
            );
          });
          break;
        }

        case 'week': {
          // Generate week headers
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
            const weekNumber = getWeekNumber(d);
            const width = 7 * zoomScale;

            headers.push(
              <div
                key={`secondary-week-${d.toISOString()}`}
                className='text-xs text-gray-600 py-1 border-r border-gray-200 flex items-center justify-center font-medium bg-gray-100'
                style={{
                  width: `${width}px`,
                  minWidth: `${width}px`,
                }}
              >
                W{weekNumber}
              </div>
            );
          }
          break;
        }

        case 'day': {
          // Generate day headers
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            if (!showWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
              continue;
            }

            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const dayNumber = d.getDate();

            headers.push(
              <div
                key={`secondary-day-${d.toISOString()}`}
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
          break;
        }
      }
    } else {
      // Single scale - use traditional day headers
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
    }

    return headers;
  }, [
    startDate,
    endDate,
    zoomScale,
    showWeekends,
    timeScale,
    secondaryTimeUnit,
  ]);

  return (
    <div
      className='sticky top-0 z-50 bg-white border-b border-gray-300 shadow-sm'
      style={{
        transform: `translateX(-${scrollLeft}px)`,
        width: 'fit-content',
      }}
    >
      {/* Primary Headers Row */}
      <div className='flex border-b border-gray-200'>{primaryHeaders}</div>

      {/* Secondary Headers Row */}
      <div className='flex'>{secondaryHeaders}</div>
    </div>
  );
};

export default GanttHeader;
