import React, { useState, useRef } from 'react';

const Tooltip = ({ children, content, position = 'top', disabled = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-600',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-600',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-600',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-600',
  };

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  if (disabled) {
    return (
      <div
        className='relative inline-block'
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        {isVisible && (
          <div className={`absolute z-50 ${positionClasses[position]}`}>
            <div className='bg-gray-600 text-white text-xs px-3 py-2 rounded-md shadow-lg whitespace-nowrap border border-gray-500'>
              Unavailable
              <div
                className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className='relative inline-block'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]}`}>
          <div className='bg-white text-gray-700 text-xs px-3 py-2 rounded-md shadow-lg whitespace-nowrap border border-gray-300'>
            {content}
            <div
              className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
