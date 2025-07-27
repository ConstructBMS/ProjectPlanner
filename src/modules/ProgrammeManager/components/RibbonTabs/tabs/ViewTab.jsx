import React from 'react';

const ViewTab = () => {
  return (
    <div className='flex flex-row gap-3 p-2 bg-[#f9f9f9] border-t border-gray-200'>
      {/* View Group */}
      <div className='flex flex-col items-center w-fit p-2 bg-white shadow-sm rounded-md'>
        <div className='w-[48px] h-[48px] bg-gray-100 rounded flex items-center justify-center mb-1'>
          <span>📊</span>
        </div>
        <div className='text-[10px] font-medium text-gray-500 uppercase'>View</div>
      </div>

      {/* Clipboard Group (Disabled) */}
      <div className='flex flex-col items-center w-fit p-2 bg-white shadow-sm rounded-md opacity-50 cursor-not-allowed'>
        <div className='flex gap-2'>
          <div className='w-[48px] h-[48px] bg-gray-100 flex items-center justify-center rounded'>✂️</div>
          <div className='w-[48px] h-[48px] bg-gray-100 flex items-center justify-center rounded'>📋</div>
          <div className='w-[48px] h-[48px] bg-gray-100 flex items-center justify-center rounded'>📎</div>
        </div>
        <div className='text-[10px] font-medium text-gray-500 uppercase mt-1'>Clipboard</div>
      </div>

      {/* Font Group (Disabled) */}
      <div className='flex flex-col items-center w-fit p-2 bg-white shadow-sm rounded-md opacity-50 cursor-not-allowed'>
        <div className='flex gap-1 mb-1'>
          <div className='w-[24px] h-[24px] bg-gray-100 flex items-center justify-center rounded text-xs'>B</div>
          <div className='w-[24px] h-[24px] bg-gray-100 flex items-center justify-center rounded text-xs italic'>I</div>
          <div className='w-[24px] h-[24px] bg-gray-100 flex items-center justify-center rounded text-xs underline'>U</div>
        </div>
        <div className='text-[10px] font-medium text-gray-500 uppercase'>Font</div>
      </div>
    </div>
  );
};

export default ViewTab;
