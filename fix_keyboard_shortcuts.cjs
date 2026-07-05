const fs = require('fs');
const content = `import { useEffect } from 'react';

type ShortcutMap = {
  [key: string]: (e: KeyboardEvent) => void;
};

export function useKeyboardShortcuts(shortcuts: ShortcutMap, active: boolean = true) {
  useEffect(() => {
    // Only run on desktop (width >= 768px)
    if (!active || window.innerWidth < 768) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Build the keys string from the event
      const keys = [];
      if (e.ctrlKey || e.metaKey) keys.push('ctrl');
      if (e.shiftKey) keys.push('shift');
      if (e.altKey) keys.push('alt');
      
      let key = e.key.toLowerCase();
      
      // If the key is just a modifier, we don't append it again if it's already in the list
      // BUT if the user wants to bind just 'shift', we can just use 'shift'
      if (key === 'control') key = 'ctrl';
      
      if (key === ' ') {
        key = 'space';
      }

      if (!keys.includes(key)) {
        keys.push(key);
      }

      const shortcutString = keys.join('+');
      
      // Check if we have a mapped function for this shortcut
      if (shortcuts[shortcutString]) {
        // Stop default browser behavior
        e.preventDefault();
        
        try {
          // Execute the mapped function
          shortcuts[shortcutString](e);
        } catch (error) {
          console.error(\`Error executing shortcut \${shortcutString}:\`, error);
        }
      }
    };

    // Attach event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, active]);
}
`;
fs.writeFileSync('src/hooks/useKeyboardShortcuts.ts', content);
