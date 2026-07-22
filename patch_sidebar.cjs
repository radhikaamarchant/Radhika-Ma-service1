const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessSidebar.tsx', 'utf8');

// Update LiveSidebarValue wrapper
code = code.replace(
  /className="grid grid-cols-\[minmax\(0,1fr\)_52px_58px_65px\] gap-x-\[4px\] items-center w-full"/,
  'className="grid grid-cols-[minmax(0,1fr)_75px_85px_85px] gap-x-[4px] items-center w-full"'
);

// Update span 1
code = code.replace(
  /className="text-\[12px\] whitespace-nowrap overflow-hidden text-ellipsis uppercase"/,
  'className="text-[13px] whitespace-nowrap overflow-hidden text-ellipsis uppercase"'
);

// Update span 2
code = code.replace(
  /className="text-right text-\[11px\] tabular-nums" style=\{\{ color: absColorHex \}\}/,
  'className="text-right text-[12px] tabular-nums" style={{ color: absColorHex }}'
);

// Update span 3
code = code.replace(
  /className="text-right text-\[11px\] tabular-nums" style=\{\{ color: pctColorHex \}\}/,
  'className="text-right text-[12px] tabular-nums" style={{ color: pctColorHex }}'
);

// Update span 4
code = code.replace(
  /className="text-right text-\[12px\] font-medium tabular-nums"/,
  'className="text-right text-[13px] font-medium tabular-nums"'
);

// Update wrapper padding
code = code.replace(
  /className="pl-\[12px\] pr-\[4px\] py-\[4px\] cursor-pointer border-b border-kite-border dark:border-\[#2b2b2b\] hover:bg-gray-50 dark:hover:bg-\[#2a2a2a\] transition-colors group bg-white dark:bg-\[#1e1e1e\]"/,
  'style={{ padding: "10px 12px" }} className="cursor-pointer border-b border-kite-border dark:border-[#2b2b2b] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors group bg-white dark:bg-[#1e1e1e]"'
);

fs.writeFileSync('src/components/BusinessSidebar.tsx', code);
