import { useState, useRef, useCallback, useEffect } from 'react';
import './ResizeHandle.css';

const ResizeHandle = ({ 
  onResize, 
  onResizeStart, 
  onResizeEnd, 
  className = '', 
  disabled = false 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const handleRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    if (disabled) return;
    
    e.preventDefault();
    setIsDragging(true);
    setStartY(e.clientY);
    
    // Get the current height from the parent container
    const parentElement = handleRef.current?.parentElement;
    if (parentElement) {
      setStartHeight(parentElement.offsetHeight);
    }
    
    onResizeStart?.();
  }, [disabled, onResizeStart]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const deltaY = startY - e.clientY;
    const newHeight = startHeight + deltaY;
    
    onResize?.(newHeight);
  }, [isDragging, startY, startHeight, onResize]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    onResizeEnd?.();
  }, [isDragging, onResizeEnd]);

  // Add/remove global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={handleRef}
      className={`resize-handle ${isDragging ? 'dragging' : ''} ${className}`}
      onMouseDown={handleMouseDown}
      style={{ cursor: disabled ? 'default' : 'row-resize' }}
      role="separator"
      aria-orientation="horizontal"
      aria-label="Resize properties pane"
    >
      <div className="resize-handle-line" />
    </div>
  );
};

export default ResizeHandle;
