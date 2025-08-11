import { useState, useEffect, useRef, useCallback } from 'react';
import './Splitter.css';

const Splitter = ({
  orientation = 'vertical',
  children,
  defaultRatios = [0.2, 0.4, 0.4],
  minSizes = [220, 420, 480],
  storageKey = 'pm.layout.ratios',
  onRatiosChange
}) => {
  const [ratios, setRatios] = useState(defaultRatios);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [startPos, setStartPos] = useState(0);
  const [startRatios, setStartRatios] = useState([]);
  const containerRef = useRef(null);
  const splitterRefs = useRef([]);

  // Load saved ratios from localStorage
  useEffect(() => {
    const savedRatios = localStorage.getItem(storageKey);
    if (savedRatios) {
      try {
        const parsed = JSON.parse(savedRatios);
        if (Array.isArray(parsed) && parsed.length === defaultRatios.length) {
          setRatios(parsed);
        }
      } catch (error) {
        console.warn('Failed to load saved ratios:', error);
      }
    }
  }, [storageKey, defaultRatios.length]);

  // Save ratios to localStorage
  const saveRatios = useCallback((newRatios) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newRatios));
    } catch (error) {
      console.warn('Failed to save ratios:', error);
    }
  }, [storageKey]);

  // Reset to default ratios
  const resetToDefaults = useCallback(() => {
    setRatios(defaultRatios);
    saveRatios(defaultRatios);
    onRatiosChange?.(defaultRatios);
  }, [defaultRatios, saveRatios, onRatiosChange]);

  // Handle mouse down on splitter
  const handleMouseDown = useCallback((index, e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragIndex(index);
    
    const pos = orientation === 'vertical' ? e.clientX : e.clientY;
    setStartPos(pos);
    setStartRatios([...ratios]);
    
    document.body.style.cursor = orientation === 'vertical' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  }, [orientation, ratios]);

  // Handle mouse move during drag
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || dragIndex === null) return;

    const currentPos = orientation === 'vertical' ? e.clientX : e.clientY;
    const delta = currentPos - startPos;
    
    if (containerRef.current) {
      const containerSize = orientation === 'vertical' 
        ? containerRef.current.offsetWidth 
        : containerRef.current.offsetHeight;
      
      const deltaRatio = delta / containerSize;
      
      // Calculate new ratios
      const newRatios = [...startRatios];
      const leftRatio = newRatios[dragIndex];
      const rightRatio = newRatios[dragIndex + 1];
      
      // Calculate minimum ratios based on min sizes
      const minLeftRatio = minSizes[dragIndex] / containerSize;
      const minRightRatio = minSizes[dragIndex + 1] / containerSize;
      
      // Apply constraints
      const maxDelta = Math.min(
        leftRatio - minLeftRatio,
        rightRatio - minRightRatio
      );
      
      const constrainedDelta = Math.max(
        -maxDelta,
        Math.min(deltaRatio, maxDelta)
      );
      
      newRatios[dragIndex] = leftRatio - constrainedDelta;
      newRatios[dragIndex + 1] = rightRatio + constrainedDelta;
      
      // Update ratios
      setRatios(newRatios);
      onRatiosChange?.(newRatios);
    }
  }, [isDragging, dragIndex, startPos, startRatios, orientation, minSizes, onRatiosChange]);

  // Handle mouse up to end drag
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragIndex(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      // Save current ratios
      saveRatios(ratios);
    }
  }, [isDragging, ratios, saveRatios]);

  // Handle double-click on splitter to reset
  const handleDoubleClick = useCallback((index) => {
    resetToDefaults();
  }, [resetToDefaults]);

  // Add/remove event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  // Render children with calculated sizes
  const renderChildren = () => {
    return children.map((child, index) => {
      const size = `${(ratios[index] * 100).toFixed(2)}%`;
      
      return (
        <div
          key={index}
          style={{
            width: orientation === 'vertical' ? size : '100%',
            height: orientation === 'horizontal' ? size : '100%',
            minWidth: orientation === 'vertical' ? `${minSizes[index]}px` : 'auto',
            minHeight: orientation === 'horizontal' ? `${minSizes[index]}px` : 'auto',
            overflow: 'hidden'
          }}
        >
          {child}
        </div>
      );
    });
  };

  // Render splitters
  const renderSplitters = () => {
    const splitters = [];
    for (let i = 0; i < children.length - 1; i++) {
      splitters.push(
        <div
          key={`splitter-${i}`}
          ref={(el) => splitterRefs.current[i] = el}
          className={`splitter-gutter ${orientation} ${isDragging && dragIndex === i ? 'active' : ''}`}
          onMouseDown={(e) => handleMouseDown(i, e)}
          onDoubleClick={() => handleDoubleClick(i)}
          style={{
            width: orientation === 'vertical' ? '8px' : '100%',
            height: orientation === 'horizontal' ? '8px' : '100%',
            cursor: orientation === 'vertical' ? 'col-resize' : 'row-resize',
            position: 'absolute',
            [orientation === 'vertical' ? 'left' : 'top']: `calc(${(ratios.slice(0, i + 1).reduce((a, b) => a + b, 0) * 100).toFixed(2)}% - 4px)`,
            zIndex: 10
          }}
        >
          <div className="splitter-handle" />
        </div>
      );
    }
    return splitters;
  };

  return (
    <div
      ref={containerRef}
      className={`splitter-container ${orientation}`}
      style={{
        display: 'flex',
        flexDirection: orientation === 'vertical' ? 'row' : 'column',
        width: '100%',
        height: '100%',
        position: 'relative'
      }}
    >
      {renderChildren()}
      {renderSplitters()}
    </div>
  );
};

export default Splitter;
