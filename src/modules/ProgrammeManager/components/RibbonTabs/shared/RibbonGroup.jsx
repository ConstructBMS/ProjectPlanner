import React from 'react';

const RibbonGroup = ({ title, children, disabled = false }) => {
  return (
    <div className={`asta-group ${disabled ? 'opacity-50' : ''}`}>
      <div className='asta-group-title'>{title}</div>
      <div className='flex flex-wrap gap-2 overflow-hidden min-w-0 px-2 w-full'>
        {children}
      </div>
    </div>
  );
};

export default RibbonGroup;
