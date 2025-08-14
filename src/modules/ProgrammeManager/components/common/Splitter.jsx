 
import { useState, useEffect, useRef, useCallback } from 'react';
import { getLayoutRatios, saveLayoutRatios } from '../../utils/prefs';
import './Splitter.css';

const Splitter = ({
  orientation = 'vertical',
  children,
  defaultRatios = [0.2, 0.4, 0.4],
  minSizes = [220, 420, 480],
  storageKey = 'main-panes',
  onRatiosChange
}) => {
  const [ratios, setRatios] = useState(defaultRatios);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [startPos, setStartPos] = useState(0);
  const [startRatios, setStartRatios] = useState([]);
  const containerRef = useRef(null);
  const splitterRefs = useRef([]);
  const animationFrameRef = useRef(null);

  // Load saved ratios from persistent storage
  useEffect(() => {
    const loadSavedRatios = async () => {
      try {
        const savedRatios = getLayoutRatios(storageKey);
        if (savedRatios && Array.isArray(savedRatios) && savedRatios.length === defaultRatios.length) {
          console.log(`Loaded saved ratios for ${storageKey}:`, savedRatios);
          setRatios(savedRatios);
          onRatiosChange?.(savedRatios);
        } else {
          console.log(`No saved ratios found for ${storageKey}, using defaults:`, defaultRatios);
        }
      } catch (error) {
        console.warn('Failed to load saved ratios:', error);
      }
    };
    loadSavedRatios();
  }, [storageKey, defaultRatios.length, onRatiosChange]);

  // Save ratios to persistent storage
  const saveRatios = useCallback((newRatios) => {
    try {
      saveLayoutRatios(storageKey, newRatios);
      console.log(`Saved ratios for ${storageKey}:`, newRatios);
    } catch (error) {
      console.warn('Failed to save ratios:', error);
    }
  }, [storageKey]);

  // Reset to default ratios
  const resetToDefaults = useCallback(() => {
    console.log(`Resetting splitter ratios to defaults for ${storageKey}:`, defaultRatios);
    setRatios(defaultRatios);
    saveRatios(defaultRatios);
    onRatiosChange?.(defaultRatios);
  }, [defaultRatios, saveRatios, onRatiosChange, storageKey]);

  // Handle pointer down on splitter
  const handlePointerDown = useCallback((index, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log(`Splitter pointer down on index ${index}`);
    
    setIsDragging(true);
    setDragIndex(index);
    
    const pos = orientation === 'vertical' ? e.clientX : e.clientY;
    setStartPos(pos);
    setStartRatios([...ratios]);
    
    // Set body styles for smooth dragging
    document.body.style.cursor = orientation === 'vertical' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
    
    // Add dragging class to container
    if (containerRef.current) {
      containerRef.current.classList.add('dragging');
    }
  }, [orientation, ratios]);

  // Handle pointer move during drag with requestAnimationFrame
  const handlePointerMove = useCallback((e) => {
    if (!isDragging || dragIndex === null) return;

    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }

    // Schedule the update for the next frame
    animationFrameRef.current = window.requestAnimationFrame(() => {
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
    });
  }, [isDragging, dragIndex, startPos, startRatios, orientation, minSizes, onRatiosChange]);

  // Handle pointer up to end drag
  const handlePointerUp = useCallback(() => {
    if (isDragging) {
      console.log('Splitter pointer up, ending drag');
      
      setIsDragging(false);
      setDragIndex(null);
      
      // Clean up body styles
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      // Remove dragging class from container
      if (containerRef.current) {
        containerRef.current.classList.remove('dragging');
      }
      
      // Cancel any pending animation frame
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Save current ratios
      saveRatios(ratios);
    }
  }, [isDragging, ratios, saveRatios]);

  // Handle double-click on splitter to reset
  const handleDoubleClick = useCallback((index, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log(`Splitter double-click on index ${index}, resetting to defaults`);
    resetToDefaults();
  }, [resetToDefaults]);

  // Add/remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove, { passive: false });
      window.addEventListener('pointerup', handlePointerUp, { passive: false });
      
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
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
            overflow: 'hidden',
            flexShrink: 0
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
          onPointerDown={(e) => handlePointerDown(i, e)}
          onDoubleClick={(e) => handleDoubleClick(i, e)}
          style={{
            width: orientation === 'vertical' ? (isDragging && dragIndex === i ? '12px' : '8px') : '100%',
            height: orientation === 'horizontal' ? (isDragging && dragIndex === i ? '12px' : '8px') : '100%',
            cursor: orientation === 'vertical' ? 'col-resize' : 'row-resize',
            position: 'absolute',
            [orientation === 'vertical' ? 'left' : 'top']: `calc(${(ratios.slice(0, i + 1).reduce((a, b) => a + b, 0) * 100).toFixed(2)}% - ${isDragging && dragIndex === i ? '6px' : '4px'})`,
            zIndex: 1000,
            pointerEvents: 'auto'
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
