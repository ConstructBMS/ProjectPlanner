import { Suspense, lazy, useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { ProjectsProvider } from './modules/ProgrammeManager/context/ProjectsContext';
import Navigation from './components/Navigation';
import { initializeDatabase } from './modules/ProgrammeManager/utils/initDatabase.js';

// Lazy load the main application components
const ProgrammeManager = lazy(
  () => import('./modules/ProgrammeManager/AppShell')
);

const PortfolioDashboard = lazy(() => import('./pages/PortfolioDashboard'));
const ProjectTemplates = lazy(() => import('./pages/ProjectTemplates'));

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
  const [currentView, setCurrentView] = useState('project'); // Default to the Asta replica
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Initialize database schema checks on app start (only once)
  useEffect(() => {
    initializeDatabase();
  }, []); // Empty dependency array ensures it only runs once

  const handleProjectSelect = projectId => {
    setSelectedProjectId(projectId);
    setCurrentView('project');
  };

  const handleBackToPortfolio = () => {
    setCurrentView('portfolio');
    setSelectedProjectId(null);
  };

  const handleTemplateSelect = template => {
    setSelectedTemplate(template);
    setCurrentView('project');
  };

  const handleShowTemplates = () => {
    setCurrentView('templates');
  };

  return (
    <ErrorBoundary>
      <ProjectsProvider>
        <div className='min-h-screen bg-gray-50'>
          <Navigation currentView={currentView} onViewChange={setCurrentView} />
          <Suspense fallback={<LoadingSpinner />}>
            {currentView === 'portfolio' ? (
              <PortfolioDashboard
                onProjectSelect={handleProjectSelect}
                onShowTemplates={handleShowTemplates}
              />
            ) : currentView === 'templates' ? (
              <ProjectTemplates
                onTemplateSelect={handleTemplateSelect}
                onBackToPortfolio={handleBackToPortfolio}
              />
            ) : (
              <ProgrammeManager
                projectId={selectedProjectId}
                onBackToPortfolio={handleBackToPortfolio}
              />
            )}
          </Suspense>
        </div>
      </ProjectsProvider>
    </ErrorBoundary>
  );
}

export default App;
