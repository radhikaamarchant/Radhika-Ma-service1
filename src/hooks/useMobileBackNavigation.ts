import { useEffect, useRef } from 'react';

type StackItem = {
  id: string;
  onClose: () => void;
};

let stack: StackItem[] = [];
let isProgrammaticPop = false;

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    if (isProgrammaticPop) {
      // The popstate was triggered by our programmatic history.back()
      // We don't want to close the next modal in the stack.
      isProgrammaticPop = false;
      return;
    }
    
    // User pressed the hardware back button or swipe-back in browser
    if (stack.length > 0) {
      const top = stack[stack.length - 1];
      top.onClose();
    }
  });
}

export function useMobileBackNavigation(isOpen: boolean, onClose: () => void) {
  const idRef = useRef(Math.random().toString(36).substring(7));
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    
    const id = idRef.current;
    
    window.history.pushState({ internalBack: id }, '');
    stack.push({ id, onClose: () => onCloseRef.current() });

    return () => {
      const index = stack.findIndex(item => item.id === id);
      if (index > -1) {
        stack.splice(index, 1);
      }
      
      if (window.history.state?.internalBack === id) {
        isProgrammaticPop = true;
        window.history.back();
        // Fallback to reset flag if popstate doesn't fire (e.g. some browsers edge cases)
        setTimeout(() => {
          isProgrammaticPop = false;
        }, 100);
      }
    };
  }, [isOpen]);

  // iOS Swipe to back
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);

  useEffect(() => {
    if (!isOpen) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) return;
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      startTime.current = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length > 1) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const duration = Date.now() - startTime.current;

      const deltaX = endX - startX.current;
      const deltaY = Math.abs(endY - startY.current);

      if (
        startX.current <= 40 &&
        deltaX >= 70 &&
        deltaY < deltaX * 0.6 &&
        duration < 600
      ) {
        const id = idRef.current;
        if (stack.length > 0 && stack[stack.length - 1].id === id) {
          onCloseRef.current();
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
    document.addEventListener('touchend', handleTouchEnd, { capture: true, passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart, { capture: true });
      document.removeEventListener('touchend', handleTouchEnd, { capture: true });
    };
  }, [isOpen]);
}
