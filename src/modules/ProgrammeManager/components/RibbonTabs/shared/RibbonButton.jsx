// RibbonButton component
import Tooltip from '../../common/Tooltip';

const RibbonButton = ({
  icon,
  label,
  onClick,
  disabled = false,
  tooltip = '',
  className = '',
  iconType = 'icon',
  active = false,
  compact = false,
}) => {
  return (
    <Tooltip content={tooltip || label}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          asta-button
          group
          flex flex-col items-center justify-center
          w-[40px] ${compact ? 'h-[20px]' : 'h-[32px]'}
          flex-shrink-0
          transition-all duration-150
          ${disabled ? 'opacity-50 cursor-not-allowed' : active ? 'bg-blue-100 border-blue-300' : 'hover:bg-blue-50 hover:border-blue-200'}
          ${className}
        `}
        aria-label={label}
        title={tooltip || label}
      >
        <div className='text-[12px] text-gray-700 flex items-center justify-center w-full h-[14px] group-hover:text-blue-600 transition-colors duration-150'>
          {iconType === 'text' ? (
            <span className='font-bold text-gray-700 group-hover:text-blue-600 transition-colors duration-150'>
              {icon}
            </span>
          ) : (
            icon
          )}
        </div>
        {!compact && (
          <div className='text-[6px] uppercase tracking-wide text-gray-600 font-medium mt-0.5 leading-tight text-center'>
            {label}
          </div>
        )}
      </button>
    </Tooltip>
  );
};

export default RibbonButton;
