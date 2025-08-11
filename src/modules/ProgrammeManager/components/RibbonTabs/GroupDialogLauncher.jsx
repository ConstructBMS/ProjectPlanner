const GroupDialogLauncher = ({ 
  groupName, 
  onClick, 
  className = '' 
}) => {
  return (
    <button
      className={`ribbon-group-launcher ${className}`}
      onClick={onClick}
      aria-label={`Open ${groupName} options`}
      title={`Open ${groupName} options`}
    >
      <svg 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M9 5l7 7-7 7" 
        />
      </svg>
    </button>
  );
};

export default GroupDialogLauncher;
