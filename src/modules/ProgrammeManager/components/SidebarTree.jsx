import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

// Mock tree data structure with better hierarchy
const treeData = [
  {
    id: 'programme',
    label: 'Programme',
    children: [
      {
        id: 'resources',
        label: 'Resources',
        children: [
          {
            id: 'permanent',
            label: 'Permanent Resources',
            children: [
              { id: 'crane', label: 'Tower Crane' },
              { id: 'engineer', label: 'Services Engineer' },
              { id: 'supervisor', label: 'Site Supervisor' },
              { id: 'laborer', label: 'General Laborer' },
            ],
          },
          {
            id: 'temporary',
            label: 'Temporary Resources',
            children: [
              { id: 'scaffold', label: 'Scaffold Platforms' },
              { id: 'shoring', label: 'Shoring Systems' },
              { id: 'formwork', label: 'Formwork & Falsework' },
            ],
          },
        ],
      },
      {
        id: 'works',
        label: 'Works',
        children: [
          {
            id: 'permanentworks',
            label: 'Permanent Works',
            children: [
              { id: 'foundations', label: 'Foundations' },
              { id: 'structure', label: 'Structure' },
              { id: 'services', label: 'Services' },
              { id: 'finishes', label: 'Finishes' },
            ],
          },
          {
            id: 'tempworks',
            label: 'Temporary Works',
            children: [
              { id: 'scaffold_works', label: 'Scaffold Platforms' },
              { id: 'shoring_works', label: 'Shoring Systems' },
              { id: 'formwork_works', label: 'Formwork & Falsework' },
            ],
          },
        ],
      },
      {
        id: 'calendars',
        label: 'Calendars',
        children: [
          { id: 'working', label: 'Working Days' },
          { id: 'holidays', label: 'Holidays' },
          { id: 'shifts', label: 'Shift Patterns' },
        ],
      },
      {
        id: 'costcodes',
        label: 'Cost Codes',
        children: [
          { id: 'labor', label: 'Labor Costs' },
          { id: 'materials', label: 'Materials' },
          { id: 'equipment', label: 'Equipment' },
          { id: 'overhead', label: 'Overhead' },
        ],
      },
    ],
  },
];

// Individual tree node component
const TreeNode = ({
  node,
  depth = 0,
  expandedIds,
  selectedId,
  onToggle,
  onSelect
}) => {
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const hasChildren = node.children?.length > 0;

  const handleClick = (e) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggle(node.id);
    }
    onSelect(node.id);
  };

  return (
    <div>
      <div
        className={`text-sm text-gray-800 flex items-center gap-1 py-1 pl-[calc(1rem+(${depth}*1rem))] hover:bg-blue-100 hover:cursor-pointer transition-all duration-200 ${
          hasChildren ? 'font-medium' : 'font-normal'
        } ${isSelected ? 'bg-blue-200' : ''}`}
        onClick={handleClick}
      >
        {hasChildren && (
          <div className="w-4 h-4 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-gray-600" />
            )}
          </div>
        )}
        {!hasChildren && (
          <div className="w-4 h-4 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
          </div>
        )}
        <span className="truncate">{node.label}</span>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              selectedId={selectedId}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Main SidebarTree component with forwardRef for external control
const SidebarTree = forwardRef((props, ref) => {
  // Start with programme and main categories expanded
  const [expandedIds, setExpandedIds] = useState(new Set([
    'programme',
    'resources',
    'works',
    'calendars',
    'costcodes'
  ]));
  const [selectedId, setSelectedId] = useState(null);

  const toggleNode = (id) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectNode = (id) => {
    setSelectedId(id);
  };

  const expandAll = () => {
    const allIds = new Set();
    const collectIds = (nodes) => {
      nodes.forEach(node => {
        allIds.add(node.id);
        if (node.children) {
          collectIds(node.children);
        }
      });
    };
    collectIds(treeData);
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set(['programme'])); // Keep only root expanded
  };

  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    expandAll,
    collapseAll
  }));

  return (
    <div className="w-[240px] min-h-screen bg-slate-100 border-r border-gray-300 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-slate-200 border-b border-gray-300 px-4 py-3">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Programme Tree
        </h3>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto py-2">
        {treeData.map(node => (
          <TreeNode
            key={node.id}
            node={node}
            expandedIds={expandedIds}
            selectedId={selectedId}
            onToggle={toggleNode}
            onSelect={selectNode}
          />
        ))}
      </div>

      {/* Footer with info */}
      <div className="sticky bottom-0 bg-slate-200 border-t border-gray-300 px-4 py-2">
        <div className="text-xs text-gray-500">
          {expandedIds.size} expanded • {treeData.length} root items
        </div>
      </div>
    </div>
  );
});

SidebarTree.displayName = 'SidebarTree';

export default SidebarTree;
