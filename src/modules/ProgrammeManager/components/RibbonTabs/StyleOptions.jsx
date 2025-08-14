 
import { useState, useEffect, useRef } from 'react';
import { loadRibbonStyle, updateRibbonStyle } from '../../utils/ribbonTheme';

const StyleOptions = ({ onStyleChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStyle, setCurrentStyle] = useState(loadRibbonStyle());
  const menuRef = useRef(null);

  // Load initial style
  useEffect(() => {
    const style = loadRibbonStyle();
    setCurrentStyle(style);
  }, []);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle mode change
  const handleModeChange = (mode) => {
    const newStyle = updateRibbonStyle({ mode });
    setCurrentStyle(newStyle);
    onStyleChange?.(newStyle);
  };

  // Handle accent change
  const handleAccentChange = (accent) => {
    const newStyle = updateRibbonStyle({ accent });
    setCurrentStyle(newStyle);
    onStyleChange?.(newStyle);
  };

  // Toggle menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Style Options Button */}
      <button
        onClick={toggleMenu}
        className="ribbon-style-options"
        aria-label="Ribbon Style Options"
        title="Ribbon Style Options"
        tabIndex={0}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6" />
          <path d="M21 12h-6m-6 0H3" />
        </svg>
      </button>

      {/* Style Options Menu */}
      {isOpen && (
        <div className="ribbon-style-menu">
          {/* Mode Section */}
          <div className="ribbon-style-section">
            <div className="ribbon-style-section-title">Mode</div>
            <div className="ribbon-style-options-grid">
              <button
                className={`ribbon-style-option ${currentStyle.mode === 'light' ? 'selected' : ''}`}
                onClick={() => handleModeChange('light')}
              >
                Light
              </button>
              <button
                className={`ribbon-style-option ${currentStyle.mode === 'dark' ? 'selected' : ''}`}
                onClick={() => handleModeChange('dark')}
              >
                Dark
              </button>
            </div>
          </div>

          {/* Accent Section */}
          <div className="ribbon-style-section">
            <div className="ribbon-style-section-title">Accent</div>
            <div className="ribbon-style-options-grid">
              <button
                className={`ribbon-style-option ${currentStyle.accent === 'blue' ? 'selected' : ''}`}
                onClick={() => handleAccentChange('blue')}
              >
                <span className="ribbon-accent-swatch blue" />
                Blue
              </button>
              <button
                className={`ribbon-style-option ${currentStyle.accent === 'cyan' ? 'selected' : ''}`}
                onClick={() => handleAccentChange('cyan')}
              >
                <span className="ribbon-accent-swatch cyan" />
                Cyan
              </button>
              <button
                className={`ribbon-style-option ${currentStyle.accent === 'teal' ? 'selected' : ''}`}
                onClick={() => handleAccentChange('teal')}
              >
                <span className="ribbon-accent-swatch teal" />
                Teal
              </button>
              <button
                className={`ribbon-style-option ${currentStyle.accent === 'green' ? 'selected' : ''}`}
                onClick={() => handleAccentChange('green')}
              >
                <span className="ribbon-accent-swatch green" />
                Green
              </button>
              <button
                className={`ribbon-style-option ${currentStyle.accent === 'orange' ? 'selected' : ''}`}
                onClick={() => handleAccentChange('orange')}
              >
                <span className="ribbon-accent-swatch orange" />
                Orange
              </button>
              <button
                className={`ribbon-style-option ${currentStyle.accent === 'magenta' ? 'selected' : ''}`}
                onClick={() => handleAccentChange('magenta')}
              >
                <span className="ribbon-accent-swatch magenta" />
                Magenta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleOptions;
