import React, { useState } from 'react';

// Mock tree data structure
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
          { id: 'supervisor', label: 'Site Supervisor' },
          { id: 'laborer', label: 'General Laborer' },
        ],
      },
      {
        id: 'tempworks',
        label: 'Temporary Works',
        children: [
          { id: 'scaffold', label: 'Scaffold Platforms' },
          { id: 'shoring', label: 'Shoring Systems' },
          { id: 'formwork', label: 'Formwork & Falsework' },
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
    ],
  },
];

// ChevronRight icon component (since we don't have heroicons installed)
const ChevronRightIcon = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M9 5l7 7-7 7'
    />
  </svg>
);

// Individual tree node component
const TreeNode = ({ node, depth = 0, expandedIds, onToggle }) => {
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children?.length > 0;

  const handleClick = e => {
    e.stopPropagation();
    if (hasChildren) {
      onToggle(node.id);
    }
  };

  return (
    <div>
      <div
        className={`text-sm text-gray-800 flex items-center gap-1 py-1 pl-[calc(1rem+(${depth}*1rem))] hover:bg-blue-100 hover:cursor-pointer transition-all duration-200 ${
          hasChildren ? 'font-medium' : 'font-normal'
        }`}
        onClick={handleClick}
      >
        {hasChildren && (
          <ChevronRightIcon
            className={`w-4 h-4 transform transition-transform duration-200 ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        )}
        {!hasChildren && (
          <div className='w-4 h-4 flex items-center justify-center'>
            <div className='w-1.5 h-1.5 bg-gray-400 rounded-full'></div>
          </div>
        )}
        <span className='truncate'>{node.label}</span>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Main SidebarTree component
const SidebarTree = () => {
  const [expandedIds, setExpandedIds] = useState(new Set(['programme'])); // Start with programme expanded

  const toggleNode = id => {
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

  return (
    <div className='w-[280px] min-h-screen bg-slate-100 border-r border-gray-300 overflow-y-auto'>
      {/* Header */}
      <div className='sticky top-0 bg-slate-200 border-b border-gray-300 px-4 py-3'>
        <h3 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>
          Programme Tree
        </h3>
      </div>

      {/* Tree Content */}
      <div className='py-2'>
        {treeData.map(node => (
          <TreeNode
            key={node.id}
            node={node}
            expandedIds={expandedIds}
            onToggle={toggleNode}
          />
        ))}
      </div>

      {/* Footer with info */}
      <div className='sticky bottom-0 bg-slate-200 border-t border-gray-300 px-4 py-2'>
        <div className='text-xs text-gray-500'>
          {expandedIds.size} expanded • {treeData.length} root items
        </div>
      </div>
    </div>
  );
};

export default SidebarTree;
