import React, { Suspense, lazy } from 'react';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load the main application component
const ProgrammeManager = lazy(
  () => import('./modules/ProgrammeManager/AppShell')
);

// Loading component
const LoadingSpinner = () => (
  <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
    <div className='text-center'>
      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4' />
      <p className='text-gray-600'>Loading ProjectPlanner...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <ProgrammeManager />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
