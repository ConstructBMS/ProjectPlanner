 
// RibbonButton component
import { useState, useRef, forwardRef } from 'react';
import { useUserContext } from '../../../context/UserContext';
import Tooltip from '../../common/Tooltip';
import RibbonMenu from '../RibbonMenu';

const RibbonButton = forwardRef(({
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
  menuItems = null, // Menu items for dropdown functionality
  onMenuSelect = null, // Callback for menu item selection
}, ref) => {
  const [showMenu, setShowMenu] = useState(false);
  const buttonRef = useRef(null);
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

  // Handle button click
  const handleClick = (e) => {
    if (menuItems && menuItems.length > 0) {
      e.preventDefault();
      setShowMenu(!showMenu);
    } else if (onClick) {
      onClick(e);
    }
  };

  // Handle menu item selection
  const handleMenuSelect = (item) => {
    if (onMenuSelect) {
      onMenuSelect(item);
    }
    setShowMenu(false);
  };

  // Close menu when clicking outside
  const handleClickOutside = (e) => {
    const currentRef = ref || buttonRef;
    if (currentRef.current && !currentRef.current.contains(e.target)) {
      setShowMenu(false);
    }
  };

  // Add click outside listener
  if (showMenu) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return (
    <div className="relative" ref={ref || buttonRef}>
      <Tooltip content={getTooltip()}>
        <button
          onClick={handleClick}
          disabled={isDisabled}
          className={`
            project-button ribbon-button
            group
            flex flex-col items-center justify-center
            w-[40px] ${compact ? 'h-[20px]' : 'h-[32px]'}
            flex-shrink-0
            transition-all duration-150
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : active ? 'bg-blue-100 border-blue-300' : 'hover:bg-blue-50 hover:border-blue-200'}
            ${!hasPermission ? 'opacity-30' : ''}
            ${menuItems ? 'split' : ''}
            ${className}
          `}
          aria-label={label}
          title={getTooltip()}
          aria-haspopup={menuItems ? 'true' : undefined}
          aria-expanded={showMenu ? 'true' : undefined}
          tabIndex={0}
        >
        <div
          className={`text-[12px] flex items-center justify-center w-full h-[14px] transition-colors duration-150 ${
            isDisabled
              ? 'text-gray-400'
              : 'text-gray-700 group-hover:text-blue-600'
          }`}
        >
          {iconType === 'text' ? (
            <span
              className={`font-bold transition-colors duration-150 ${
                isDisabled
                  ? 'text-gray-400'
                  : 'text-gray-700 group-hover:text-blue-600'
              }`}
            >
              {icon}
            </span>
          ) : (
            icon
          )}
        </div>
                    {!compact && (
              <div
                className={`text-[6px] uppercase tracking-wide font-medium mt-0.5 leading-tight text-center rbn-ellipsis ${
                  isDisabled ? 'text-gray-400' : 'text-gray-600'
                }`}
                title={label}
              >
                {label}
              </div>
            )}
      </button>
      </Tooltip>
      
      {/* Menu */}
      {showMenu && menuItems && (
        <RibbonMenu
          items={menuItems}
          onSelect={handleMenuSelect}
          onClose={() => setShowMenu(false)}
          position={{
            x: (ref || buttonRef).current?.getBoundingClientRect().left || 0,
            y: ((ref || buttonRef).current?.getBoundingClientRect().bottom || 0) + 4
          }}
          parentRef={ref || buttonRef}
        />
      )}
    </div>
  );
});

RibbonButton.displayName = 'RibbonButton';

export default RibbonButton;
