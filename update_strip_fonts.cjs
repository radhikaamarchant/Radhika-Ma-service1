const fs = require('fs');
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

code = code.replace(
    '<span className="text-gray-500 dark:text-[#A3ACB8]">BSE <span className="text-gray-900 dark:text-[#F1F5F9] ml-1">₹{selectedBusiness.triggerAmount}</span></span>',
    '<span className="text-gray-500 dark:text-[#A3ACB8] font-normal">BSE <span className="font-normal text-[#444444] dark:text-[#F1F5F9] ml-1">₹{selectedBusiness.triggerAmount}</span></span>'
);

code = code.replace(
    '<span className="text-gray-500 dark:text-[#A3ACB8]">FND <span className="text-gray-900 dark:text-[#F1F5F9] ml-1">{formatCompactINR(selectedBusiness.fundingRequired || 0)}</span></span>',
    '<span className="text-gray-500 dark:text-[#A3ACB8] font-normal">FND <span className="font-normal text-[#444444] dark:text-[#F1F5F9] ml-1">{formatCompactINR(selectedBusiness.fundingRequired || 0)}</span></span>'
);

code = code.replace(
    '<span className="text-gray-500 dark:text-[#A3ACB8]">INC <span className="text-gray-900 dark:text-[#F1F5F9] ml-1">{formatCompactINR(state.investments.filter((inv: any) => inv.businessId === selectedBusiness.id).reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0))}</span></span>',
    '<span className="text-gray-500 dark:text-[#A3ACB8] font-normal">INC <span className="font-normal text-[#444444] dark:text-[#F1F5F9] ml-1">{formatCompactINR(state.investments.filter((inv: any) => inv.businessId === selectedBusiness.id).reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0))}</span></span>'
);

// Update main amount/quantity inputs too
code = code.replace(
    'className="flex-1 bg-transparent px-3 py-3 text-[16px] font-normal text-[#444444] dark:text-[#F1F5F9] outline-none placeholder-[#A0A0A0] min-w-0"',
    'className="flex-1 bg-transparent px-3 py-3 text-[16px] font-normal text-[#444444] dark:text-[#F1F5F9] outline-none placeholder-[#A0A0A0] min-w-0"'
);

fs.writeFileSync('src/pages/Investments.tsx', code);
console.log("Success");
