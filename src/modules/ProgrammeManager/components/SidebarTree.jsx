import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { ChevronRightIcon, ChevronDownIcon, FolderIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useTaskContext } from '../context/TaskContext';
import ContextMenu from './ContextMenu';
import TaskModal from './TaskModal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Mock tree data for programme structure
const treeData = [
  {
    id: 'programme',
    label: 'Programme',
    children: [
      {
        id: 'resources',
        label: 'Permanent Resources',
        children: [
          { id: 'crane', label: 'Tower Crane' },
          { id: 'engineer', label: 'Services Engineer' },
        ],
      },
      {
        id: 'tempworks',
        label: 'Temporary Works',
        children: [
          { id: 'scaffold', label: 'Scaffold Platforms' },
        ],
      },
      {
        id: 'calendars',
        label: 'Calendars',
        children: [],
      },
      {
        id: 'costcodes',
        label: 'Cost Codes',
        children: [],
      },
    ],
  },
];

// TreeNode component for programme structure
const TreeNode = ({ node, depth = 0, expandedIds, onToggle, onSelect, selectedId }) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;

  return (
    <div>
      <div
        className={`py-1 pl-[${1 + depth}rem] flex items-center gap-1 hover:bg-blue-100 cursor-pointer ${
          isSelected ? 'bg-blue-100' : ''
        }`}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            className="w-4 h-4 flex items-center justify-center"
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-gray-600" />
            )}
          </button>
        )}
        <span className="text-sm text-gray-800">{node.label}</span>
      </div>
      {hasChildren && isExpanded && (
        <div className="ml-2">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Sortable TaskNode component for hierarchical tasks
const SortableTaskNode = ({ 
  task, 
  depth = 0, 
  onToggle, 
  onSelect, 
  selectedTaskId,
  selectedTaskIds,
  hoveredTaskId,
  onMultiSelect,
  onContextMenu,
  onDoubleClick,
  onHover,
  onHoverLeave
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const hasChildren = task.children && task.children.length > 0;
  const isSelected = selectedTaskId === task.id;
  const isMultiSelected = selectedTaskIds.includes(task.id);
  const isHovered = hoveredTaskId === task.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e, task);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    
    if (e.ctrlKey || e.metaKey) {
      // Ctrl+Click: Toggle selection
      onMultiSelect(task.id, 'toggle');
    } else if (e.shiftKey) {
      // Shift+Click: Select range
      onMultiSelect(task.id, 'range');
    } else {
      // Normal click: Select single
      onMultiSelect(task.id, 'single');
    }
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    onDoubleClick(task);
  };

  const handleMouseEnter = () => {
    onHover(task.id);
  };

  const handleMouseLeave = () => {
    onHoverLeave();
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`py-1 pl-[${1 + depth}rem] flex items-center gap-1 cursor-pointer transition-all duration-200 ${
          isSelected ? 'bg-blue-100 border-l-4 border-blue-500' : ''
        } ${
          isMultiSelected ? 'bg-blue-50 border-l-4 border-blue-400' : ''
        } ${
          isHovered ? 'bg-blue-50' : 'hover:bg-blue-100'
        } ${isDragging ? 'shadow-lg bg-white border border-blue-300 rounded scale-105' : ''}`}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="w-4 h-4 flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
          title="Drag to reorder task"
        >
          <Bars3Icon className="w-3 h-3" />
        </div>

        {/* Group Toggle Button */}
        {task.isGroup && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task.id);
            }}
            className="w-4 h-4 flex items-center justify-center"
          >
            {task.isExpanded ? (
              <ChevronDownIcon className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-gray-600" />
            )}
          </button>
        )}

        {/* Group Icon */}
        {task.isGroup && <FolderIcon className="w-4 h-4 text-blue-500" />}

        {/* Task Name */}
        <span className={`text-sm ${task.isGroup ? 'font-semibold' : ''} text-gray-800`}>
          {task.name}
        </span>

        {/* Selection indicator */}
        {isMultiSelected && (
          <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
        )}
      </div>
      {hasChildren && task.isExpanded && (
        <div className="ml-2">
          {task.children.map((child) => (
            <SortableTaskNode
              key={child.id}
              task={child}
              depth={depth + 1}
              onToggle={onToggle}
              onSelect={onSelect}
              selectedTaskId={selectedTaskId}
              selectedTaskIds={selectedTaskIds}
              hoveredTaskId={hoveredTaskId}
              onMultiSelect={onMultiSelect}
              onContextMenu={onContextMenu}
              onDoubleClick={onDoubleClick}
              onHover={onHover}
              onHoverLeave={onHoverLeave}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Drag Overlay component for visual feedback
const DragOverlayComponent = ({ task, depth = 0 }) => {
  const hasChildren = task.children && task.children.length > 0;

  return (
    <div className="py-1 pl-[${1 + depth}rem] flex items-center gap-1 bg-blue-50 border border-blue-300 rounded shadow-lg">
      {/* Drag Handle */}
      <div className="w-4 h-4 flex items-center justify-center text-gray-600">
        <Bars3Icon className="w-3 h-3" />
      </div>

      {/* Group Toggle Button */}
      {task.isGroup && (
        <div className="w-4 h-4 flex items-center justify-center">
          <ChevronDownIcon className="w-4 h-4 text-gray-600" />
        </div>
      )}

      {/* Group Icon */}
      {task.isGroup && <FolderIcon className="w-4 h-4 text-blue-500" />}

      {/* Task Name */}
      <span className={`text-sm ${task.isGroup ? 'font-semibold' : ''} text-gray-800`}>
        {task.name}
      </span>
    </div>
  );
};

// Bulk Actions Toolbar component
const BulkActionsToolbar = ({ selectedCount, onBulkAction }) => {
  if (selectedCount < 2) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2 z-40">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">
          {selectedCount} task{selectedCount !== 1 ? 's' : ''} selected
        </span>
        
        <div className="flex gap-2">
          <button
            onClick={() => onBulkAction('delete')}
            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            title="Delete selected tasks"
          >
            🗑️ Delete
          </button>
          
          <button
            onClick={() => onBulkAction('link')}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            title="Link selected tasks"
          >
            🔗 Link
          </button>
          
          <button
            onClick={() => onBulkAction('milestone')}
            className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
            title="Mark as milestones"
          >
            ✨ Milestones
          </button>
        </div>
      </div>
    </div>
  );
};

// Main SidebarTree component with forwardRef for external control
const SidebarTree = forwardRef((props, ref) => {
  const { 
    getHierarchicalTasks, 
    selectTask, 
    selectedTaskId, 
    hoveredTaskId,
    setHoveredTask,
    clearHoveredTask,
    toggleGroupCollapse,
    reorderTasksById,
    deleteTask,
    updateTask
  } = useTaskContext();
  
  // Start with only the root programme node expanded
  const [expandedIds, setExpandedIds] = useState(new Set([
    'programme'
  ]));
  const [selectedId, setSelectedId] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  // Multi-selection state
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState(-1);

  // Context menu state
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    task: null
  });

  // Task modal state
  const [taskModal, setTaskModal] = useState({
    isOpen: false,
    task: null
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const toggleNode = (id) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleNodeSelect = (id) => {
    setSelectedId(id);
    selectTask(id);
  };

  const handleTaskToggle = (taskId) => {
    toggleGroupCollapse(taskId);
  };

  const handleTaskSelect = (taskId) => {
    selectTask(taskId);
  };

  // Multi-selection logic
  const handleMultiSelect = (taskId, mode) => {
    const hierarchicalTasks = getHierarchicalTasks();
    const taskIndex = hierarchicalTasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) return;

    switch (mode) {
      case 'single':
        // Single selection - clear multi-selection
        setSelectedTaskIds([taskId]);
        setLastSelectedIndex(taskIndex);
        selectTask(taskId);
        break;
        
      case 'toggle':
        // Ctrl+Click - toggle selection
        setSelectedTaskIds(prev => {
          const isSelected = prev.includes(taskId);
          if (isSelected) {
            return prev.filter(id => id !== taskId);
          } else {
            return [...prev, taskId];
          }
        });
        setLastSelectedIndex(taskIndex);
        break;
        
      case 'range':
        // Shift+Click - select range
        if (lastSelectedIndex === -1) {
          // No previous selection, just select this one
          setSelectedTaskIds([taskId]);
          setLastSelectedIndex(taskIndex);
        } else {
          // Select range from last selected to current
          const start = Math.min(lastSelectedIndex, taskIndex);
          const end = Math.max(lastSelectedIndex, taskIndex);
          const rangeIds = hierarchicalTasks
            .slice(start, end + 1)
            .map(t => t.id);
          setSelectedTaskIds(rangeIds);
        }
        break;
    }
  };

  // Clear selection when clicking empty space
  const handleEmptySpaceClick = () => {
    setSelectedTaskIds([]);
    setLastSelectedIndex(-1);
  };

  // Handle escape key to clear selection
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setSelectedTaskIds([]);
        setLastSelectedIndex(-1);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Handle context menu
  const handleContextMenu = (e, task) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      task: task
    });
  };

  const closeContextMenu = () => {
    setContextMenu({
      isOpen: false,
      position: { x: 0, y: 0 },
      task: null
    });
  };

  const handleContextMenuAction = (action, task) => {
    switch (action) {
      case 'edit':
        console.log('Edit task:', task?.name);
        // Open task modal for editing
        setTaskModal({
          isOpen: true,
          task: task
        });
        break;
      case 'delete':
        if (task) {
          console.log('Delete task:', task.name);
          deleteTask(task.id);
        }
        break;
      case 'link':
        console.log('Link task:', task?.name);
        // TODO: Activate linking mode
        break;
      case 'milestone':
        if (task) {
          console.log('Mark as milestone:', task.name);
          updateTask(task.id, { isMilestone: true });
        }
        break;
      case 'expandAll':
        console.log('Expand all tasks');
        // TODO: Implement expand all functionality
        break;
      case 'collapseAll':
        console.log('Collapse all tasks');
        // TODO: Implement collapse all functionality
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  // Handle double-click to open task modal
  const handleTaskDoubleClick = (task) => {
    console.log('Double-clicked task:', task.name);
    setTaskModal({
      isOpen: true,
      task: task
    });
  };

  // Handle task modal close
  const closeTaskModal = () => {
    setTaskModal({
      isOpen: false,
      task: null
    });
  };

  // Handle task modal save
  const handleTaskSave = (updatedTask) => {
    console.log('Saving task from modal:', updatedTask);
    updateTask(updatedTask.id, updatedTask);
  };

  // Bulk actions
  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action} on ${selectedTaskIds.length} tasks:`, selectedTaskIds);
    
    switch (action) {
      case 'delete':
        selectedTaskIds.forEach(taskId => {
          deleteTask(taskId);
        });
        setSelectedTaskIds([]);
        setLastSelectedIndex(-1);
        break;
        
      case 'link':
        // TODO: Implement bulk linking
        console.log('Bulk linking not yet implemented');
        break;
        
      case 'milestone':
        selectedTaskIds.forEach(taskId => {
          updateTask(taskId, { isMilestone: true });
        });
        break;
    }
  };

  // Handle drag start
  const handleDragStart = (event) => {
    const { active } = event;
    const task = getHierarchicalTasks().find(t => t.id === active.id);
    setActiveTask(task);
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;

    setActiveTask(null);

    if (active.id !== over.id) {
      const sourceId = active.id;
      const destinationId = over.id;
      
      // Reorder the task
      reorderTasksById(sourceId, destinationId, 'after');
    }
  };

  // Expose methods via forwardRef
  useImperativeHandle(ref, () => ({
    expandAll: () => {
      const allIds = new Set();
      const addIds = (nodes) => {
        nodes.forEach(node => {
          allIds.add(node.id);
          if (node.children) {
            addIds(node.children);
          }
        });
      };
      addIds(treeData);
      setExpandedIds(allIds);
    },
    collapseAll: () => {
      setExpandedIds(new Set(['programme']));
    }
  }));

  const hierarchicalTasks = getHierarchicalTasks();
  const taskIds = hierarchicalTasks.map(task => task.id);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-700">Programme Tree</h3>
        <p className="text-xs text-gray-500 mt-1">Project structure and tasks</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto" onClick={handleEmptySpaceClick}>
        {/* Programme Structure */}
        <div className="p-2">
          <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Programme Structure
          </h4>
          {treeData.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              expandedIds={expandedIds}
              onToggle={toggleNode}
              onSelect={handleNodeSelect}
              selectedId={selectedId}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mx-2 my-2"></div>

        {/* Tasks with Drag and Drop */}
        <div className="p-2">
          <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Tasks
          </h4>
          {hierarchicalTasks.length === 0 ? (
            <div className="text-xs text-gray-500 py-2">
              No tasks available
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={taskIds}
                strategy={verticalListSortingStrategy}
              >
                {hierarchicalTasks.map((task) => (
                  <SortableTaskNode
                    key={task.id}
                    task={task}
                    onToggle={handleTaskToggle}
                    onSelect={handleTaskSelect}
                    selectedTaskId={selectedTaskId}
                    selectedTaskIds={selectedTaskIds}
                    hoveredTaskId={hoveredTaskId}
                    onMultiSelect={handleMultiSelect}
                    onContextMenu={handleContextMenu}
                    onDoubleClick={handleTaskDoubleClick}
                    onHover={setHoveredTask}
                    onHoverLeave={clearHoveredTask}
                  />
                ))}
              </SortableContext>
              
              <DragOverlay dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                  styles: {
                    active: {
                      opacity: '0.5',
                    },
                  },
                }),
              }}>
                {activeTask ? <DragOverlayComponent task={activeTask} /> : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t px-4 py-2">
        <div className="text-xs text-gray-500">
          {hierarchicalTasks.length} task{hierarchicalTasks.length !== 1 ? 's' : ''} • 
          {selectedTaskIds.length > 0 ? ` ${selectedTaskIds.length} selected` : 
           selectedTaskId ? ` Selected: ${hierarchicalTasks.find(t => t.id === selectedTaskId)?.name || 'Unknown'}` : ' No task selected'} •
          💡 Right-click for context menu • Double-click to edit • Ctrl+Click for multi-select • Drag ☰ to reorder
        </div>
      </div>

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={closeContextMenu}
        onAction={handleContextMenuAction}
        task={contextMenu.task}
      />

      {/* Task Modal */}
      <TaskModal
        task={taskModal.task}
        isOpen={taskModal.isOpen}
        onClose={closeTaskModal}
        onSave={handleTaskSave}
      />

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedTaskIds.length}
        onBulkAction={handleBulkAction}
      />
    </div>
  );
});

SidebarTree.displayName = 'SidebarTree';

export default SidebarTree;
