import React, { useState, useEffect } from 'react';
import { seedDemoTasks, healthCheck, getLastError } from '../../data/adapter.constructbms';
import { tables } from '../../data/adapter.config';

const PlannerDiagnostics = ({ isVisible, onClose }) => {
  const [healthData, setHealthData] = useState({});
  const [lastError, setLastError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Check if debug mode is enabled
  const isDebugMode = () => {
    return new window.URLSearchParams(window.location.search).get('ppDebug') === '1';
  };

  // Perform health checks for all tables
  const performHealthChecks = async () => {
    setIsLoading(true);
    try {
      const results = await healthCheck();
      const healthDataMap = {};
      
      results.forEach(result => {
        // Find the key for this table name
        const key = Object.keys(tables).find(k => tables[k] === result.table);
        if (key) {
          healthDataMap[key] = result;
        }
      });
      
      setHealthData(healthDataMap);
      
      // Get last error from adapter
      const adapterLastError = getLastError();
      if (adapterLastError) {
        setLastError(adapterLastError);
      }
    } catch (error) {
      console.error('Failed to perform health checks:', error);
      setLastError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load demo data
  const handleLoadDemoData = async () => {
    setIsSeeding(true);
    try {
      // Get current project ID from URL or use a default
      const urlParams = new window.URLSearchParams(window.location.search);
      const projectId = urlParams.get('projectId') || 'demo-project';
      
      await seedDemoTasks(projectId);
      // Refresh health checks after seeding
      await performHealthChecks();
    } catch (error) {
      console.error('Failed to seed demo data:', error);
      setLastError(error.message);
    } finally {
      setIsSeeding(false);
    }
  };

  // Load health data on mount and when visible
  useEffect(() => {
    if (isVisible && isDebugMode()) {
      performHealthChecks();
    }
  }, [isVisible]);

  // Don't render if not in debug mode
  if (!isDebugMode()) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Planner Diagnostics
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* Table Configuration */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-2">
              Table Configuration
            </h3>
            <div className="bg-gray-50 rounded p-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(tables).map(([key, tableName]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-mono text-gray-600">{key}:</span>
                    <span className="font-mono text-gray-900">{tableName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Health Checks */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-md font-medium text-gray-900">
                Table Health Checks
              </h3>
              <button
                onClick={performHealthChecks}
                disabled={isLoading}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? 'Checking...' : 'Refresh'}
              </button>
            </div>

            {Object.entries(healthData).map(([key, data]) => (
              <div key={key} className="mb-3 p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{key}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      data.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {data.ok ? 'OK' : 'ERROR'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {data.count} rows
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 font-mono">
                  {data.message}
                </div>
              </div>
            ))}
          </div>

          {/* Demo Data Section */}
          {healthData.tasks && healthData.tasks.count === 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-md font-medium text-yellow-900 mb-2">
                No Tasks Found
              </h3>
              <p className="text-sm text-yellow-800 mb-3">
                The tasks table is empty. You can load demo data to get started.
              </p>
              <button
                onClick={handleLoadDemoData}
                disabled={isSeeding}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
              >
                {isSeeding ? 'Loading Demo Data...' : 'Load Demo Data'}
              </button>
            </div>
          )}

          {/* Last Error */}
          {lastError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-md font-medium text-red-900 mb-2">
                Last Error
              </h3>
              <div className="text-sm text-red-800 font-mono">
                {lastError}
              </div>
            </div>
          )}

          {/* Environment Info */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-2">
              Environment
            </h3>
            <div className="bg-gray-50 rounded p-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Debug Mode:</span>
                  <span className="font-mono text-gray-900">
                    {isDebugMode() ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Environment:</span>
                  <span className="font-mono text-gray-900">
                    {import.meta.env.MODE}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Supabase URL:</span>
                  <span className="font-mono text-gray-900">
                    {import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not Set'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500">
            Diagnostics panel - Add ?ppDebug=1 to URL to enable
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlannerDiagnostics;
