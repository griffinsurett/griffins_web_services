// 🔧 FIXED: useTimedAdvance.js
import { useRef, useCallback, useEffect } from 'react';

export function useTimedAdvance({
  totalItems = 0,
  interval = 3000,
  loop = true,
  currentIndex = 0, // 🔧 NEW: Receive current index to stay in sync
  onAdvance = () => {}
} = {}) {
  const timerRef = useRef(null);

  // 🔧 FIX: Keep internal ref synced with external state
  useEffect(() => {
    // No need for internal currentIndexRef, use the passed currentIndex
  }, [currentIndex]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleAdvance = useCallback(() => {
    clearTimer();
    
    timerRef.current = setTimeout(() => {
      const nextIndex = loop 
        ? (currentIndex + 1) % totalItems
        : Math.min(currentIndex + 1, totalItems - 1);
      
      onAdvance(nextIndex);
    }, interval);
  }, [interval, totalItems, loop, currentIndex, onAdvance, clearTimer]);

  const advance = useCallback(() => {
    const nextIndex = loop 
      ? (currentIndex + 1) % totalItems
      : Math.min(currentIndex + 1, totalItems - 1);
    
    onAdvance(nextIndex);
    clearTimer();
  }, [totalItems, loop, currentIndex, onAdvance, clearTimer]);

  const goToIndex = useCallback((index) => {
    if (index >= 0 && index < totalItems) {
      onAdvance(index);
      clearTimer();
    }
  }, [totalItems, onAdvance, clearTimer]);

  // 🔧 FIX: Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    advance,
    goToIndex,
    clearTimer,
    scheduleAdvance
  };
}