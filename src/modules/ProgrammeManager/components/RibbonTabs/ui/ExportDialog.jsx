 

const ExportDialog = ({ isOpen, onClose, mode = 'export' }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    console.info('Print functionality coming soon');
    onClose();
  };

  const handleExport = (format) => {
    console.info(`Export to ${format} coming soon`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {mode === 'print' ? 'Print Preview' : 'Export Options'}
        </h3>
        
        {mode === 'print' ? (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Print functionality is coming soon. This will provide a print preview with advanced options.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Print Preview
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleExport('PNG (Timeline Only)')}
                className="flex items-center justify-between p-3 text-left border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">PNG (Timeline Only)</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Export Gantt chart as image</div>
                </div>
                <span className="text-gray-400">.png</span>
              </button>
              
              <button
                onClick={() => handleExport('PDF (Timeline + Grid)')}
                className="flex items-center justify-between p-3 text-left border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">PDF (Timeline + Grid)</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Export complete project view</div>
                </div>
                <span className="text-gray-400">.pdf</span>
              </button>
              
              <button
                onClick={() => handleExport('CSV (Grid)')}
                className="flex items-center justify-between p-3 text-left border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">CSV (Grid)</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Export task data as spreadsheet</div>
                </div>
                <span className="text-gray-400">.csv</span>
              </button>
              
              <button
                onClick={() => handleExport('Asta XML')}
                className="flex items-center justify-between p-3 text-left border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Asta XML</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Export for Asta PowerProject</div>
                </div>
                <span className="text-gray-400">.xml</span>
              </button>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportDialog;
