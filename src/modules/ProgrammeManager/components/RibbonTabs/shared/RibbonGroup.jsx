import React from 'react';

const RibbonGroup = ({ title, children, disabled = false, isLast = false }) => {
  return (
    <div className={`flex flex-col items-center ${!isLast ? 'border-r border-gray-200 pr-3' : ''}`}>
      {/* Group Container */}
      <div
        className={`flex flex-col items-center p-2 bg-white shadow-sm rounded-md border border-gray-200 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <div className="flex gap-1 mb-2">{children}</div>
      </div>

      {/* Group Name Bar */}
      <div className="w-full mt-1">
        <div className="border-t border-gray-300 pt-1">
          <div className="text-[10px] font-medium text-gray-500 uppercase text-center tracking-wide">
            {title}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RibbonGroup;
