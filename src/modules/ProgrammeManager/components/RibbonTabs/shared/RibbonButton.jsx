import React from "react";
import Tooltip from "../../common/Tooltip";

const RibbonButton = ({ 
  icon, 
  label, 
  onClick, 
  disabled = false, 
  tooltip = "", 
  className = "" 
}) => {
  return (
    <Tooltip content={tooltip || label}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          asta-button
          flex flex-col items-center justify-center
          w-[36px] h-[36px]
          rounded-[2px]
          transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50 hover:border-blue-300'}
          ${className}
        `}
        aria-label={label}
        title={tooltip || label}
      >
        <div className="text-[14px] text-gray-700">
          {icon}
        </div>
        <div className="text-[8px] uppercase tracking-wide text-gray-600 font-medium mt-1">
          {label}
        </div>
      </button>
    </Tooltip>
  );
};

export default RibbonButton;
