const fs = require('fs');

let code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf8');
const lines = code.split('\n');

for (let i = 1150; i < lines.length && i <= 1750; i++) {
  // Main container bg to dark:md:bg-[#222222] -> wait, we can just replace dark:bg-[#111111] with dark:bg-[#222222] inside desktop view
  lines[i] = lines[i].replace(/dark:bg-\[#111111\]/g, 'dark:bg-[#222222]');
  
  // Header background
  if (lines[i].includes('bg-[#4184F3]" : "bg-[#FF5722]"')) {
    lines[i] = lines[i].replace('bg-[#4184F3]" : "bg-[#FF5722]"', 'bg-[#4184F3] dark:bg-[#222222]" : "bg-[#FF5722] dark:bg-[#222222]"');
  }

  // Header text color
  if (lines[i].includes('className="text-[16px] font-bold tracking-wide text-white !text-white"')) {
    lines[i] = lines[i].replace('className="text-[16px] font-bold tracking-wide text-white !text-white"', 'className="text-[16px] dark:text-[14px] font-bold tracking-wide text-white dark:!text-[#BBBBBB]"');
  }
  
  // Tab strip background
  if (lines[i].includes('bg-gray-50/80 dark:bg-[#141414] border-b')) {
    lines[i] = lines[i].replace('dark:bg-[#141414]', 'dark:bg-[#4444441A]');
  }

  // Tab strip text
  if (lines[i].includes('border-[#4184F3] text-[#4184F3]" : "border-[#FF5722] text-[#FF5722]"')) {
    lines[i] = lines[i].replace('border-[#4184F3] text-[#4184F3]" : "border-[#FF5722] text-[#FF5722]"', 'border-[#4184F3] text-[#4184F3] dark:text-[#D4603B] dark:border-[#D4603B]" : "border-[#FF5722] text-[#FF5722] dark:text-[#D4603B] dark:border-[#D4603B]"');
    lines[i] = lines[i].replace('border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-[#E3E3E3]"', 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-[#E3E3E3] dark:text-[#BBBBBB]"');
  }

  // General labels / inactive text
  lines[i] = lines[i].replace(/dark:text-\[#C4C4C4\]/g, 'dark:text-[#BBBBBB]');
  
  // Input values
  lines[i] = lines[i].replace(/dark:text-\[#E3E3E3\]/g, 'dark:text-[#FFFFFF]');

  // Floating labels specific
  if (lines[i].includes('text-[#9B9B9B] bg-[#FFFFFF]')) {
    lines[i] = lines[i].replace('text-[#9B9B9B]', 'text-[#9B9B9B] dark:text-[#666666]');
  }
  if (lines[i].includes('text-[#9B9B9B] group-focus-within:')) {
    lines[i] = lines[i].replace('text-[#9B9B9B] group-focus-within:', 'text-[#9B9B9B] dark:text-[#666666] group-focus-within:');
  }

  // Buttons
  if (lines[i].includes('bg-[#4184F3] hover:bg-[#3367D6]" : "bg-[#FF5722] hover:bg-[#E64A19]"')) {
    lines[i] = lines[i].replace('bg-[#4184F3] hover:bg-[#3367D6]" : "bg-[#FF5722] hover:bg-[#E64A19]"', 'bg-[#4184F3] dark:bg-[#387ed1] hover:bg-[#3367D6]" : "bg-[#FF5722] dark:bg-[#D4603B] hover:bg-[#E64A19]"');
  }
  if (lines[i].includes('Cancel') && lines[i-1].includes('onClick={onClose}')) {
    lines[i-2] = lines[i-2].replace('dark:border-[#2A2A2A]', 'dark:border-[#444444]');
    lines[i-2] = lines[i-2].replace('hover:bg-gray-50 dark:md:hover:bg-[#131415]', 'dark:bg-transparent hover:bg-gray-50 dark:md:hover:bg-[#131415]');
    // Wait, the cancel button text color is dark:text-[#BBBBBB], we already replaced C4C4C4 with BBBBBB above so it should be fine.
  }
}

fs.writeFileSync('src/components/AddInvestmentModal.tsx', lines.join('\n'));
