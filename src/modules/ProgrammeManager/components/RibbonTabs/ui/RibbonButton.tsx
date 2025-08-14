import React from 'react';
import Icon from './Icon';

interface RibbonButtonProps {
  icon: string;
  size: 'lg' | 'md';
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  className?: string;
  title?: string;
}

const RibbonButton: React.FC<RibbonButtonProps> = ({
  icon,
  size,
  label,
  onClick,
  disabled = false,
  active = false,
  className = '',
  title
}) => {
  const buttonClasses = [
    'rbn-btn',
    `rbn-btn-${size}`,
    active ? 'rbn-btn-active' : '',
    disabled ? 'rbn-btn-disabled' : '',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled}
      title={title || label}
      type="button"
    >
      <Icon name={icon} size={size} className="rbn-icon" />
      <span className="rbn-label" title={label}>
        {label}
      </span>
    </button>
  );
};

export default RibbonButton;
