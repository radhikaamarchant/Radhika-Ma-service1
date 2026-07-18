const fs = require('fs');
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

// Business Name
code = code.replace(
    '<p className="text-[15px] font-normal text-[#444444] dark:text-[#F1F5F9] truncate pr-2">',
    '<p className="text-[15px] font-light text-[#444444] dark:text-[#F1F5F9] truncate pr-2">'
);

// Investor Name
code = code.replace(
    '<p className="text-[15px] font-normal text-[#444444] dark:text-[#F1F5F9] truncate pr-2">\\n                              {selectedInvestor ? selectedInvestor.name.toUpperCase() : "Select Investor"}',
    '<p className="text-[15px] font-light text-[#444444] dark:text-[#F1F5F9] truncate pr-2">\\n                              {selectedInvestor ? selectedInvestor.name.toUpperCase() : "Select Investor"}'
);

// Strip amounts
code = code.replace(
    '<span className="font-normal text-[#444444] dark:text-[#F1F5F9] ml-1">₹{selectedBusiness.triggerAmount}</span>',
    '<span className="font-light text-[#444444] dark:text-[#F1F5F9] ml-1">₹{selectedBusiness.triggerAmount}</span>'
);

code = code.replace(
    '<span className="font-normal text-[#444444] dark:text-[#F1F5F9] ml-1">{formatCompactINR(selectedBusiness.fundingRequired || 0)}</span>',
    '<span className="font-light text-[#444444] dark:text-[#F1F5F9] ml-1">{formatCompactINR(selectedBusiness.fundingRequired || 0)}</span>'
);

code = code.replace(
    '<span className="font-normal text-[#444444] dark:text-[#F1F5F9] ml-1">{formatCompactINR(state.investments.filter((inv: any) => inv.businessId === selectedBusiness.id).reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0))}</span>',
    '<span className="font-light text-[#444444] dark:text-[#F1F5F9] ml-1">{formatCompactINR(state.investments.filter((inv: any) => inv.businessId === selectedBusiness.id).reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0))}</span>'
);

// Amount Input
code = code.replace(
    'className="flex-1 bg-transparent px-3 py-3 text-[16px] font-normal text-[#444444] dark:text-[#F1F5F9] outline-none placeholder-[#A0A0A0] min-w-0"',
    'className="flex-1 bg-transparent px-3 py-3 text-[16px] font-light text-[#444444] dark:text-[#F1F5F9] outline-none placeholder-[#A0A0A0] min-w-0"'
);

// Amount Input 2
code = code.replace(
    'className="w-full bg-transparent px-3 py-3 text-[16px] font-normal text-[#444444] dark:text-[#F1F5F9] outline-none placeholder-[#A0A0A0]"',
    'className="w-full bg-transparent px-3 py-3 text-[16px] font-light text-[#444444] dark:text-[#F1F5F9] outline-none placeholder-[#A0A0A0]"'
);

// Labels
code = code.replace(
    '<p className="text-[14px] text-[#444444] dark:text-[#E3E3E3] font-normal">\n                                  {inputMode === \\\'AMOUNT\\\' ? \\\'Amount\\\' : \\\'Quantity\\\'}\n                                </p>',
    '<p className="text-[14px] text-[#444444] dark:text-[#E3E3E3] font-light">\n                                  {inputMode === \\\'AMOUNT\\\' ? \\\'Amount\\\' : \\\'Quantity\\\'}\n                                </p>'
);

code = code.replace(
    '<div className="px-1">\n                               <p className="text-[14px] text-[#444444] dark:text-[#E3E3E3] font-normal">Amount</p>\n                             </div>',
    '<div className="px-1">\n                               <p className="text-[14px] text-[#444444] dark:text-[#E3E3E3] font-light">Amount</p>\n                             </div>'
);

fs.writeFileSync('src/pages/Investments.tsx', code);
console.log("Success");
