 
import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Tooltip from '../../common/Tooltip';

const RibbonDropdown = ({
  icon,
  label,
  options = [],
  onSelect,
  disabled = false,
  tooltip = '',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(options[0] || null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = option => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onSelect) {
      onSelect(option);
    }
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <Tooltip content={tooltip || label}>
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            project-button
            group
            flex flex-col items-center justify-center
            w-[48px] h-[36px]
            flex-shrink-0
            transition-all duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50 hover:border-blue-200'}
            ${isOpen ? 'bg-blue-50 border-blue-200' : ''}
            ${className}
          `}
          aria-label={label}
          title={tooltip || label}
        >
          <div className='text-[12px] text-gray-700 flex items-center justify-center w-full h-[14px] pt-0.5 group-hover:text-blue-600 transition-colors duration-200'>
            {icon}
          </div>
          <div className='text-[7px] uppercase tracking-wide text-gray-600 font-medium mt-1.5 leading-tight text-center flex items-center gap-0.5'>
            {label}
            <ChevronDownIcon className='w-2 h-2' />
          </div>
        </button>
      </Tooltip>

      {isOpen && (
        <div className='absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 min-w-[120px]'>
          {options.map((option, index) => (
            <button
              key={`option-${option.value || option.label || index}`}
              onClick={() => handleSelect(option)}
              className={`
                w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors duration-150
                ${selectedOption?.value === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                ${index === 0 ? 'rounded-t-md' : ''}
                ${index === options.length - 1 ? 'rounded-b-md' : ''}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RibbonDropdown;
