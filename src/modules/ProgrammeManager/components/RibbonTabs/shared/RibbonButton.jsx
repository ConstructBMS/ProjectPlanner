// RibbonButton component
import { useUserContext } from '../../../context/UserContext';
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
  permissionKey = null, // New prop for permission checking
  showIfNoPermission = false, // Whether to show button but disabled if no permission
}) => {
  const { canAccessButton } = useUserContext();

  // Check if user has permission for this button
  const hasPermission = permissionKey ? canAccessButton(permissionKey) : true;

  // If no permission and not showing, return null
  if (!hasPermission && !showIfNoPermission) {
    return null;
  }

  // Determine if button should be disabled
  const isDisabled = disabled || !hasPermission;

  // Enhanced tooltip for permission-related disabled state
  const getTooltip = () => {
    if (!hasPermission) {
      return `Access denied: ${tooltip || label} requires higher permissions`;
    }
    return tooltip || label;
  };

  return (
    <Tooltip content={getTooltip()}>
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={`
          asta-button
          group
          flex flex-col items-center justify-center
          w-[40px] ${compact ? 'h-[20px]' : 'h-[32px]'}
          flex-shrink-0
          transition-all duration-150
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : active ? 'bg-blue-100 border-blue-300' : 'hover:bg-blue-50 hover:border-blue-200'}
          ${!hasPermission ? 'opacity-30' : ''}
          ${className}
        `}
        aria-label={label}
        title={getTooltip()}
      >
        <div className={`text-[12px] flex items-center justify-center w-full h-[14px] transition-colors duration-150 ${
          isDisabled ? 'text-gray-400' : 'text-gray-700 group-hover:text-blue-600'
        }`}>
          {iconType === 'text' ? (
            <span className={`font-bold transition-colors duration-150 ${
              isDisabled ? 'text-gray-400' : 'text-gray-700 group-hover:text-blue-600'
            }`}>
              {icon}
            </span>
          ) : (
            icon
          )}
        </div>
        {!compact && (
          <div className={`text-[6px] uppercase tracking-wide font-medium mt-0.5 leading-tight text-center ${
            isDisabled ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {label}
          </div>
        )}
      </button>
    </Tooltip>
  );
};

export default RibbonButton;
