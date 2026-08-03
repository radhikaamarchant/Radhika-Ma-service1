const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

// Insert formatter function
const formatterStr = `
const formatCompactINRDesktop = (number: number): string => {
  if (number >= 10000000) {
    return '₹' + (number / 10000000).toFixed(2).replace(/\.00$/, '') + 'Cr';
  }
  if (number >= 100000) {
    return '₹' + (number / 100000).toFixed(2).replace(/\.00$/, '') + 'Lk';
  }
  if (number >= 1000) {
    return '₹' + (number / 1000).toFixed(2).replace(/\.00$/, '') + 'K';
  }
  return '₹' + number.toString();
};
`;

if (!code.includes("formatCompactINRDesktop")) {
  code = code.replace("export default function DataAnalysis", formatterStr + "\nexport default function DataAnalysis");
}

const originalStatsGrid = `<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a]">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Total Investors</p>
                    <p className="text-xl font-medium text-white">{totalInvestors}</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a]">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Active Investors</p>
                    <p className="text-xl font-medium text-kite-blue">{activeInvestors}</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a]">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Total Invested</p>
                    <p className="text-xl font-medium text-white">{formatINR(totalInvestedAmount)}</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a]">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Currently Invested</p>
                    <p className="text-xl font-medium text-kite-blue">{formatINR(currentInvestedAmount)}</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a]">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Profit Paid Out</p>
                    <p className="text-xl font-medium text-[#4CAF50]">{formatINR(totalProfitPaid)}</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a]">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Expected Profit</p>
                    <p className="text-xl font-medium text-amber-500">{formatINR(expectedProfit)}</p>
                </div>
            </div>`;

const newStatsGrid = `            {/* Mobile Stats */}
            <div className="grid grid-cols-2 md:hidden gap-4">
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a]">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Total Investors</p>
                    <p className="text-xl font-medium text-white">{totalInvestors}</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a]">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Active Investors</p>
                    <p className="text-xl font-medium text-kite-blue">{activeInvestors}</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a]">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Total Invested</p>
                    <p className="text-xl font-medium text-white">{formatINR(totalInvestedAmount)}</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a]">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Currently Invested</p>
                    <p className="text-xl font-medium text-kite-blue">{formatINR(currentInvestedAmount)}</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a]">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Profit Paid Out</p>
                    <p className="text-xl font-medium text-[#4CAF50]">{formatINR(totalProfitPaid)}</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a]">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Expected Profit</p>
                    <p className="text-xl font-medium text-amber-500">{formatINR(expectedProfit)}</p>
                </div>
            </div>

            {/* Desktop Stats */}
            <div className="hidden md:grid grid-cols-6 gap-0 divide-x divide-[#2a2a2a] border-y border-[#2a2a2a] py-6">
                <div className="px-4 first:pl-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Total Investors</p>
                    <p className="text-base font-medium text-white">{totalInvestors}</p>
                </div>
                <div className="px-4">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Active Investors</p>
                    <p className="text-base font-medium text-kite-blue">{activeInvestors}</p>
                </div>
                <div className="px-4">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Total Invested</p>
                    <p className="text-base font-medium text-white">{formatCompactINRDesktop(totalInvestedAmount)}</p>
                </div>
                <div className="px-4">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Currently Invested</p>
                    <p className="text-base font-medium text-kite-blue">{formatCompactINRDesktop(currentInvestedAmount)}</p>
                </div>
                <div className="px-4">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Profit Paid Out</p>
                    <p className="text-base font-medium text-[#4CAF50]">{formatCompactINRDesktop(totalProfitPaid)}</p>
                </div>
                <div className="px-4 last:pr-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Expected Profit</p>
                    <p className="text-base font-medium text-amber-500">{formatCompactINRDesktop(expectedProfit)}</p>
                </div>
            </div>`;

code = code.replace(originalStatsGrid, newStatsGrid);

const originalDocs = `<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#2a2a2a]">
                            <div>
                                <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-3">Documents</p>
                                <div className="flex flex-wrap gap-2">
                                    {business.companyInfo.documents && business.companyInfo.documents.length > 0 ? (
                                        business.companyInfo.documents.map((doc, idx) => (
                                            <span key={idx} className="bg-[#222] border border-[#333] px-3 py-1.5 rounded text-xs text-gray-300">{doc}</span>
                                        ))
                                    ) : (
                                        <span className="text-gray-500 text-sm">No documents provided</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-3">Government Reg Identifies</p>
                                <div className="flex flex-wrap gap-2">
                                    {business.companyInfo.governmentRegIdentifies && business.companyInfo.governmentRegIdentifies.length > 0 ? (
                                        business.companyInfo.governmentRegIdentifies.map((reg, idx) => (
                                            <span key={idx} className="bg-[#222] border border-[#333] px-3 py-1.5 rounded text-xs text-gray-300">{reg}</span>
                                        ))
                                    ) : (
                                        <span className="text-gray-500 text-sm">No reg identifies provided</span>
                                    )}
                                </div>
                            </div>
                        </div>`;

const newDocs = `<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#2a2a2a]">
                            <div>
                                <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-3">Documents</p>
                                <div className="flex flex-wrap gap-2 md:hidden">
                                    {business.companyInfo.documents && business.companyInfo.documents.length > 0 ? (
                                        business.companyInfo.documents.map((doc, idx) => (
                                            <span key={idx} className="bg-[#222] border border-[#333] px-3 py-1.5 rounded text-xs text-gray-300">{doc}</span>
                                        ))
                                    ) : (
                                        <span className="text-gray-500 text-sm">No documents provided</span>
                                    )}
                                </div>
                                <div className="hidden md:flex flex-col gap-2.5">
                                    {business.companyInfo.documents && business.companyInfo.documents.length > 0 ? (
                                        business.companyInfo.documents.map((doc, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <BadgeCheck className="w-4 h-4 text-kite-blue shrink-0" />
                                                <span className="text-[13px] text-gray-300 font-medium">{doc}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-gray-500 text-sm">No documents provided</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-3">Government Reg Identifies</p>
                                <div className="flex flex-wrap gap-2 md:hidden">
                                    {business.companyInfo.governmentRegIdentifies && business.companyInfo.governmentRegIdentifies.length > 0 ? (
                                        business.companyInfo.governmentRegIdentifies.map((reg, idx) => (
                                            <span key={idx} className="bg-[#222] border border-[#333] px-3 py-1.5 rounded text-xs text-gray-300">{reg}</span>
                                        ))
                                    ) : (
                                        <span className="text-gray-500 text-sm">No reg identifies provided</span>
                                    )}
                                </div>
                                <div className="hidden md:flex flex-col gap-2.5">
                                    {business.companyInfo.governmentRegIdentifies && business.companyInfo.governmentRegIdentifies.length > 0 ? (
                                        business.companyInfo.governmentRegIdentifies.map((reg, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <BadgeCheck className="w-4 h-4 text-kite-blue shrink-0" />
                                                <span className="text-[13px] text-gray-300 font-medium">{reg}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-gray-500 text-sm">No reg identifies provided</span>
                                    )}
                                </div>
                            </div>
                        </div>`;
                        
code = code.replace(originalDocs, newDocs);

fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
