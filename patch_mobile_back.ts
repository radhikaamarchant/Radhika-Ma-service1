import fs from 'fs';
const code = `import { useEffect, useRef } from 'react';

type StackItem = {
  id: string;
  onClose: () => void;
};

let stack: StackItem[] = [];
let isProgrammaticPop = false;

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', (e) => {
    if (isProgrammaticPop) {
      isProgrammaticPop = false;
      return;
    }
    
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
        setTimeout(() => {
          isProgrammaticPop = false;
        }, 100);
      }
    };
  }, [isOpen]);
}
`;
fs.writeFileSync('src/hooks/useMobileBackNavigation.ts', code);
console.log("Success MobileBack Patch");
