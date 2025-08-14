import { useState, useEffect } from 'react';
import { healthCheck, getLastError, seedDemoTasks } from '../../data/adapter.constructbms';
import { tables } from '../../data/adapter.config';
import { usePlannerStore } from '../../state/plannerStore';

const PlannerDiagnostics = ({ isVisible, onClose }) => {
  const [healthData, setHealthData] = useState([]);
  const [lastError, setLastError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const { currentProjectId, hydrate } = usePlannerStore();

  const isDebugMode = () => {
    return window.location.search.includes('ppDebug=1');
  };

  const performHealthChecks = async () => {
    setIsLoading(true);
    try {
      const results = await healthCheck();
      setHealthData(results);
      setLastError(getLastError());
    } catch (error) {
      console.error('Health check failed:', error);
      setLastError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadDemoData = async () => {
    if (!currentProjectId) {
      alert('No project selected');
      return;
    }

    setIsSeeding(true);
    try {
      const success = await seedDemoTasks(currentProjectId);
      if (success) {
        // Re-hydrate the store with the new data
        await hydrate(currentProjectId);
        alert('Demo data seeded successfully!');
        // Refresh health data
        await performHealthChecks();
      } else {
        alert('Failed to seed demo data. Check console for details.');
      }
    } catch (error) {
      console.error('Demo seeding failed:', error);
      alert(`Demo seeding failed: ${error.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    if (isVisible && isDebugMode()) {
      performHealthChecks();
    }
  }, [isVisible]);

  if (!isDebugMode()) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            ProjectPlanner Diagnostics
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Table Configuration */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            Table Configuration
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
            <pre className="text-sm text-gray-700 dark:text-gray-300">
              {JSON.stringify(tables, null, 2)}
            </pre>
          </div>
        </div>

        {/* Health Checks */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Table Health Checks
            </h3>
            <button
              onClick={performHealthChecks}
              disabled={isLoading}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Checking...' : 'Refresh'}
            </button>
          </div>
          
          <div className="space-y-2">
            {healthData.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded border ${
                  result.ok
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                    : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {result.table}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      result.ok
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'
                    }`}
                  >
                    {result.ok ? 'OK' : 'ERROR'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Count: {result.count} | {result.message}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Data Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            Demo Data
          </h3>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Use this to manually seed demo data for testing and development.
            </p>
            <button
              onClick={handleLoadDemoData}
              disabled={isSeeding || !currentProjectId}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSeeding ? 'Seeding...' : 'Seed Demo Data'}
            </button>
            {!currentProjectId && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                No project selected
              </p>
            )}
          </div>
        </div>

        {/* Last Error */}
        {lastError && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Last Error
            </h3>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
              <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">
                {lastError}
              </pre>
            </div>
          </div>
        )}

        {/* Environment Info */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            Environment Info
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <div>Debug Mode: {isDebugMode() ? 'Enabled' : 'Disabled'}</div>
              <div>Vite Mode: {import.meta.env.MODE}</div>
              <div>Current Project: {currentProjectId || 'None'}</div>
              <div>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? 'Configured' : 'Missing'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlannerDiagnostics;
