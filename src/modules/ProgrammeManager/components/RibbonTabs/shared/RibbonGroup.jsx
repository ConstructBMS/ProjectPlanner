 
import { useUserContext } from '../../../context/UserContext';

const RibbonGroup = ({
  title,
  children,
  disabled = false,
  permissionKey = null, // New prop for permission checking
  showIfNoPermission = false, // Whether to show group but disabled if no permission
}) => {
  const { canAccessButton } = useUserContext();

  // Check if user has permission for this group
  const hasPermission = permissionKey ? canAccessButton(permissionKey) : true;

  // If no permission and not showing, return null
  if (!hasPermission && !showIfNoPermission) {
    return null;
  }

  // Determine if group should be disabled
  const isDisabled = disabled || !hasPermission;

  return (
    <div className={`project-group ribbon-group ${isDisabled ? 'opacity-50' : ''}`} tabIndex={0}>
      <div
        className={`project-group-title rbn-ellipsis ${!hasPermission ? 'text-gray-400' : ''}`}
        title={title}
      >
        {title}
        {!hasPermission && (
          <span className='ml-1 text-xs text-gray-400'>(Restricted)</span>
        )}
      </div>
      <div className='flex flex-wrap gap-0.5 overflow-hidden min-w-0 px-0.5 w-full'>
        {children}
      </div>
    </div>
  );
};

export default RibbonGroup;
