import React from 'react';

const RibbonGroup = ({ title, children, disabled = false, isLast = false }) => {
  return (
    <div className={`flex flex-col items-center ${!isLast ? 'border-r border-gray-200 pr-1' : ''}`}>
      {/* Group Container */}
      <div
        className={`flex flex-col items-center p-1 bg-white border border-gray-200 min-h-[88px] ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <div className="flex gap-x-1 mb-4">{children}</div>
      </div>

      {/* Group Name Bar */}
      <div className="w-full mt-1">
        <div className="text-[9px] font-semibold text-gray-600 uppercase tracking-wide text-center border-t pt-1">
          {title}
        </div>
      </div>
    </div>
  );
};

export default RibbonGroup;
