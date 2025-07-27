import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const RibbonDropdown = ({ 
  icon, 
  label, 
  items = [], 
  onSelect, 
  disabled = false, 
  className = '',
  title = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleItemClick = (item) => {
    if (onSelect) {
      onSelect(item);
    }
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Main Button */}
      <button
        onClick={handleToggle}
        disabled={disabled}
        title={title || label}
        className={`w-[48px] h-[48px] bg-gray-100 rounded flex flex-col items-center justify-center hover:bg-blue-100 transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${isOpen ? 'bg-blue-100 ring-2 ring-blue-300' : ''}`}
      >
        {/* Icon */}
        <div className="w-5 h-5 flex items-center justify-center text-gray-700">
          {icon}
        </div>
        
        {/* Dropdown Arrow */}
        <ChevronDownIcon className="w-3 h-3 text-gray-500 mt-0.5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => handleItemClick(item)}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2 transition-colors"
                title={item.tooltip || item.label}
              >
                {item.icon && (
                  <div className="w-4 h-4 flex items-center justify-center text-gray-500">
                    {item.icon}
                  </div>
                )}
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className="ml-auto text-xs text-gray-400">
                    {item.shortcut}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Label */}
      <div className="text-[10px] font-medium text-gray-500 uppercase mt-1 text-center">
        {label}
      </div>
    </div>
  );
};

export default RibbonDropdown; 