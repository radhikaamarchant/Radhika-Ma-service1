const fs = require('fs');

let code = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

// Update Business Label
code = code.replace(
    '<p className="text-[11px] text-gray-500 dark:text-[#A3ACB8] font-medium mb-1 uppercase tracking-wider">Business</p>',
    '<p className="text-[11px] text-[#7A7A7A] dark:text-[#A3ACB8] font-normal mb-1 uppercase tracking-wider">Business</p>'
);

// Update Business Value
code = code.replace(
    '<p className="text-[15px] font-medium text-gray-900 dark:text-[#F1F5F9] truncate pr-2">',
    '<p className="text-[15px] font-normal text-[#444444] dark:text-[#F1F5F9] truncate pr-2">'
);

// Update Investor Label
code = code.replace(
    '<p className="text-[11px] text-gray-500 dark:text-[#A3ACB8] font-medium mb-1 uppercase tracking-wider">Investor</p>',
    '<p className="text-[11px] text-[#7A7A7A] dark:text-[#A3ACB8] font-normal mb-1 uppercase tracking-wider">Investor</p>'
);

// Update Investor Value
code = code.replace(
    '<p className="text-[15px] font-medium text-gray-900 dark:text-[#F1F5F9] truncate pr-2">\n                              {selectedInvestor ? selectedInvestor.name.toUpperCase() : "Select Investor"}',
    '<p className="text-[15px] font-normal text-[#444444] dark:text-[#F1F5F9] truncate pr-2">\n                              {selectedInvestor ? selectedInvestor.name.toUpperCase() : "Select Investor"}'
);

// Update Amount/Quantity Label (mobile)
code = code.replace(
    '<p className="text-[14px] text-gray-800 dark:text-[#E3E3E3] font-semibold">\n                                  {inputMode === \\\'AMOUNT\\\' ? \\\'Amount\\\' : \\\'Quantity\\\'}\n                                </p>',
    '<p className="text-[14px] text-[#444444] dark:text-[#E3E3E3] font-normal">\n                                  {inputMode === \\\'AMOUNT\\\' ? \\\'Amount\\\' : \\\'Quantity\\\'}\n                                </p>'
);

// Update Amount/Quantity Input (mobile)
code = code.replace(
    'className="flex-1 bg-transparent px-3 py-3 text-[16px] font-medium text-gray-900 dark:text-[#F1F5F9] outline-none placeholder-gray-400 min-w-0"',
    'className="flex-1 bg-transparent px-3 py-3 text-[16px] font-normal text-[#444444] dark:text-[#F1F5F9] outline-none placeholder-[#A0A0A0] min-w-0"'
);

// Update regular Amount Label (mobile)
code = code.replace(
    '<div className="px-1">\n                               <p className="text-[14px] text-gray-800 dark:text-[#E3E3E3] font-semibold">Amount</p>\n                             </div>',
    '<div className="px-1">\n                               <p className="text-[14px] text-[#444444] dark:text-[#E3E3E3] font-normal">Amount</p>\n                             </div>'
);

// Update regular Amount Input (mobile)
code = code.replace(
    'className="w-full bg-transparent px-3 py-3 text-[16px] font-medium text-gray-900 dark:text-[#F1F5F9] outline-none placeholder-gray-400"',
    'className="w-full bg-transparent px-3 py-3 text-[16px] font-normal text-[#444444] dark:text-[#F1F5F9] outline-none placeholder-[#A0A0A0]"'
);

fs.writeFileSync('src/pages/Investments.tsx', code);
console.log('Successfully updated form text styles!');
