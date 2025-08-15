import { useState, useEffect, useMemo } from 'react';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { buildTree } from './buildTree';
import { usePlannerSelector } from '../../hooks/usePlannerSelector';
import { 
  getTreeExpanded, 
  setTreeExpanded
} from '../../utils/prefs';

const TreeNode = ({ 
  node, 
  level = 0, 
  expanded, 
  onToggle, 
  onSelect, 
  selectedIds,
  projectId 
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const isSelected = selectedIds.has(node.id);
  
  const handleToggle = (e) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggle(node.id);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(node.id);
  };

  return (
    <div className="tree-node">
      <div 
        className={`tree-row flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
          isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        {hasChildren ? (
          <button
            onClick={handleToggle}
            className="mr-1 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </button>
        ) : (
          <div className="w-6 mr-1" />
        )}
        
        <span className={`text-sm ${isSelected ? 'font-medium' : ''}`}>
          {node.name}
        </span>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="tree-children">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              selectedIds={selectedIds}
              projectId={projectId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ProgrammeTree = () => {
  const { tasks, selectedTaskIds, currentProjectId } = usePlannerSelector(s => ({
    tasks: s.tasks,
    selectedTaskIds: s.selectedTaskIds,
    currentProjectId: s.currentProjectId
  }));

  const [expanded, setExpanded] = useState(new Set());

  // Load expanded state when project changes
  useEffect(() => {
    if (currentProjectId) {
      const savedExpanded = getTreeExpanded(currentProjectId);
      setExpanded(savedExpanded);
    }
  }, [currentProjectId]);

  // Build tree from tasks
  const treeData = useMemo(() => {
    return buildTree(tasks);
  }, [tasks]);

  const handleToggle = (nodeId) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpanded(newExpanded);
    
    // Persist to localStorage
    if (currentProjectId) {
      setTreeExpanded(currentProjectId, newExpanded);
    }
  };

  const handleSelect = (nodeId) => {
    // Only select actual task nodes, not group nodes
    if (!nodeId.includes('__grp')) {
      // Use the store's selectOne action
      const store = usePlannerSelector.getState();
      store.selectOne(nodeId);
    }
  };

  if (!currentProjectId) {
    return (
      <div className="p-4 text-gray-500 dark:text-gray-400">
        No project selected
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="p-4 text-gray-500 dark:text-gray-400">
        No tasks available
      </div>
    );
  }

  return (
    <div className="programme-tree h-full overflow-auto">
      <div className="tree-header p-2 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Programme Tree
        </h3>
      </div>
      
      <div className="tree-content">
        {treeData.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            expanded={expanded}
            onToggle={handleToggle}
            onSelect={handleSelect}
            selectedIds={selectedTaskIds}
            projectId={currentProjectId}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgrammeTree;
