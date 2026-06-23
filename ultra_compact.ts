import fs from 'fs';

let content = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

// For "Withdrawal Payout Setup", it has a modal/view:
// We want to make it super compact and side-by-side on mobile.
content = content.replace(/className="grid grid-cols-1 md:grid-cols-2 gap-4"/g, 'className="grid grid-cols-2 gap-2 md:gap-4"');
// Make the outer wrapper less padded
content = content.replace(/p-3 sm:p-4 md:p-3 md:p-6/g, 'p-2 md:p-4');

// The withdraw form
content = content.replace(/className="w-full border border-gray-300 rounded-lg p-2 sm:p-3/g, 'className="w-full border border-gray-300 rounded-lg p-1.5 md:p-3 text-xs md:text-sm');
content = content.replace(/p-2 sm:p-3 font-bold focus/g, 'p-1.5 sm:p-3 font-bold focus');
content = content.replace(/p-3 sm:p-4 rounded-xl/g, 'p-2 md:p-4 rounded-xl');

// Decrease texts inside
content = content.replace(/text-sm md:text-lg/g, 'text-xs md:text-base');

// Business and investor bank details box inside the grid
content = content.replace(/space-y-2 sm:space-y-3 bg-white p-3 sm:p-4/g, 'space-y-1 md:space-y-3 bg-white p-2 md:p-4');

// Pay now button
content = content.replace(/px-6 py-2 sm:px-12 sm:py-3 rounded-xl font-black text-base md:text-lg/g, 'px-4 py-2 sm:px-12 sm:py-3 rounded-lg font-black text-sm md:text-lg');

// Fix specific layout sizes
content = content.replace(/max-w-4xl/g, 'max-w-6xl');
content = content.replace(/w-8 h-8 rounded-full/g, 'w-5 h-5 md:w-8 md:h-8 text-[10px] md:text-sm rounded-full');

content = content.replace(/<div className="flex justify-between items-center mb-2 pt-2">/g, '<div className="flex justify-between items-center mb-1 md:mb-2 pt-1 md:pt-2">');

content = content.replace(/<p className="font-bold text-gray-900">/g, '<p className="font-bold text-[10px] md:text-base text-gray-900">');
content = content.replace(/<div className="font-mono text-sm">/g, '<div className="font-mono text-[9px] md:text-sm">');

fs.writeFileSync('src/pages/Investors.tsx', content, 'utf8');
