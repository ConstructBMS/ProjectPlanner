import React from 'react';

const RibbonToggle = ({
  icon,
  label,
  isActive = false,
  onClick,
  disabled = false,
  className = '',
  title = '',
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        disabled={disabled}
        title={title || label}
        className={`w-[40px] h-[40px] rounded flex flex-col items-center justify-center transition-all duration-200 ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-gray-100'
            : isActive
              ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
              : 'bg-gray-100 text-gray-700 hover:bg-blue-100 cursor-pointer'
        }`}
      >
        {/* Icon */}
        <div className='w-4 h-4 flex items-center justify-center'>{icon}</div>
      </button>

      {/* Label */}
      <div
        className={`text-[10px] font-medium uppercase mt-1 text-center ${
          isActive ? 'text-blue-600' : 'text-gray-500'
        }`}
      >
        {label}
      </div>
    </div>
  );
};

export default RibbonToggle;
