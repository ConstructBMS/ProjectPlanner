import React from 'react';
import * as HeroIcons from '@heroicons/react/24/outline';
import { iconMap } from '../iconMap';

interface IconProps {
  name: string;
  size: 'lg' | 'md';
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, size, className = '' }) => {
  // Get the icon component from the mapping
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in iconMap`);
    // Return a fallback icon
    return (
      <svg
        className={className}
        style={{
          width: size === 'lg' ? 28 : 20,
          height: size === 'lg' ? 28 : 20,
          strokeWidth: 1.75,
          vectorEffect: 'non-scaling-stroke'
        }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
    );
  }

  return (
    <IconComponent
      className={className}
      style={{
        width: size === 'lg' ? 28 : 20,
        height: size === 'lg' ? 28 : 20,
        strokeWidth: 1.75,
        vectorEffect: 'non-scaling-stroke'
      }}
    />
  );
};

export default Icon;
