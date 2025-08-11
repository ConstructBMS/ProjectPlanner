import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for smooth scrolling with Shift+Wheel horizontal scroll support
 * @param {Object} options - Configuration options
 * @param {number} options.horizontalMultiplier - Multiplier for horizontal scroll (default: 0.5)
 * @param {number} options.verticalMultiplier - Multiplier for vertical scroll (default: 1.0)
 * @param {number} options.throttleMs - Throttle interval in milliseconds (default: 16 for ~60fps)
 * @param {boolean} options.enableShiftWheel - Enable Shift+Wheel horizontal scroll (default: true)
 * @returns {Object} - Ref to attach to scrollable element and scroll methods
 */
export const useSmoothScroll = ({
  horizontalMultiplier = 0.5,
  verticalMultiplier = 1.0,
  throttleMs = 16,
  enableShiftWheel = true
} = {}) => {
  const scrollRef = useRef(null);
  const lastScrollTime = useRef(0);
  const scrollTimeout = useRef(null);

  // Throttled scroll function
  const throttledScroll = useCallback((deltaX, deltaY) => {
    const now = Date.now();
    if (now - lastScrollTime.current < throttleMs) {
      // Clear existing timeout and set new one
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      scrollTimeout.current = setTimeout(() => {
        throttledScroll(deltaX, deltaY);
      }, throttleMs - (now - lastScrollTime.current));
      return;
    }

    lastScrollTime.current = now;
    
    if (scrollRef.current) {
      const element = scrollRef.current;
      
      // Apply multipliers
      const adjustedDeltaX = deltaX * horizontalMultiplier;
      const adjustedDeltaY = deltaY * verticalMultiplier;
      
      // Smooth scroll with requestAnimationFrame for better performance
      if (typeof window !== 'undefined' && window.requestAnimationFrame) {
        window.requestAnimationFrame(() => {
          element.scrollBy({
            left: adjustedDeltaX,
            top: adjustedDeltaY,
            behavior: 'smooth'
          });
        });
      } else {
        // Fallback for environments without requestAnimationFrame
        element.scrollBy({
          left: adjustedDeltaX,
          top: adjustedDeltaY,
          behavior: 'smooth'
        });
      }
    }
  }, [horizontalMultiplier, verticalMultiplier, throttleMs]);

  // Handle wheel events
  const handleWheel = useCallback((event) => {
    if (!enableShiftWheel) return;

    // Check if Shift key is pressed for horizontal scroll
    if (event.shiftKey) {
      event.preventDefault();
      
      // Use deltaY for horizontal scroll when Shift is pressed
      const deltaX = event.deltaY;
      const deltaY = 0;
      
      throttledScroll(deltaX, deltaY);
    } else {
      // Normal vertical scroll
      const deltaX = event.deltaX;
      const deltaY = event.deltaY;
      
      // Only handle if there's significant scroll delta
      if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
        throttledScroll(deltaX, deltaY);
      }
    }
  }, [enableShiftWheel, throttledScroll]);

  // Handle touch events for mobile smooth scrolling
  const handleTouchStart = useCallback((event) => {
    // Store initial touch position
    const touch = event.touches[0];
    scrollRef.current._touchStartX = touch.clientX;
    scrollRef.current._touchStartY = touch.clientY;
    scrollRef.current._touchStartTime = Date.now();
  }, []);

  const handleTouchMove = useCallback((event) => {
    if (!scrollRef.current._touchStartX) return;

    const touch = event.touches[0];
    const deltaX = scrollRef.current._touchStartX - touch.clientX;
    const deltaY = scrollRef.current._touchStartY - touch.clientY;
    
    // Apply momentum scrolling for touch devices
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      throttledScroll(deltaX * 0.1, deltaY * 0.1);
    }
  }, [throttledScroll]);

  const handleTouchEnd = useCallback(() => {
    // Clear touch state
    if (scrollRef.current) {
      delete scrollRef.current._touchStartX;
      delete scrollRef.current._touchStartY;
      delete scrollRef.current._touchStartTime;
    }
  }, []);

  // Add event listeners
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    // Add wheel event listener
    element.addEventListener('wheel', handleWheel, { passive: false });
    
    // Add touch event listeners for mobile
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('wheel', handleWheel);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      // Clear any pending timeouts
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  // Manual scroll methods
  const scrollTo = useCallback((options) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        behavior: 'smooth',
        ...options
      });
    }
  }, []);

  const scrollBy = useCallback((options) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        behavior: 'smooth',
        ...options
      });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    scrollTo({ top: 0 });
  }, [scrollTo]);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollTo({ top: scrollRef.current.scrollHeight });
    }
  }, [scrollTo]);

  const scrollToLeft = useCallback(() => {
    scrollTo({ left: 0 });
  }, [scrollTo]);

  const scrollToRight = useCallback(() => {
    if (scrollRef.current) {
      scrollTo({ left: scrollRef.current.scrollWidth });
    }
  }, [scrollTo]);

  return {
    scrollRef,
    scrollTo,
    scrollBy,
    scrollToTop,
    scrollToBottom,
    scrollToLeft,
    scrollToRight
  };
};
