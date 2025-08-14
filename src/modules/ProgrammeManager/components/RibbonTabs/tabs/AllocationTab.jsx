 
import { useState, useEffect } from 'react';
import { useSelectionContext } from '../../../context/SelectionContext';
import RibbonButton from '../shared/RibbonButton';
import RibbonGroup from '../shared/RibbonGroup';
import MiniModal from '../ui/MiniModal';
import {
  PlusIcon,
  MinusIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

const AllocationTab = () => {
  const { selectedTasks } = useSelectionContext();
  
  // State for resources pane visibility and width
  const [resourcesPaneVisible, setResourcesPaneVisible] = useState(false);
  const [resourcesPaneWidth, setResourcesPaneWidth] = useState(320);
  
  // Assignment modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock resources data (will be replaced with real data later)
  const mockResources = [
    { id: 'r1', name: 'John Smith', role: 'Developer', availability: 100 },
    { id: 'r2', name: 'Jane Doe', role: 'Designer', availability: 80 },
    { id: 'r3', name: 'Mike Johnson', role: 'Project Manager', availability: 100 },
    { id: 'r4', name: 'Sarah Wilson', role: 'QA Engineer', availability: 90 },
    { id: 'r5', name: 'Tom Brown', role: 'Developer', availability: 75 },
  ];

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const visible = localStorage.getItem('pm.alloc.pane.visible');
        const width = localStorage.getItem('pm.alloc.pane.width');
        
        if (visible !== null) {
          setResourcesPaneVisible(visible === 'true');
        }
        
        if (width !== null) {
          const parsedWidth = parseInt(width, 10);
          if (parsedWidth >= 260) {
            setResourcesPaneWidth(parsedWidth);
          }
        }
      } catch (error) {
        console.warn('Failed to load allocation preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences when they change
  useEffect(() => {
    try {
      localStorage.setItem('pm.alloc.pane.visible', resourcesPaneVisible.toString());
    } catch (error) {
      console.warn('Failed to save pane visibility preference:', error);
    }
  }, [resourcesPaneVisible]);

  useEffect(() => {
    try {
      localStorage.setItem('pm.alloc.pane.width', resourcesPaneWidth.toString());
    } catch (error) {
      console.warn('Failed to save pane width preference:', error);
    }
  }, [resourcesPaneWidth]);

  // Toggle resources pane visibility
  const handleToggleResourcesPane = () => {
    setResourcesPaneVisible(prev => !prev);
    
    // Emit event for the main app to handle pane visibility
    window.dispatchEvent(new window.CustomEvent('RESOURCES_PANE_TOGGLE', {
      detail: { visible: !resourcesPaneVisible }
    }));
  };

  // Assignment handlers
  const handleOpenAssignModal = () => {
    setAssignModalOpen(true);
    setSelectedResource('');
    setSearchQuery('');
  };

  const handleCloseAssignModal = () => {
    setAssignModalOpen(false);
    setSelectedResource('');
    setSearchQuery('');
  };

  const handleAssignResource = () => {
    if (!selectedResource || !selectedTasks || selectedTasks.length === 0) {
      return;
    }

    const resource = mockResources.find(r => r.id === selectedResource);
    if (!resource) {
      return;
    }

    window.dispatchEvent(new window.CustomEvent('RESOURCE_ASSIGN', {
      detail: {
        resourceId: selectedResource,
        resourceName: resource.name,
        taskIds: selectedTasks,
      }
    }));

    console.log('Resource assigned:', resource.name, 'to tasks:', selectedTasks);
    handleCloseAssignModal();
  };

  const handleUnassignResource = () => {
    if (!selectedTasks || selectedTasks.length === 0) {
      return;
    }

    window.dispatchEvent(new window.CustomEvent('RESOURCE_UNASSIGN', {
      detail: {
        taskIds: selectedTasks,
      }
    }));

    console.log('Resources unassigned from tasks:', selectedTasks);
  };

  // Filter resources based on search query
  const filteredResources = mockResources.filter(resource =>
    resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if enough tasks are selected
  const hasSelectedTasks = selectedTasks && selectedTasks.length > 0;

  return (
    <>
      <div className='flex flex-nowrap gap-0 p-2 bg-white w-full min-w-0'>
        {/* Resources Group */}
        <RibbonGroup title='Resources'>
          <RibbonButton
            icon={resourcesPaneVisible ? <EyeSlashIcon className='w-4 h-4 text-gray-700' /> : <EyeIcon className='w-4 h-4 text-gray-700' />}
            label={resourcesPaneVisible ? 'Hide Resources' : 'Show Resources'}
            onClick={handleToggleResourcesPane}
            tooltip={resourcesPaneVisible ? 'Hide Resources Pane' : 'Show Resources Pane'}
          />
        </RibbonGroup>

        {/* Assignment Group */}
        <RibbonGroup title='Assignment'>
          <RibbonButton
            icon={<PlusIcon className='w-4 h-4 text-gray-700' />}
            label='Assign'
            onClick={handleOpenAssignModal}
            tooltip='Assign resource to selected tasks'
            disabled={!hasSelectedTasks}
          />
          <RibbonButton
            icon={<MinusIcon className='w-4 h-4 text-gray-700' />}
            label='Unassign'
            onClick={handleUnassignResource}
            tooltip='Unassign resources from selected tasks'
            disabled={!hasSelectedTasks}
          />
        </RibbonGroup>
      </div>

      {/* Assign Resource Modal */}
      <MiniModal
        isOpen={assignModalOpen}
        onClose={handleCloseAssignModal}
        onSave={handleAssignResource}
        title="Assign Resource"
        saveLabel="Assign"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Select a resource to assign to {selectedTasks?.length || 0} selected task(s).
          </p>
          
          {/* Search Input */}
          <div>
            <label htmlFor="resourceSearch" className="block text-sm font-medium text-gray-700 mb-1">
              Search Resources
            </label>
            <input
              type="text"
              id="resourceSearch"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by name or role..."
              autoFocus
            />
          </div>

          {/* Resource List */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Resources
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
              {filteredResources.length === 0 ? (
                               <div className="p-4 text-center text-gray-500">
                 No resources found matching &quot;{searchQuery}&quot;
               </div>
              ) : (
                filteredResources.map(resource => (
                  <label
                    key={resource.id}
                    className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                      selectedResource === resource.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedResource"
                      value={resource.id}
                      checked={selectedResource === resource.id}
                      onChange={(e) => setSelectedResource(e.target.value)}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{resource.name}</div>
                      <div className="text-sm text-gray-500">{resource.role}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {resource.availability}% available
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {selectedResource && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="text-sm text-blue-800">
                <strong>Selected:</strong> {mockResources.find(r => r.id === selectedResource)?.name}
              </div>
            </div>
          )}
        </div>
      </MiniModal>
    </>
  );
};

export default AllocationTab;
