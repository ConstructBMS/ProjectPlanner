import React, {
  useState,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTaskContext } from '../context/TaskContext';
import { useViewContext } from '../context/ViewContext';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  FolderIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';

// Import milestone shape utilities
import {
  getTaskMilestoneShape,
  getMilestoneColor,
  createMilestoneShapeComponent,
} from '../utils/milestoneShapeUtils';

// Mock tree data for programme structure
// const treeData = [
//   {
//     id: 'programme',
//     label: 'Programme',
//     children: [
//       {
//         id: 'resources',
//         label: 'Permanent Resources',
//         children: [
//           { id: 'crane', label: 'Tower Crane' },
//           { id: 'engineer', label: 'Services Engineer' },
//         ],
//       },
//       {
//         id: 'tempworks',
//         label: 'Temporary Works',
//         children: [{ id: 'scaffold', label: 'Scaffold Platforms' }],
//       },
//       {
//         id: 'calendars',
//         label: 'Calendars',
//         children: [],
//       },
//       {
//         id: 'costcodes',
//         label: 'Cost Codes',
//         children: [],
//       },
//     ],
//   },
// ];

// Memoized tree node component
const TreeNode = React.memo(
  ({
    task,
    level = 0,
    rowNumber,
    isExpanded,
    isSelected,
    isMultiSelected,
    isHovered,
    onToggle,
    onHover,
    onHoverLeave,
    onContextMenu,
    onMultiSelect,
  }) => {
    const { viewState } = useViewContext();
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: task.id });

    const hasChildren = task.children && task.children.length > 0;

    const handleClick = useCallback(
      e => {
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
      },
      [task.id, onMultiSelect]
    );

    const handleDoubleClick = useCallback(e => {
      e.stopPropagation();
    }, []);

    const handleContextMenu = useCallback(
      e => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e, task);
      },
      [onContextMenu, task]
    );

    const nodeContent = useMemo(() => {
      return (
        <div
          ref={setNodeRef}
          style={{
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.5 : 1,
          }}
          className={`
            flex items-center gap-2 px-2 py-1 text-sm cursor-pointer select-none
            ${isSelected ? 'bg-blue-100 text-blue-900' : ''}
            ${isMultiSelected ? 'bg-blue-50 text-blue-800' : ''}
            ${isHovered ? 'bg-gray-100' : ''}
            hover:bg-gray-50 transition-colors duration-150
          `}
          {...attributes}
          {...listeners}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onMouseEnter={() => onHover(task.id)}
          onMouseLeave={() => onHoverLeave(task.id)}
          onContextMenu={handleContextMenu}
        >
          {/* Row Number */}
          <span className='text-sm text-gray-400 pr-2 flex-shrink-0'>
            {rowNumber}
          </span>

          {/* Indentation */}
          <div className='flex-shrink-0' style={{ width: `${level * 16}px` }} />

          {/* Expand/Collapse button */}
          {hasChildren && (
            <button
              onClick={e => {
                e.stopPropagation();
                onToggle(task.id);
              }}
              className='p-1 hover:bg-gray-200 rounded transition-colors duration-150'
            >
              {isExpanded ? (
                <ChevronDownIcon className='w-3 h-3 text-gray-600' />
              ) : (
                <ChevronRightIcon className='w-3 h-3 text-gray-600' />
              )}
            </button>
          )}

          {/* Icon */}
          <div className='flex-shrink-0'>
            {task.type === 'milestone' || task.isMilestone ? (
              createMilestoneShapeComponent(
                getTaskMilestoneShape(task, viewState.globalMilestoneShape),
                'w-4 h-4',
                getMilestoneColor(
                  {
                    ...task,
                    selected: isSelected,
                    hovered: isHovered,
                  },
                  getTaskMilestoneShape(task, viewState.globalMilestoneShape)
                )
              )
            ) : task.isGroup ? (
              <FolderIcon className='w-4 h-4 text-blue-600' />
            ) : (
              <DocumentIcon className='w-4 h-4 text-gray-500' />
            )}
          </div>

          {/* Label */}
          <span className='flex-1 truncate'>{task.name || task.label}</span>
        </div>
      );
    }, [
      setNodeRef,
      transform,
      transition,
      isDragging,
      isSelected,
      isMultiSelected,
      isHovered,
      level,
      rowNumber,
      hasChildren,
      isExpanded,
      task,
      onToggle,
      onHover,
      onHoverLeave,
      handleClick,
      handleDoubleClick,
      handleContextMenu,
      attributes,
      listeners,
    ]);

    return nodeContent;
  }
);

TreeNode.displayName = 'TreeNode';

// Memoized tree component
const SidebarTree = forwardRef((props, ref) => {
  const {
    getHierarchicalTasks,
    getVisibleTasks,
    selectedTaskId,
    hoveredTaskId,
    setHoveredTask,
    clearHoveredTask,
    reorderTasksById,
    deleteTask,
    updateTask,
  } = useTaskContext();

  const { viewState } = useViewContext();

  // Start with only the root programme node expanded
  const [expandedIds, setExpandedIds] = useState(new Set(['programme']));

  // Multi-selection state
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState(-1);

  // Context menu state
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    task: null,
  });

  // Task modal state
  const [taskModal, setTaskModal] = useState({
    isOpen: false,
    task: null,
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

  const toggleNode = useCallback(id => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Multi-selection logic
  const handleMultiSelect = useCallback(
    (taskId, mode) => {
      const allTasks = getVisibleTasks(viewState.taskFilter);
      const currentIndex = allTasks.findIndex(task => task.id === taskId);

      switch (mode) {
        case 'single':
          setSelectedTaskIds([taskId]);
          setLastSelectedIndex(currentIndex);
          break;

        case 'toggle':
          setSelectedTaskIds(prev => {
            if (prev.includes(taskId)) {
              return prev.filter(id => id !== taskId);
            } else {
              return [...prev, taskId];
            }
          });
          setLastSelectedIndex(currentIndex);
          break;

        case 'range':
          if (lastSelectedIndex === -1) {
            setSelectedTaskIds([taskId]);
            setLastSelectedIndex(currentIndex);
          } else {
            const start = Math.min(lastSelectedIndex, currentIndex);
            const end = Math.max(lastSelectedIndex, currentIndex);
            const rangeTasks = allTasks
              .slice(start, end + 1)
              .map(task => task.id);
            setSelectedTaskIds(rangeTasks);
          }
          break;

        default:
          break;
      }
    },
    [getVisibleTasks, viewState.taskFilter, lastSelectedIndex]
  );

  const handleContextMenu = useCallback((e, task) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      task,
    });
  }, []);

  const handleContextMenuAction = useCallback(
    (action, task) => {
      switch (action) {
        case 'edit':
          setTaskModal({
            isOpen: true,
            task,
          });
          break;
        case 'delete':
          if (task) {
            deleteTask(task.id);
          }
          break;
        case 'link':
          // TODO: Activate linking mode
          break;
        case 'milestone':
          if (task) {
            updateTask(task.id, { type: 'milestone', isMilestone: true });
          }
          break;
        case 'expandAll':
          // TODO: Implement expand all functionality
          break;
        case 'collapseAll':
          // TODO: Implement collapse all functionality
          break;
        default:
          break;
      }
    },
    [deleteTask, updateTask]
  );

  // Handle drag start
  const handleDragStart = useCallback(
    event => {
      const { active } = event;
      getHierarchicalTasks().find(t => t.id === active.id);
    },
    [getHierarchicalTasks]
  );

  // Handle drag end
  const handleDragEnd = useCallback(
    event => {
      const { active, over } = event;

      if (active.id !== over.id) {
        const sourceId = active.id;
        const destinationId = over.id;

        // Reorder the task
        reorderTasksById(sourceId, destinationId, 'after');
      }
    },
    [reorderTasksById]
  );

  // Expose methods via forwardRef
  useImperativeHandle(ref, () => ({
    expandAll: () => {
      // Collect all node IDs that have children
      const collectAllIds = nodes => {
        const ids = new Set();
        nodes.forEach(node => {
          if (node.children && node.children.length > 0) {
            ids.add(node.id);
            ids.add(...collectAllIds(node.children));
          }
        });
        return ids;
      };

      const allIds = collectAllIds(treeData);
      setExpandedIds(allIds);
    },
    collapseAll: () => {
      setExpandedIds(new Set(['programme']));
    },
  }));

  // Memoize expensive computations
  const hierarchicalTasks = useMemo(
    () => getHierarchicalTasks(),
    [getHierarchicalTasks]
  );
  const filteredTasks = useMemo(
    () => getVisibleTasks(viewState.taskFilter),
    [getVisibleTasks, viewState.taskFilter]
  );
  const taskIds = useMemo(
    () => filteredTasks.map(task => task.id),
    [filteredTasks]
  );

  // Memoize the tree data
  const treeData = useMemo(() => {
    const buildTreeData = (tasks, level = 0) => {
      return tasks.map(task => ({
        ...task,
        level,
        children: task.children ? buildTreeData(task.children, level + 1) : [],
      }));
    };

    return buildTreeData(hierarchicalTasks);
  }, [hierarchicalTasks]);

  // Memoize the rendered tree nodes
  const renderedNodes = useMemo(() => {
    // Flatten tree to get all visible nodes with row numbers
    const flattenTree = (nodes, level = 0, rowCounter = { value: 0 }) => {
      const flattened = [];
      nodes.forEach(node => {
        rowCounter.value++;
        flattened.push({ ...node, rowNumber: rowCounter.value, level });

        if (
          expandedIds.has(node.id) &&
          node.children &&
          node.children.length > 0
        ) {
          flattened.push(...flattenTree(node.children, level + 1, rowCounter));
        }
      });
      return flattened;
    };

    const flattenedNodes = flattenTree(treeData);

    // Render flattened nodes directly
    return flattenedNodes.map(node => {
      const isExpanded = expandedIds.has(node.id);
      const isSelected = selectedTaskId === node.id;
      const isMultiSelected = selectedTaskIds.includes(node.id);
      const isHovered = hoveredTaskId === node.id;

      return (
        <TreeNode
          key={node.id}
          task={node}
          level={node.level}
          rowNumber={node.rowNumber}
          isExpanded={isExpanded}
          isSelected={isSelected}
          isMultiSelected={isMultiSelected}
          isHovered={isHovered}
          onToggle={toggleNode}
          onHover={setHoveredTask}
          onHoverLeave={clearHoveredTask}
          onContextMenu={handleContextMenu}
          onMultiSelect={handleMultiSelect}
        />
      );
    });
  }, [
    treeData,
    expandedIds,
    selectedTaskId,
    selectedTaskIds,
    hoveredTaskId,
    toggleNode,
    setHoveredTask,
    clearHoveredTask,
    handleContextMenu,
    handleMultiSelect,
  ]);

  return (
    <div className='asta-tree h-full overflow-auto'>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {renderedNodes}
        </SortableContext>
      </DndContext>

      {/* Context Menu */}
      {contextMenu.isOpen && (
        <div
          className='fixed z-50 bg-white border border-gray-300 rounded shadow-lg py-1'
          style={{
            left: contextMenu.position.x,
            top: contextMenu.position.y,
          }}
        >
          <button
            className='block w-full px-4 py-2 text-left text-sm hover:bg-gray-100'
            onClick={() => handleContextMenuAction('edit', contextMenu.task)}
          >
            Edit Task
          </button>
          <button
            className='block w-full px-4 py-2 text-left text-sm hover:bg-gray-100'
            onClick={() => handleContextMenuAction('delete', contextMenu.task)}
          >
            Delete Task
          </button>
          <button
            className='block w-full px-4 py-2 text-left text-sm hover:bg-gray-100'
            onClick={() => handleContextMenuAction('link', contextMenu.task)}
          >
            Link Task
          </button>
          <button
            className='block w-full px-4 py-2 text-left text-sm hover:bg-gray-100'
            onClick={() =>
              handleContextMenuAction('milestone', contextMenu.task)
            }
          >
            Mark as Milestone
          </button>
        </div>
      )}

      {/* Task Modal */}
      {taskModal.isOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold mb-4'>Edit Task</h3>
            {/* Task form would go here */}
            <div className='flex justify-end gap-2'>
              <button
                className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded'
                onClick={() => setTaskModal({ isOpen: false, task: null })}
              >
                Cancel
              </button>
              <button
                className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
                onClick={() => {
                  if (taskModal.task) {
                    updateTask(taskModal.task.id, taskModal.task);
                  }
                  setTaskModal({ isOpen: false, task: null });
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

SidebarTree.displayName = 'SidebarTree';

export default SidebarTree;
