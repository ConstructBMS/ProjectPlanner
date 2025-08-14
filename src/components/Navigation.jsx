 
import { ChartBarIcon, TableCellsIcon } from '@heroicons/react/24/outline';

const Navigation = ({ currentView, onViewChange }) => {
  return (
    <div className='bg-white border-b border-gray-200 px-4 py-2'>
      <div className='flex items-center space-x-4'>
        <h1 className='text-lg font-semibold text-gray-900'>ProjectPlanner</h1>
        <div className='flex space-x-1'>
          <button
            onClick={() => onViewChange('portfolio')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              currentView === 'portfolio'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ChartBarIcon className='w-4 h-4 inline mr-1' />
            Portfolio Dashboard
          </button>
          <button
            onClick={() => onViewChange('project')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              currentView === 'project'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <TableCellsIcon className='w-4 h-4 inline mr-1' />
            Asta PowerProject Replica
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
