import React, { useState } from 'react';

const LinkPicker = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  sourceTaskId, 
  targetTaskId 
}) => {
  const [selectedLinkType, setSelectedLinkType] = useState('FS');

  const linkTypes = [
    { id: 'FS', label: 'Finish-to-Start (FS)', description: 'Task B starts when Task A finishes' },
    { id: 'SS', label: 'Start-to-Start (SS)', description: 'Task B starts when Task A starts' },
    { id: 'FF', label: 'Finish-to-Finish (FF)', description: 'Task B finishes when Task A finishes' },
    { id: 'SF', label: 'Start-to-Finish (SF)', description: 'Task B finishes when Task A starts' }
  ];

  const handleConfirm = () => {
    onConfirm({
      sourceTaskId,
      targetTaskId,
      linkType: selectedLinkType
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Create Task Link
        </h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Select the type of dependency between the selected tasks:
          </p>
          
          <div className="space-y-2">
            {linkTypes.map((linkType) => (
              <label
                key={linkType.id}
                className={`flex items-start p-3 border rounded-md cursor-pointer transition-colors ${
                  selectedLinkType === linkType.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="linkType"
                  value={linkType.id}
                  checked={selectedLinkType === linkType.id}
                  onChange={(e) => setSelectedLinkType(e.target.value)}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {linkType.label}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {linkType.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkPicker;
