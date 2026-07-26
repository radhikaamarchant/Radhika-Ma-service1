const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace footer nav container to add safe area bottom padding
// from: <div className="md:hidden fixed bottom-0 left-0 w-full h-[56px] bg-white dark:bg-kite-bg border-t border-kite-border flex justify-between items-center z-[100] shadow-[0_-2px_10px_rgba(0,0,0,0.02)] footer-nav">
const oldFooter = `<div className="md:hidden fixed bottom-0 left-0 w-full h-[56px] bg-white dark:bg-kite-bg border-t border-kite-border flex justify-between items-center z-[100] shadow-[0_-2px_10px_rgba(0,0,0,0.02)] footer-nav">`;
const newFooter = `<div className="md:hidden fixed bottom-0 left-0 w-full h-[calc(56px+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-white dark:bg-kite-bg border-t border-kite-border flex justify-between items-center z-[100] shadow-[0_-2px_10px_rgba(0,0,0,0.02)] footer-nav">`;

content = content.replace(oldFooter, newFooter);

fs.writeFileSync('src/App.tsx', content);
console.log("Added safe area support to mobile footer");
