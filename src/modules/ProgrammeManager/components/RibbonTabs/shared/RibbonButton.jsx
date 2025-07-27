import React from 'react';
import Tooltip from '../../common/Tooltip';
import {
  ScissorsIcon,
  DocumentDuplicateIcon,
  PaperClipIcon,
  PlusIcon,
  TrashIcon,
  LinkIcon,
  XMarkIcon,
  DocumentIcon,
  PencilIcon,
  HashtagIcon,
  FolderPlusIcon,
  MinusCircleIcon,
  CheckIcon,
  XCircleIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentIcon,
  ClipboardIcon
} from '@heroicons/react/24/outline';

// Icon mapping for text-based icons (B, I, U)
const TextIcon = ({ text, className = "text-[14px] font-bold" }) => (
  <span className={className}>{text}</span>
);

const RibbonButton = ({
  icon,
  label,
  onClick,
  disabled = false,
  className = '',
  iconType = 'svg' // 'svg' or 'text'
}) => {
  // Handle text-based icons (B, I, U)
  if (iconType === 'text') {
    return (
      <Tooltip label={label} disabled={disabled}>
        <div
          className={`w-[36px] h-[36px] bg-white rounded-[2px] flex items-center justify-center hover:bg-blue-100 cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-300 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${className}`}
          onClick={disabled ? undefined : onClick}
          aria-label={label}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!disabled && onClick) onClick();
            }
          }}
        >
          <TextIcon text={icon} className={className} />
        </div>
      </Tooltip>
    );
  }

  // Handle SVG icons (icon prop is already a React node)
  return (
    <Tooltip label={label} disabled={disabled}>
      <div
        className={`w-[36px] h-[36px] bg-white rounded-[2px] flex items-center justify-center hover:bg-blue-100 cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-300 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
        onClick={disabled ? undefined : onClick}
        aria-label={label}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled && onClick) onClick();
          }
        }}
      >
        {icon}
      </div>
    </Tooltip>
  );
};

export default RibbonButton;
