import { useEffect, useRef } from 'react';

type StackItem = {
  id: string;
  onClose: () => void;
};

let stack: StackItem[] = [];
let isProgrammaticPop = false;
let isPopping = false;

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', (e) => {
    if (isProgrammaticPop) {
      isProgrammaticPop = false;
      return;
    }
    
    isPopping = true;
    document.body.classList.add('is-popping');
    setTimeout(() => {
      isPopping = false;
      document.body.classList.remove('is-popping');
    }, 500);
    
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
    
    if (!isPopping) {
      window.history.pushState({ internalBack: idRef.current }, '');
    } else {
      const currentId = window.history.state?.internalBack;
      if (currentId) {
        idRef.current = currentId;
      }
    }
    
    const id = idRef.current;
    stack.push({ id, onClose: () => onCloseRef.current() });

    return () => {
      const index = stack.findIndex(item => item.id === id);
      if (index > -1) {
        stack.splice(index, 1);
      }
      
      setTimeout(() => {
        if (window.history.state?.internalBack === id) {
          isProgrammaticPop = true;
          window.history.back();
          setTimeout(() => {
            isProgrammaticPop = false;
          }, 100);
        }
      }, 0);
    };
  }, [isOpen]);
}
