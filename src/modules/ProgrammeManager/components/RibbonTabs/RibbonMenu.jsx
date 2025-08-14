 
import { useState, useEffect, useRef, useCallback } from 'react';

const RibbonMenu = ({ 
  items = [], 
  onSelect, 
  onClose, 
  position = { x: 0, y: 0 },
  parentRef = null 
}) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [typeahead, setTypeahead] = useState('');
  const [typeaheadTimeout, setTypeaheadTimeout] = useState(null);
  const menuRef = useRef(null);
  const subMenuRef = useRef(null);

  // Filter items for typeahead
  const filteredItems = items.filter(item => 
    !typeahead || 
    item.label.toLowerCase().startsWith(typeahead.toLowerCase())
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          (prev < filteredItems.length - 1 ? prev + 1 : 0)
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          (prev > 0 ? prev - 1 : filteredItems.length - 1)
        );
        break;
      
      case 'ArrowRight': {
        e.preventDefault();
        const currentItem = filteredItems[selectedIndex];
        if (currentItem?.subMenu) {
          setOpenSubMenu(selectedIndex);
        }
        break;
      }
      
      case 'ArrowLeft':
        e.preventDefault();
        if (openSubMenu !== null) {
          setOpenSubMenu(null);
        }
        break;
      
      case 'Enter':
      case ' ': {
        e.preventDefault();
        const item = filteredItems[selectedIndex];
        if (item) {
          if (item.subMenu) {
            setOpenSubMenu(selectedIndex);
          } else {
            handleSelect(item);
          }
        }
        break;
      }
      
      case 'Escape':
        e.preventDefault();
        if (openSubMenu !== null) {
          setOpenSubMenu(null);
        } else {
          onClose?.();
        }
        break;
      
      default:
        // Typeahead
        if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
          e.preventDefault();
          const newTypeahead = typeahead + e.key;
          setTypeahead(newTypeahead);
          
          // Clear typeahead after 1 second
          if (typeaheadTimeout) {
            clearTimeout(typeaheadTimeout);
          }
          const timeout = setTimeout(() => setTypeahead(''), 1000);
          setTypeaheadTimeout(timeout);
          
          // Find first matching item
          const matchIndex = filteredItems.findIndex(item =>
            item.label.toLowerCase().startsWith(newTypeahead.toLowerCase())
          );
          if (matchIndex !== -1) {
            setSelectedIndex(matchIndex);
          }
        }
        break;
    }
  }, [filteredItems, selectedIndex, openSubMenu, typeahead, typeaheadTimeout, onClose, handleSelect]);

  // Handle item selection
  const handleSelect = useCallback((item) => {
    if (item.disabled) return;
    
    if (item.subMenu) {
      setOpenSubMenu(selectedIndex);
    } else {
      onSelect?.(item);
      onClose?.();
    }
  }, [selectedIndex, onSelect, onClose]);

  // Handle mouse hover
  const handleMouseEnter = useCallback((index) => {
    setSelectedIndex(index);
    if (openSubMenu !== null && openSubMenu !== index) {
      setOpenSubMenu(null);
    }
  }, [openSubMenu]);

  // Position menu
  useEffect(() => {
    if (menuRef.current && parentRef) {
      const menuRect = menuRef.current.getBoundingClientRect();
      
      // Adjust position to keep menu in viewport
      let x = position.x;
      let y = position.y;
      
      if (x + menuRect.width > window.innerWidth) {
        x = window.innerWidth - menuRect.width - 8;
      }
      
      if (y + menuRect.height > window.innerHeight) {
        y = window.innerHeight - menuRect.height - 8;
      }
      
      menuRef.current.style.left = `${x}px`;
      menuRef.current.style.top = `${y}px`;
    }
  }, [position, parentRef]);

  // Focus management
  useEffect(() => {
    if (menuRef.current) {
      menuRef.current.focus();
    }
  }, []);

  // Cleanup typeahead timeout
  useEffect(() => {
    return () => {
      if (typeaheadTimeout) {
        clearTimeout(typeaheadTimeout);
      }
    };
  }, [typeaheadTimeout]);

  // Close submenu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (items.length === 0) return null;

  return (
            <div
          ref={menuRef}
          className="ribbon-menu"
          tabIndex={0}
          role="menu"
          onKeyDown={handleKeyDown}
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            zIndex: 1000
          }}
        >
      {filteredItems.map((item, index) => (
        <div
          key={item.id || index}
          className={`ribbon-menu-item ${selectedIndex === index ? 'selected' : ''} ${item.disabled ? 'disabled' : ''}`}
          role="menuitem"
          aria-haspopup={item.subMenu ? 'true' : undefined}
          aria-expanded={openSubMenu === index ? 'true' : undefined}
          aria-disabled={item.disabled}
          onClick={() => handleSelect(item)}
          onMouseEnter={() => handleMouseEnter(index)}
          tabIndex={0}
          title={item.label}
        >
          {item.customContent ? (
            // Render custom content if provided
            <div className="ribbon-menu-custom-content">
              {item.customContent}
            </div>
          ) : (
            // Render standard menu item content
            <>
              {item.icon && (
                <span className="ribbon-menu-icon">
                  {item.icon}
                </span>
              )}
              
              <span className="ribbon-menu-label rbn-ellipsis">
                {item.label}
              </span>
              
              {item.accelerator && (
                <span className="ribbon-menu-accelerator">
                  {item.accelerator}
                </span>
              )}
              
              {item.subMenu && (
                <span className="ribbon-menu-arrow">
                  ▶
                </span>
              )}
            </>
          )}
          
          {/* Submenu */}
          {item.subMenu && openSubMenu === index && (
            <div
              ref={subMenuRef}
              className="ribbon-submenu"
              style={{
                position: 'absolute',
                left: '100%',
                top: 0
              }}
            >
              <RibbonMenu
                items={item.subMenu}
                onSelect={onSelect}
                onClose={() => setOpenSubMenu(null)}
                position={{ x: 0, y: 0 }}
                parentRef={subMenuRef}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RibbonMenu;
