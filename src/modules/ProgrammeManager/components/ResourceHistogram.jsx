import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTaskContext } from '../context/TaskContext';
import { useViewContext } from '../context/ViewContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ResourceHistogram = () => {
  const { tasks, taskLinks } = useTaskContext();
  const { viewState } = useViewContext();
  const chartRef = useRef(null);

  // Get all unique resources from tasks
  const resources = useMemo(() => {
    const resourceSet = new Set();
    tasks.forEach(task => {
      if (task.assignee && task.assignee.trim()) {
        resourceSet.add(task.assignee);
      }
    });
    return Array.from(resourceSet).sort();
  }, [tasks]);

  // Helper function to get project date range
  const getProjectDateRange = () => {
    if (tasks.length === 0) {
      const today = new Date();
      return {
        startDate: today,
        endDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      };
    }

    const startDates = tasks.map(task => new Date(task.startDate));
    const endDates = tasks.map(task => new Date(task.endDate));

    const minStart = new Date(Math.min(...startDates));
    const maxEnd = new Date(Math.max(...endDates));

    // Add some padding
    const padding = 7 * 24 * 60 * 60 * 1000; // 7 days
    return {
      startDate: new Date(minStart.getTime() - padding),
      endDate: new Date(maxEnd.getTime() + padding),
    };
  };

  // Generate timeline data based on view scale
  const timelineData = useMemo(() => {
    const { startDate, endDate } = getProjectDateRange();
    const scale = viewState.scale || 'day';
    
    const dates = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      
      switch (scale) {
        case 'day':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'week':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'month':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        default:
          currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    return dates;
  }, [tasks, viewState.scale]);

  // Calculate resource allocation for each time period
  const allocationData = useMemo(() => {
    const data = {};
    
    resources.forEach(resource => {
      data[resource] = timelineData.map(date => {
        const startOfPeriod = new Date(date);
        const endOfPeriod = new Date(date);
        
        // Adjust end of period based on scale
        switch (viewState.scale || 'day') {
          case 'day':
            endOfPeriod.setDate(endOfPeriod.getDate() + 1);
            break;
          case 'week':
            endOfPeriod.setDate(endOfPeriod.getDate() + 7);
            break;
          case 'month':
            endOfPeriod.setMonth(endOfPeriod.getMonth() + 1);
            break;
        }
        
        // Find tasks assigned to this resource that overlap with this period
        const overlappingTasks = tasks.filter(task => {
          if (task.assignee !== resource) return false;
          
          const taskStart = new Date(task.startDate);
          const taskEnd = new Date(task.endDate);
          
          return taskStart < endOfPeriod && taskEnd > startOfPeriod;
        });
        
        // Calculate total allocation for this resource in this period
        let totalAllocation = 0;
        overlappingTasks.forEach(task => {
          const taskStart = new Date(task.startDate);
          const taskEnd = new Date(task.endDate);
          
          // Calculate overlap duration
          const overlapStart = new Date(Math.max(startOfPeriod, taskStart));
          const overlapEnd = new Date(Math.min(endOfPeriod, taskEnd));
          const overlapDays = (overlapEnd - overlapStart) / (1000 * 60 * 60 * 24);
          
          // Calculate allocation percentage (assuming 8 hours per day)
          const taskAllocation = task.allocation || 100; // Default to 100%
          const periodDays = (endOfPeriod - startOfPeriod) / (1000 * 60 * 60 * 24);
          const allocation = (overlapDays / periodDays) * (taskAllocation / 100);
          
          totalAllocation += allocation;
        });
        
        return Math.min(totalAllocation * 100, 100); // Cap at 100%
      });
    });
    
    return data;
  }, [tasks, resources, timelineData, viewState.scale]);

  // Format timeline labels
  const timelineLabels = useMemo(() => {
    return timelineData.map(date => {
      switch (viewState.scale || 'day') {
        case 'day':
          return date.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short' 
          });
        case 'week':
          return `Week ${date.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short' 
          })}`;
        case 'month':
          return date.toLocaleDateString('en-GB', { 
            month: 'short', 
            year: '2-digit' 
          });
        default:
          return date.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short' 
          });
      }
    });
  }, [timelineData, viewState.scale]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const datasets = resources.map((resource, index) => {
      // Generate a color for each resource
      const colors = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
      ];
      const color = colors[index % colors.length];
      
      return {
        label: resource,
        data: allocationData[resource] || [],
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
        stack: 'stack0',
      };
    });

    return {
      labels: timelineLabels,
      datasets,
    };
  }, [resources, allocationData, timelineLabels]);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Resource Allocation Over Time',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (context) => {
            return `Period: ${context[0].label}`;
          },
          label: (context) => {
            const resource = context.dataset.label;
            const allocation = context.parsed.y.toFixed(1);
            return `${resource}: ${allocation}%`;
          },
          afterLabel: (context) => {
            const total = context.reduce((sum, item) => sum + item.parsed.y, 0);
            return `Total: ${total.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Timeline',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Allocation (%)',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
        min: 0,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`,
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  // Handle chart click for navigation
  const handleChartClick = (event, elements) => {
    if (elements.length > 0) {
      const element = elements[0];
      const periodIndex = element.index;
      const periodDate = timelineData[periodIndex];
      
      // TODO: Navigate to specific period in Gantt chart
      console.log('Clicked period:', periodDate);
    }
  };

  // Update chart options to include click handler
  const finalChartOptions = {
    ...chartOptions,
    onClick: handleChartClick,
  };

  return (
    <div className='bg-white border border-gray-200 rounded-lg p-4 h-full flex flex-col'>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h3 className='text-lg font-semibold text-gray-800'>
            Resource Histogram
          </h3>
          <p className='text-sm text-gray-600'>
            Resource allocation over time ({viewState.scale || 'day'} view)
          </p>
        </div>
        <div className='text-xs text-gray-500'>
          {resources.length} resources • {timelineData.length} periods
        </div>
      </div>

      <div className='flex-1 min-h-0'>
        {resources.length > 0 ? (
          <div className='h-full'>
            <Bar
              ref={chartRef}
              data={chartData}
              options={finalChartOptions}
            />
          </div>
        ) : (
          <div className='flex items-center justify-center h-full'>
            <div className='text-center'>
              <div className='text-gray-400 text-6xl mb-4'>📊</div>
              <h4 className='text-lg font-medium text-gray-600 mb-2'>
                No Resources Found
              </h4>
              <p className='text-sm text-gray-500'>
                Assign resources to tasks to see allocation data
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {resources.length > 0 && (
        <div className='mt-4 pt-4 border-t border-gray-200'>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='text-gray-600'>Peak Allocation:</span>
              <span className='ml-2 font-medium'>
                {Math.max(...Object.values(allocationData).flat()).toFixed(1)}%
              </span>
            </div>
            <div>
              <span className='text-gray-600'>Average Allocation:</span>
              <span className='ml-2 font-medium'>
                {(Object.values(allocationData).flat().reduce((sum, val) => sum + val, 0) / 
                  (Object.values(allocationData).flat().length || 1)).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceHistogram;
