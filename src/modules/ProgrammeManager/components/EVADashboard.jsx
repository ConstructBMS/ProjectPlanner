import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  ChartBarIcon,
  CurrencyPoundIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
} from '@heroicons/react/24/outline';
import {
  calculateEVAMetrics,
  generateEVAChartData,
  generateEVATrendChartData,
  generatePerformanceIndicesChartData,
  generateVarianceChartData,
  formatCurrency,
  formatPercentage,
  exportEVAMetrics,
  importEVAMetrics,
  DEFAULT_EVA_CONFIG,
} from '../utils/evaUtils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const EVADashboard = ({ tasks, statusDate = new Date() }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [evaHistory, setEvaHistory] = useState([]);
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Calculate current EVA metrics
  const evaMetrics = useMemo(() => {
    return calculateEVAMetrics(tasks, statusDate, DEFAULT_EVA_CONFIG);
  }, [tasks, statusDate]);

  // Generate chart data
  const evaChartData = useMemo(() => {
    return generateEVAChartData(evaMetrics, DEFAULT_EVA_CONFIG);
  }, [evaMetrics]);

  const performanceIndicesChartData = useMemo(() => {
    return generatePerformanceIndicesChartData(evaMetrics, DEFAULT_EVA_CONFIG);
  }, [evaMetrics]);

  const varianceChartData = useMemo(() => {
    return generateVarianceChartData(evaMetrics, DEFAULT_EVA_CONFIG);
  }, [evaMetrics]);

  const trendChartData = useMemo(() => {
    return generateEVATrendChartData(evaHistory, DEFAULT_EVA_CONFIG);
  }, [evaHistory]);

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
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${formatCurrency(value, DEFAULT_EVA_CONFIG)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value, DEFAULT_EVA_CONFIG);
          },
        },
      },
    },
  };

  const performanceChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        max: 2,
        ticks: {
          callback: function(value) {
            return value.toFixed(2);
          },
        },
      },
    },
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(3)}`;
          },
        },
      },
    },
  };

  const trendChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${formatCurrency(value, DEFAULT_EVA_CONFIG)}`;
          },
        },
      },
    },
  };

  // Handle export
  const handleExport = () => {
    const exportData = exportEVAMetrics(evaMetrics);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eva-metrics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle import
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        const importResult = importEVAMetrics(importData);
        
        if (importResult.success) {
          // Add to history
          setEvaHistory(prev => [...prev, importResult.evaMetrics]);
        } else {
          console.error('Import failed:', importResult.errors);
          alert(`Import failed: ${importResult.errors.join(', ')}`);
        }
      } catch (error) {
        console.error('Error parsing import file:', error);
        alert('Error parsing import file. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  // Add current metrics to history
  useEffect(() => {
    if (evaMetrics && Object.keys(evaMetrics).length > 0) {
      setEvaHistory(prev => {
        const existing = prev.find(item => 
          new Date(item.statusDate).toDateString() === new Date(statusDate).toDateString()
        );
        
        if (!existing) {
          return [...prev, evaMetrics];
        }
        
        return prev.map(item => 
          new Date(item.statusDate).toDateString() === new Date(statusDate).toDateString()
            ? evaMetrics
            : item
        );
      });
    }
  }, [evaMetrics, statusDate]);

  const MetricCard = ({ title, value, subtitle, icon, color, trend }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-2">
          {trend > 0 ? (
            <TrendingUpIcon className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDownIcon className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-xs ml-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(trend).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );

  const StatusIndicator = ({ status }) => (
    <div className="flex items-center gap-2">
      <div 
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: status.color }}
      />
      <span className="text-sm font-medium" style={{ color: status.color }}>
        {status.icon} {status.label}
      </span>
    </div>
  );

  return (
    <div className="eva-dashboard bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Earned Value Analysis</h1>
              <p className="text-sm text-gray-600">
                Status Date: {new Date(statusDate).toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              Export
            </button>
            <label className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors cursor-pointer">
              <DocumentArrowUpIcon className="w-4 h-4" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'charts', label: 'Charts', icon: TrendingUpIcon },
              { id: 'trends', label: 'Trends', icon: ClockIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Planned Value (PV)"
                value={formatCurrency(evaMetrics.pv, DEFAULT_EVA_CONFIG)}
                subtitle={`${evaMetrics.pvPercentage}% of BAC`}
                icon={<CurrencyPoundIcon className="w-6 h-6 text-blue-600" />}
                color="bg-blue-50"
              />
              <MetricCard
                title="Earned Value (EV)"
                value={formatCurrency(evaMetrics.ev, DEFAULT_EVA_CONFIG)}
                subtitle={`${evaMetrics.evPercentage}% of BAC`}
                icon={<CurrencyPoundIcon className="w-6 h-6 text-green-600" />}
                color="bg-green-50"
              />
              <MetricCard
                title="Actual Cost (AC)"
                value={formatCurrency(evaMetrics.ac, DEFAULT_EVA_CONFIG)}
                subtitle={`${evaMetrics.acPercentage}% of BAC`}
                icon={<CurrencyPoundIcon className="w-6 h-6 text-amber-600" />}
                color="bg-amber-50"
              />
              <MetricCard
                title="Budget at Completion (BAC)"
                value={formatCurrency(evaMetrics.bac, DEFAULT_EVA_CONFIG)}
                subtitle="Total planned cost"
                icon={<CurrencyPoundIcon className="w-6 h-6 text-purple-600" />}
                color="bg-purple-50"
              />
            </div>

            {/* Performance Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Status</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Schedule Performance</h4>
                    <StatusIndicator status={evaMetrics.scheduleStatus} />
                    <div className="mt-2 text-sm text-gray-600">
                      SPI: {evaMetrics.spi.toFixed(3)} | SV: {formatCurrency(evaMetrics.sv, DEFAULT_EVA_CONFIG)}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Cost Performance</h4>
                    <StatusIndicator status={evaMetrics.costStatus} />
                    <div className="mt-2 text-sm text-gray-600">
                      CPI: {evaMetrics.cpi.toFixed(3)} | CV: {formatCurrency(evaMetrics.cv, DEFAULT_EVA_CONFIG)}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Overall Performance</h4>
                    <StatusIndicator status={evaMetrics.overallStatus} />
                    <div className="mt-2 text-sm text-gray-600">
                      Score: {(evaMetrics.overallStatus.score * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Forecasts */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Forecasts</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Estimate at Completion (EAC)</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(evaMetrics.eac, DEFAULT_EVA_CONFIG)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Estimate to Complete (ETC)</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(evaMetrics.etc, DEFAULT_EVA_CONFIG)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Variance at Completion (VAC)</div>
                    <div className={`text-lg font-semibold ${
                      evaMetrics.vac >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(evaMetrics.vac, DEFAULT_EVA_CONFIG)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">To Complete Performance Index (TCPI)</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {evaMetrics.tcpi.toFixed(3)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Summary */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Summary</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Total Tasks</div>
                    <div className="text-lg font-semibold text-gray-900">{evaMetrics.taskCount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Completed Tasks</div>
                    <div className="text-lg font-semibold text-green-600">{evaMetrics.completedTasks}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">In Progress Tasks</div>
                    <div className="text-lg font-semibold text-blue-600">{evaMetrics.inProgressTasks}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Completion Rate</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {evaMetrics.taskCount > 0 ? ((evaMetrics.completedTasks / evaMetrics.taskCount) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="space-y-6">
            {/* EVA Chart */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Earned Value Analysis</h3>
              <div className="h-80">
                <Bar data={evaChartData} options={chartOptions} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Indices */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Indices</h3>
                <div className="h-64">
                  <Bar data={performanceIndicesChartData} options={performanceChartOptions} />
                </div>
              </div>

              {/* Variances */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Variances</h3>
                <div className="h-64">
                  <Bar data={varianceChartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            {/* Trend Chart */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">EVA Trends Over Time</h3>
              {evaHistory.length > 0 ? (
                <div className="h-80">
                  <Line data={trendChartData} options={trendChartOptions} />
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <ChartBarIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No trend data available</p>
                    <p className="text-sm">Import historical EVA data to see trends</p>
                  </div>
                </div>
              )}
            </div>

            {/* History Table */}
            {evaHistory.length > 0 && (
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Historical Data</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          PV
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          EV
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          AC
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SPI
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CPI
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {evaHistory.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(item.statusDate).toLocaleDateString('en-GB')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.pv, DEFAULT_EVA_CONFIG)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.ev, DEFAULT_EVA_CONFIG)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.ac, DEFAULT_EVA_CONFIG)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.spi.toFixed(3)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.cpi.toFixed(3)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EVADashboard;
