import React, { useState } from 'react';
import {
  CurrencyPoundIcon,
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ExclamationTriangleIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import {
  calculateProjectCost,
  formatCost,
  getCostEfficiencyMetrics,
  getCostTrendAnalysis,
  getCostBreakdownByPeriod,
} from '../utils/costUtils';

const ProjectSummary = ({ tasks, resources }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [periodBreakdown, setPeriodBreakdown] = useState('month');

  // Calculate project cost summary
  const costSummary = calculateProjectCost(tasks, resources);
  const efficiencyMetrics = getCostEfficiencyMetrics(tasks, resources);
  const trendAnalysis = getCostTrendAnalysis(tasks, resources);
  const periodCosts = getCostBreakdownByPeriod(tasks, resources, periodBreakdown);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'breakdown', label: 'Breakdown', icon: TrendingUpIcon },
    { id: 'efficiency', label: 'Efficiency', icon: TrendingDownIcon },
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUpIcon className='w-4 h-4 text-red-600' />;
      case 'decreasing':
        return <TrendingDownIcon className='w-4 h-4 text-green-600' />;
      default:
        return <ChartBarIcon className='w-4 h-4 text-blue-600' />;
    }
  };

  const getEfficiencyColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className='bg-white border border-gray-200 rounded-lg p-4'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <CurrencyPoundIcon className='w-5 h-5 text-green-600' />
          <h3 className='text-lg font-semibold text-gray-900'>Project Cost Summary</h3>
        </div>
        <div className='text-2xl font-bold text-green-600'>
          {formatCost(costSummary.totalCost)}
        </div>
      </div>

      {/* Tabs */}
      <div className='flex border-b border-gray-200 mb-4'>
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className='w-4 h-4' />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className='min-h-[300px]'>
        {activeTab === 'overview' && (
          <div className='space-y-4'>
            {/* Key Metrics */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='bg-blue-50 p-3 rounded-lg'>
                <div className='text-xs text-blue-600 font-medium'>Total Tasks</div>
                <div className='text-lg font-bold text-blue-900'>{costSummary.taskCount}</div>
              </div>
              <div className='bg-green-50 p-3 rounded-lg'>
                <div className='text-xs text-green-600 font-medium'>Resources</div>
                <div className='text-lg font-bold text-green-900'>{costSummary.resourceCount}</div>
              </div>
              <div className='bg-purple-50 p-3 rounded-lg'>
                <div className='text-xs text-purple-600 font-medium'>Avg per Task</div>
                <div className='text-lg font-bold text-purple-900'>{formatCost(costSummary.averageCostPerTask)}</div>
              </div>
              <div className='bg-orange-50 p-3 rounded-lg'>
                <div className='text-xs text-orange-600 font-medium'>Avg per Day</div>
                <div className='text-lg font-bold text-orange-900'>{formatCost(costSummary.averageCostPerDay)}</div>
              </div>
            </div>

            {/* Cost Breakdown by Status */}
            <div className='bg-gray-50 p-4 rounded-lg'>
              <h4 className='text-sm font-semibold text-gray-700 mb-3'>Cost by Status</h4>
              <div className='space-y-2'>
                {costSummary.breakdown.byStatus.map(status => (
                  <div key={status.status} className='flex justify-between items-center'>
                    <span className='text-sm text-gray-600'>{status.status}</span>
                    <span className='font-medium text-gray-900'>{formatCost(status.cost)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Breakdown by Priority */}
            <div className='bg-gray-50 p-4 rounded-lg'>
              <h4 className='text-sm font-semibold text-gray-700 mb-3'>Cost by Priority</h4>
              <div className='space-y-2'>
                {costSummary.breakdown.byPriority.map(priority => (
                  <div key={priority.priority} className='flex justify-between items-center'>
                    <span className='text-sm text-gray-600'>{priority.priority}</span>
                    <span className='font-medium text-gray-900'>{formatCost(priority.cost)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'breakdown' && (
          <div className='space-y-4'>
            {/* Period Breakdown */}
            <div className='bg-gray-50 p-4 rounded-lg'>
              <div className='flex items-center justify-between mb-3'>
                <h4 className='text-sm font-semibold text-gray-700'>Cost by Period</h4>
                <select
                  value={periodBreakdown}
                  onChange={e => setPeriodBreakdown(e.target.value)}
                  className='text-xs border border-gray-300 rounded px-2 py-1'
                >
                  <option value='week'>Weekly</option>
                  <option value='month'>Monthly</option>
                  <option value='quarter'>Quarterly</option>
                </select>
              </div>
              <div className='space-y-2 max-h-48 overflow-y-auto'>
                {periodCosts.map(period => (
                  <div key={period.period} className='flex justify-between items-center p-2 bg-white rounded'>
                    <span className='text-sm text-gray-600'>{period.period}</span>
                    <div className='text-right'>
                      <div className='font-medium text-gray-900'>{formatCost(period.totalCost)}</div>
                      <div className='text-xs text-gray-500'>{period.taskCount} tasks</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Breakdown */}
            <div className='bg-gray-50 p-4 rounded-lg'>
              <h4 className='text-sm font-semibold text-gray-700 mb-3'>Cost by Resource</h4>
              <div className='space-y-2 max-h-48 overflow-y-auto'>
                {costSummary.breakdown.byResource.map(resource => (
                  <div key={resource.resourceId} className='flex justify-between items-center p-2 bg-white rounded'>
                    <div>
                      <div className='text-sm font-medium text-gray-900'>{resource.resourceName}</div>
                      <div className='text-xs text-gray-500'>{resource.taskCount} tasks</div>
                    </div>
                    <div className='text-right'>
                      <div className='font-medium text-gray-900'>{formatCost(resource.totalCost)}</div>
                      <div className='text-xs text-gray-500'>{resource.totalDuration} days</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'efficiency' && (
          <div className='space-y-4'>
            {/* Efficiency Score */}
            <div className='bg-gray-50 p-4 rounded-lg'>
              <h4 className='text-sm font-semibold text-gray-700 mb-3'>Cost Efficiency</h4>
              <div className='text-center'>
                <div className={`text-3xl font-bold ${getEfficiencyColor(efficiencyMetrics.efficiencyScore)}`}>
                  {efficiencyMetrics.efficiencyScore.toFixed(1)}%
                </div>
                <div className='text-sm text-gray-600 mt-1'>Efficiency Score</div>
              </div>
            </div>

            {/* Budget Variance */}
            <div className='bg-gray-50 p-4 rounded-lg'>
              <h4 className='text-sm font-semibold text-gray-700 mb-3'>Budget Variance</h4>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-gray-600'>Total Budget:</span>
                  <div className='font-semibold text-blue-600'>{formatCost(efficiencyMetrics.totalBudget)}</div>
                </div>
                <div>
                  <span className='text-gray-600'>Total Actual:</span>
                  <div className='font-semibold text-green-600'>{formatCost(efficiencyMetrics.totalActual)}</div>
                </div>
                <div>
                  <span className='text-gray-600'>Variance:</span>
                  <div className={`font-semibold ${efficiencyMetrics.totalVariance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCost(efficiencyMetrics.totalVariance)}
                  </div>
                </div>
                <div>
                  <span className='text-gray-600'>Avg Variance:</span>
                  <div className='font-semibold text-purple-600'>{efficiencyMetrics.averageVariance.toFixed(1)}%</div>
                </div>
              </div>
            </div>

            {/* Task Status */}
            <div className='bg-gray-50 p-4 rounded-lg'>
              <h4 className='text-sm font-semibold text-gray-700 mb-3'>Task Budget Status</h4>
              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600'>Over Budget</span>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-red-600'>{efficiencyMetrics.overBudgetTasks}</span>
                    <ExclamationTriangleIcon className='w-4 h-4 text-red-600' />
                  </div>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600'>Under Budget</span>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-green-600'>{efficiencyMetrics.underBudgetTasks}</span>
                    <CheckIcon className='w-4 h-4 text-green-600' />
                  </div>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600'>On Budget</span>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-blue-600'>{efficiencyMetrics.onBudgetTasks}</span>
                    <CheckIcon className='w-4 h-4 text-blue-600' />
                  </div>
                </div>
              </div>
            </div>

            {/* Trend Analysis */}
            <div className='bg-gray-50 p-4 rounded-lg'>
              <h4 className='text-sm font-semibold text-gray-700 mb-3'>Cost Trend</h4>
              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600'>Current Cost:</span>
                  <span className='font-medium text-gray-900'>{formatCost(trendAnalysis.totalCost)}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600'>Cost per Day:</span>
                  <span className='font-medium text-gray-900'>{formatCost(trendAnalysis.costPerDay)}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600'>Projected Cost:</span>
                  <span className='font-medium text-gray-900'>{formatCost(trendAnalysis.projectedCost)}</span>
                </div>
              </div>
              
              {/* Recommendations */}
              {trendAnalysis.recommendations.length > 0 && (
                <div className='mt-3 pt-3 border-t border-gray-200'>
                  <h5 className='text-xs font-medium text-gray-600 mb-2'>Recommendations</h5>
                  <ul className='text-xs text-gray-700 space-y-1'>
                    {trendAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className='flex items-start gap-2'>
                        <span className='text-blue-600 mt-0.5'>•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSummary;
