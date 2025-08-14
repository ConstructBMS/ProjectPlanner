import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { usePlannerStore } from '../../state/plannerStore';
import { buildTree, flattenTree, TreeNode } from './buildTree';
import './ProgrammeTree.css';

const ProgrammeTree = () => {
  const { 
    tasks, 
    selectedTaskIds, 
    selectOne, 
    toggleSelection, 
    selectRange, 
    lastSelectedTaskId 
  } = usePlannerStore();

  const [expandedNodes, setExpandedNodes] = useState(new Set<string>());
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [flattenedNodes, setFlattenedNodes] = useState<TreeNode[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [virtualizationEnabled, setVirtualizationEnabled] = useState(false);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const itemHeight = 32; // Height of each tree item

  // Build tree structure from tasks
  useEffect(() => {
    const nodes = buildTree(tasks);
    setTreeNodes(nodes);
    
    // Auto-expand root nodes
    const rootExpanded = new Set<string>();
    nodes.forEach(node => {
      if (node.children.length > 0) {
        rootExpanded.add(node.id);
      }
    });
    setExpandedNodes(rootExpanded);
  }, [tasks]);

  // Flatten tree for rendering
  useEffect(() => {
    const flattened = flattenTree(treeNodes, expandedNodes);
    setFlattenedNodes(flattened);
    setVirtualizationEnabled(flattened.length > 300);
  }, [treeNodes, expandedNodes]);

  // Handle virtualization scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!virtualizationEnabled) return;
    
    const scrollTop = e.currentTarget.scrollTop;
    const containerHeight = e.currentTarget.clientHeight;
    
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + 5, // Add buffer
      flattenedNodes.length
    );
    
    setVisibleRange({ start: Math.max(0, start - 5), end });
  }, [virtualizationEnabled, flattenedNodes.length, itemHeight]);

  // Toggle node expansion
  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }
      return newExpanded;
    });
  }, []);

  // Handle node click for selection
  const handleNodeClick = useCallback((e: React.MouseEvent, node: TreeNode) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.shiftKey && lastSelectedTaskId) {
      // Range selection
      selectRange(lastSelectedTaskId, node.id);
    } else if (e.ctrlKey || e.metaKey) {
      // Toggle selection
      toggleSelection(node.id);
    } else {
      // Single selection
      selectOne(node.id);
    }
  }, [selectOne, toggleSelection, selectRange, lastSelectedTaskId]);

  // Handle expand/collapse click
  const handleExpandClick = useCallback((e: React.MouseEvent, node: TreeNode) => {
    e.preventDefault();
    e.stopPropagation();
    toggleNode(node.id);
  }, [toggleNode]);

  // Get visible nodes for virtualization
  const visibleNodes = useMemo(() => {
    if (!virtualizationEnabled) {
      return flattenedNodes;
    }
    return flattenedNodes.slice(visibleRange.start, visibleRange.end);
  }, [flattenedNodes, virtualizationEnabled, visibleRange]);

  // Calculate total height for virtualization
  const totalHeight = useMemo(() => {
    return flattenedNodes.length * itemHeight;
  }, [flattenedNodes.length]);

  // Calculate offset for virtualization
  const offsetY = useMemo(() => {
    return visibleRange.start * itemHeight;
  }, [visibleRange.start]);

  // Render a single tree node
  const renderNode = useCallback((node: TreeNode, index: number) => {
    const isSelected = selectedTaskIds.has(node.id);
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const indent = node.level * 20; // 20px indent per level

    return (
      <div
        key={`${node.id}-${index}`}
        className={`tree-node ${isSelected ? 'selected' : ''}`}
        style={{
          paddingLeft: `${indent + 8}px`,
          height: `${itemHeight}px`,
          transform: virtualizationEnabled ? `translateY(${offsetY}px)` : undefined
        }}
        onClick={(e) => handleNodeClick(e, node)}
      >
        <div className="tree-node-content">
          {hasChildren ? (
            <button
              className="expand-button"
              onClick={(e) => handleExpandClick(e, node)}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="expand-spacer" />
          )}
          
          <span className="node-name" title={node.name}>
            {node.name}
          </span>
          
          {node.task.wbs && (
            <span className="node-wbs" title={`WBS: ${node.task.wbs}`}>
              {node.task.wbs}
            </span>
          )}
        </div>
      </div>
    );
  }, [selectedTaskIds, expandedNodes, handleNodeClick, handleExpandClick, virtualizationEnabled, offsetY]);

  // Render empty state
  if (tasks.length === 0) {
    return (
      <div className="programme-tree-empty">
        <div className="empty-content">
          <div className="empty-icon">📋</div>
          <div className="empty-title">No Tasks</div>
          <div className="empty-description">
            Tasks will appear here once loaded
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="programme-tree">
      <div className="tree-header">
        <h3 className="tree-title">Programme Tree</h3>
        <div className="tree-stats">
          {flattenedNodes.length} tasks
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="tree-container"
        onScroll={handleScroll}
        style={{
          height: virtualizationEnabled ? 'calc(100vh - 200px)' : 'auto',
          overflowY: virtualizationEnabled ? 'auto' : 'visible'
        }}
      >
        {virtualizationEnabled ? (
          <div style={{ height: totalHeight, position: 'relative' }}>
            {visibleNodes.map((node, index) => renderNode(node, visibleRange.start + index))}
          </div>
        ) : (
          <div className="tree-nodes">
            {flattenedNodes.map((node, index) => renderNode(node, index))}
          </div>
        )}
      </div>
      
      {virtualizationEnabled && (
        <div className="tree-footer">
          <div className="virtualization-info">
            Showing {visibleRange.start + 1}-{Math.min(visibleRange.end, flattenedNodes.length)} of {flattenedNodes.length} tasks
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgrammeTree;
