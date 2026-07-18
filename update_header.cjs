const fs = require('fs');

let code = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

// Ensure ChevronLeft is imported
if (!code.includes('ChevronLeft')) {
  code = code.replace('ChevronDown,', 'ChevronDown,\n  ChevronLeft,');
}

// Add formatCompactINR function
const compactFn = `
export function formatCompactINR(number: number): string {
  if (number >= 10000000) {
    return '₹' + (number / 10000000).toFixed(1).replace(/\\.0$/, '') + 'CR';
  }
  if (number >= 100000) {
    return '₹' + (number / 100000).toFixed(1).replace(/\\.0$/, '') + 'L';
  }
  if (number >= 1000) {
    return '₹' + (number / 1000).toFixed(1).replace(/\\.0$/, '') + 'K';
  }
  return '₹' + number.toString();
}

export default function Investments() {
`;

if (!code.includes('formatCompactINR')) {
  code = code.replace('export default function Investments() {', compactFn);
}

const targetHeader = `            {/* Header */}
            <div className="flex items-center px-4 pb-3 bg-white dark:bg-[#2B3648] border-b border-gray-200 dark:border-[#44546A] shrink-0 z-10 mobile-header-safe">
              <button
                onClick={() => { setShowAddForm(false); setIsFromAnalysis(false); }}
                className="text-gray-700 dark:text-[#F1F5F9] p-2 -ml-2 flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="ml-2 flex-1 mt-0.5">
                <h2 className="text-[17px] font-normal text-gray-900 dark:text-[#F1F5F9] leading-tight">
                  {selectedBusiness ? selectedBusiness.name.toUpperCase() : "New Investment"}
                </h2>
                <p className="text-[12px] text-gray-500 dark:text-[#7A7A7A] mt-0.5 font-normal">
                  FND {selectedBusiness ? formatINR(selectedBusiness.fundingRequired || 0) : "₹0"} • INC {selectedBusiness ? formatINR(state.investments.filter((inv: any) => inv.businessId === selectedBusiness.id).reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0)) : "₹0"}
                </p>
              </div>
            </div>`;

const newHeader = `            {/* Header */}
            <div className="flex flex-col bg-[#F3F4F6] dark:bg-[#1E2938] shrink-0 z-10 mobile-header-safe pt-2">
              <div className="flex items-center px-4 py-3">
                <button
                  onClick={() => { setShowAddForm(false); setIsFromAnalysis(false); }}
                  className="text-gray-700 dark:text-[#F1F5F9] -ml-2 p-1 mr-3 flex items-center justify-center"
                >
                  <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
                </button>
                <div className="flex-1 mt-0.5">
                  <h2 className="text-[20px] font-normal text-gray-900 dark:text-[#F1F5F9] leading-tight tracking-wide">
                    {selectedBusiness ? (selectedBusiness.shortName || selectedBusiness.name).toUpperCase() : "NEW INVESTMENT"}
                  </h2>
                </div>
              </div>

              {selectedBusiness && (
                <div className="flex items-center px-4 py-3.5 bg-white dark:bg-[#2B3648] border-b border-gray-200 dark:border-[#44546A] overflow-x-auto hide-scrollbar">
                  <div className="flex items-center space-x-5 text-[14px] whitespace-nowrap">
                    {selectedBusiness.investmentType === 'trigger' && selectedBusiness.triggerAmount && (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-[#7F8895] flex items-center justify-center">
                        </div>
                        <span className="text-gray-500 dark:text-[#A3ACB8]">SHARE <span className="text-gray-900 dark:text-[#F1F5F9] ml-1">₹{selectedBusiness.triggerAmount}</span></span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full border border-[#4184F3] flex items-center justify-center">
                         <div className="w-2 h-2 rounded-full bg-[#4184F3]"></div>
                      </div>
                      <span className="text-gray-500 dark:text-[#A3ACB8]">FND <span className="text-gray-900 dark:text-[#F1F5F9] ml-1">{formatCompactINR(selectedBusiness.fundingRequired || 0)}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-[#7F8895] flex items-center justify-center"></div>
                      <span className="text-gray-500 dark:text-[#A3ACB8]">INC <span className="text-gray-900 dark:text-[#F1F5F9] ml-1">{formatCompactINR(state.investments.filter((inv: any) => inv.businessId === selectedBusiness.id).reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0))}</span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>`;

if (code.includes(targetHeader)) {
  code = code.replace(targetHeader, newHeader);
  fs.writeFileSync('src/pages/Investments.tsx', code);
  console.log('Successfully updated mobile header!');
} else {
  console.log('Target header not found.');
}
