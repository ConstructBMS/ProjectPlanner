import { useState, useRef, useEffect, useCallback } from 'react';

const LinkTypeMenu = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  currentType = 'FS',
  position = { x: 0, y: 0 }
}) => {
  const menuRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const linkTypes = [
    { value: 'FS', label: 'Finish-to-Start (FS)', description: 'Successor starts after predecessor finishes' },
    { value: 'SS', label: 'Start-to-Start (SS)', description: 'Successor starts after predecessor starts' },
    { value: 'FF', label: 'Finish-to-Finish (FF)', description: 'Successor finishes after predecessor finishes' },
    { value: 'SF', label: 'Start-to-Finish (SF)', description: 'Successor finishes after predecessor starts' }
  ];

  const currentTypeIndex = linkTypes.findIndex(type => type.value === currentType);
  
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(currentTypeIndex >= 0 ? currentTypeIndex : 0);
    }
  }, [isOpen, currentTypeIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % linkTypes.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + linkTypes.length) % linkTypes.length);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleSelect(linkTypes[selectedIndex].value);
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleSelect = useCallback((type) => {
    onSelect(type);
    onClose();
  }, [onSelect, onClose]);

  const handleMouseEnter = (index) => {
    setSelectedIndex(index);
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-64"
      style={{
        left: position.x,
        top: position.y
      }}
    >
      {linkTypes.map((type, index) => (
        <button
          key={type.value}
          className={`w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${
            selectedIndex === index ? 'bg-blue-50' : ''
          }`}
          onClick={() => handleSelect(type.value)}
          onMouseEnter={() => handleMouseEnter(index)}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">{type.label}</div>
              <div className="text-sm text-gray-500">{type.description}</div>
            </div>
            {type.value === currentType && (
              <div className="text-blue-600 font-medium">✓</div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default LinkTypeMenu;
