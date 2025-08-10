import { useEffect, useRef, useState } from 'react';
import {
  PencilIcon,
  TrashIcon,
  LinkIcon,
  StarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  ScissorsIcon,
} from '@heroicons/react/24/outline';

const ContextMenu = ({ isOpen, position, onClose, onAction, task = null }) => {
  const menuRef = useRef(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Adjust position to prevent menu from going off-screen
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newX = position.x;
      let newY = position.y;

      // Adjust horizontal position if menu would go off-screen
      if (newX + menuRect.width > viewportWidth) {
        newX = viewportWidth - menuRect.width - 10;
      }

      // Adjust vertical position if menu would go off-screen
      if (newY + menuRect.height > viewportHeight) {
        newY = viewportHeight - menuRect.height - 10;
      }

      // Ensure menu doesn't go above or to the left of viewport
      newX = Math.max(10, newX);
      newY = Math.max(10, newY);

      setAdjustedPosition({ x: newX, y: newY });
    }
  }, [isOpen, position]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Close menu when pressing Escape
    const handleEscape = event => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Prevent context menu from opening on the menu itself
  const handleContextMenu = e => {
    e.preventDefault();
  };

  const handleAction = action => {
    console.log(
      `Context menu action: ${action}`,
      task ? `for task: ${task.name}` : ''
    );
    onAction(action, task);
    onClose();
  };

  if (!isOpen) return null;

  const menuStyle = {
    position: 'fixed',
    left: adjustedPosition.x,
    top: adjustedPosition.y,
    zIndex: 50,
  };

  return (
    <div
      ref={menuRef}
      style={menuStyle}
      className='bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[180px]'
      onContextMenu={handleContextMenu}
    >
      {/* Edit Task */}
      <button
        onClick={() => handleAction('edit')}
        className='w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2 transition-colors'
      >
        <PencilIcon className='w-4 h-4' />
        <span>Edit Task</span>
      </button>

      {/* Delete Task */}
      <button
        onClick={() => handleAction('delete')}
        className='w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-red-50 flex items-center gap-2 transition-colors'
      >
        <TrashIcon className='w-4 h-4' />
        <span>Delete Task</span>
      </button>

      {/* Add Subtask */}
      <button
        onClick={() => handleAction('addSubtask')}
        className='w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-green-50 flex items-center gap-2 transition-colors'
      >
        <PlusIcon className='w-4 h-4' />
        <span>Add Subtask</span>
      </button>

      {/* Split Task */}
      <button
        onClick={() => handleAction('splitTask')}
        className='w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-2 transition-colors'
      >
        <ScissorsIcon className='w-4 h-4' />
        <span>{task?.isSplit ? 'Edit Segments' : 'Split Task'}</span>
      </button>

      {/* Divider */}
      <div className='border-t border-gray-100 my-1' />

      {/* Link To */}
      <button
        onClick={() => handleAction('link')}
        className='w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2 transition-colors'
      >
        <LinkIcon className='w-4 h-4' />
        <span>Link To...</span>
      </button>

      {/* Mark as Milestone */}
      <button
        onClick={() => handleAction('milestone')}
        className='w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-yellow-50 flex items-center gap-2 transition-colors'
      >
        <StarIcon className='w-4 h-4' />
        <span>Mark as Milestone</span>
      </button>

      {/* Divider */}
      <div className='border-t border-gray-100 my-1' />

      {/* Expand All */}
      <button
        onClick={() => handleAction('expandAll')}
        className='w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-green-50 flex items-center gap-2 transition-colors'
      >
        <ChevronDownIcon className='w-4 h-4' />
        <span>Expand All</span>
      </button>

      {/* Collapse All */}
      <button
        onClick={() => handleAction('collapseAll')}
        className='w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-green-50 flex items-center gap-2 transition-colors'
      >
        <ChevronUpIcon className='w-4 h-4' />
        <span>Collapse All</span>
      </button>
    </div>
  );
};

export default ContextMenu;
