const RibbonGroup = ({ title, children, disabled = false }) => {
  return (
    <div className={`asta-group ${disabled ? 'opacity-50' : ''}`}>
      <div className='asta-group-title'>{title}</div>
      <div className='flex flex-wrap gap-0.5 overflow-hidden min-w-0 px-0.5 w-full'>
        {children}
      </div>
    </div>
  );
};

export default RibbonGroup;
