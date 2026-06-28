import fs from 'fs';

let text = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

text = text.replace(/bg-white md:bg-gray-900\/60/g, 'bg-white dark:bg-kite-bg md:bg-gray-900/60 dark:md:bg-gray-900/80');
text = text.replace(/<div className="bg-white md:rounded w-full h-full md:h-auto md:max-h-\[90vh\] md:max-w-2xl flex flex-col overflow-hidden relative">/g, '<div className="bg-white dark:bg-kite-bg md:rounded w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl flex flex-col overflow-hidden relative">');
text = text.replace(/<div className="shrink-0 bg-white border-b border-kite-border px-3 py-2 md:px-4 md:py-3 flex justify-between items-center z-10">/g, '<div className="shrink-0 bg-white dark:bg-kite-surface border-b border-kite-border px-3 py-2 md:px-4 md:py-3 flex justify-between items-center z-10">');
text = text.replace(/<div className="p-4 md:p-6 flex-1 overflow-y-auto bg-white">/g, '<div className="p-4 md:p-6 flex-1 overflow-y-auto bg-white dark:bg-kite-bg">');

fs.writeFileSync('src/pages/Investments.tsx', text);
