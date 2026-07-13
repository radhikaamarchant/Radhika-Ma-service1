const fs = require('fs');

let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

const originalModalStart = `<div className="relative w-full max-w-4xl bg-white dark:bg-kite-bg rounded-lg shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] min-h-[400px] animate-scale-in" onClick={(e) => e.stopPropagation()}>`;

const originalImageSide = `<div className="w-full md:w-1/2 bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center h-[300px] md:h-auto md:min-h-0 relative shrink-0 border-b md:border-b-0 md:border-r border-kite-border">`;

const originalInfoSide = `<div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto bg-white dark:bg-kite-bg">`;

const originalBio = `<h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-2">Bio</h3>`;
const originalAddress = `<h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-2">Full Address</h3>`;

content = content.replace(originalModalStart, `<div className="relative w-full max-w-4xl bg-white dark:bg-kite-bg rounded-lg shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh] animate-scale-in" onClick={(e) => e.stopPropagation()}>`);
content = content.replace(originalImageSide, `<div className="w-full md:w-1/2 bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center h-[40vh] md:h-auto md:min-h-0 relative shrink-0 border-b md:border-b-0 md:border-r border-kite-border">`);
content = content.replace(originalInfoSide, `<div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto bg-white dark:bg-kite-bg flex-1">`);
content = content.replace(originalBio, `<!-- <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-2">Bio</h3> -->`);
content = content.replace(originalAddress, `<!-- <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-2">Full Address</h3> -->`);

fs.writeFileSync('src/pages/Investors.tsx', content);
