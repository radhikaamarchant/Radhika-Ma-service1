const fs = require('fs');

let code = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

// Fix Header
code = code.replace(
  /<div className="hidden md:flex items-center px-4 bg-white dark:bg-\[#1a1a1a\] border-b border-kite-border w-full">/g,
  '<div className="hidden md:flex items-stretch px-4 bg-white dark:bg-[#1a1a1a] border-b border-kite-border w-full">'
);

code = code.replace(
  /<div className="w-\[30%\] text-left py-2 text-\[12px\] text-kite-text">/g,
  '<div className="w-[30%] flex items-center text-left py-2 text-[12px] text-kite-text">'
);

code = code.replace(
  /<div className="w-\[14%\] text-left py-2 text-\[12px\] text-kite-text border-l border-kite-vertical-divider pl-4">/g,
  '<div className="w-[14%] flex items-center text-left py-2 text-[12px] text-kite-text border-l border-kite-vertical-divider pl-4">'
);

code = code.replace(
  /<div className="w-\[18%\] text-right py-2 text-\[12px\] text-kite-text border-l border-kite-vertical-divider pr-4">/g,
  '<div className="w-[18%] flex items-center justify-end py-2 text-[12px] text-kite-text border-l border-kite-vertical-divider pr-4">'
);

code = code.replace(
  /<div className="w-\[16%\] text-right py-2 text-\[12px\] text-kite-text border-l border-kite-vertical-divider pr-4">/g,
  '<div className="w-[16%] flex items-center justify-end py-2 text-[12px] text-kite-text border-l border-kite-vertical-divider pr-4">'
);

code = code.replace(
  /<div className="w-\[22%\] text-right py-2 text-\[12px\] text-kite-text border-l border-kite-vertical-divider pl-5">/g,
  '<div className="w-[22%] flex items-center justify-end py-2 text-[12px] text-kite-text border-l border-kite-vertical-divider pl-5">'
);

// Fix Rows
code = code.replace(
  /<div className="hidden md:flex items-center w-full px-4 border-b border-kite-border">/g,
  '<div className="hidden md:flex items-stretch w-full px-4 border-b border-kite-border">'
);

code = code.replace(
  /<div className="w-\[14%\] text-left py-3 text-\[12px\] text-kite-text font-mono truncate pl-4 border-l border-kite-vertical-divider">/g,
  '<div className="w-[14%] flex items-center text-left py-3 text-[12px] text-kite-text font-mono truncate pl-4 border-l border-kite-vertical-divider">'
);

code = code.replace(
  /<div className="w-\[18%\] text-right py-3 text-\[13px\] font-normal text-kite-text pr-4 border-l border-kite-vertical-divider truncate">/g,
  '<div className="w-[18%] flex items-center justify-end py-3 text-[13px] font-normal text-kite-text pr-4 border-l border-kite-vertical-divider truncate">'
);

code = code.replace(
  /<div className="w-\[16%\] text-right py-3 text-\[13px\] pr-4 border-l border-kite-vertical-divider truncate">/g,
  '<div className="w-[16%] flex items-center justify-end py-3 text-[13px] pr-4 border-l border-kite-vertical-divider truncate">'
);

code = code.replace(
  /<div className="w-\[22%\] text-right py-3 text-\[13px\] font-normal pl-5 border-l border-kite-vertical-divider truncate">/g,
  '<div className="w-[22%] flex items-center justify-end py-3 text-[13px] font-normal pl-5 border-l border-kite-vertical-divider truncate">'
);

fs.writeFileSync('src/pages/Investors.tsx', code);
