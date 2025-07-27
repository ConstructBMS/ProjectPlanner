import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { ChevronRightIcon, ChevronDownIcon, FolderIcon } from '@heroicons/react/24/outline';
import { useTaskContext } from '../context/TaskContext';

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

// TaskNode component for hierarchical tasks
const TaskNode = ({ task, depth = 0, onToggle, onSelect, selectedId }) => {
  const hasChildren = task.children && task.children.length > 0;
  const isSelected = selectedId === task.id;

  return (
    <div>
      <div
        className={`py-1 pl-[${1 + depth}rem] flex items-center gap-1 hover:bg-blue-100 cursor-pointer ${
          isSelected ? 'bg-blue-100' : ''
        }`}
        onClick={() => onSelect(task.id)}
      >
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
        {task.isGroup && <FolderIcon className="w-4 h-4 text-blue-500" />}
        <span className={`text-sm ${task.isGroup ? 'font-semibold' : ''} text-gray-800`}>
          {task.name}
        </span>
      </div>
      {hasChildren && task.isExpanded && (
        <div className="ml-2">
          {task.children.map((child) => (
            <TaskNode
              key={child.id}
              task={child}
              depth={depth + 1}
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

// Main SidebarTree component with forwardRef for external control
const SidebarTree = forwardRef((props, ref) => {
  const { getHierarchicalTasks, selectTask, selectedTaskId, toggleGroupCollapse } = useTaskContext();
  
  // Start with only the root programme node expanded
  const [expandedIds, setExpandedIds] = useState(new Set([
    'programme'
  ]));
  const [selectedId, setSelectedId] = useState(null);

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

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-700">Programme Tree</h3>
        <p className="text-xs text-gray-500 mt-1">Project structure and tasks</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
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

        {/* Tasks */}
        <div className="p-2">
          <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Tasks
          </h4>
          {hierarchicalTasks.length === 0 ? (
            <div className="text-xs text-gray-500 py-2">
              No tasks available
            </div>
          ) : (
            hierarchicalTasks.map((task) => (
              <TaskNode
                key={task.id}
                task={task}
                onToggle={handleTaskToggle}
                onSelect={handleTaskSelect}
                selectedId={selectedTaskId}
              />
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t px-4 py-2">
        <div className="text-xs text-gray-500">
          {hierarchicalTasks.length} task{hierarchicalTasks.length !== 1 ? 's' : ''} • 
          {selectedTaskId ? ` Selected: ${hierarchicalTasks.find(t => t.id === selectedTaskId)?.name || 'Unknown'}` : ' No task selected'}
        </div>
      </div>
    </div>
  );
});

SidebarTree.displayName = 'SidebarTree';

export default SidebarTree;
