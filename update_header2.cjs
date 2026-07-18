const fs = require('fs');

let code = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

const targetHeader = `{selectedBusiness && (
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
              )}`;

const newHeader = `{selectedBusiness && (
                <div className="px-4 pb-4">
                  <div className="flex items-center px-4 py-3.5 bg-white dark:bg-[#2B3648] overflow-x-auto hide-scrollbar rounded-sm shadow-sm">
                    <div className="flex items-center space-x-5 text-[14px] whitespace-nowrap">
                      {selectedBusiness.investmentType === 'trigger' && selectedBusiness.triggerAmount && (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-[#7F8895] flex items-center justify-center">
                          </div>
                          <span className="text-gray-500 dark:text-[#A3ACB8]">BSE <span className="text-gray-900 dark:text-[#F1F5F9] ml-1">₹{selectedBusiness.triggerAmount}</span></span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-[#7F8895] flex items-center justify-center">
                        </div>
                        <span className="text-gray-500 dark:text-[#A3ACB8]">FND <span className="text-gray-900 dark:text-[#F1F5F9] ml-1">{formatCompactINR(selectedBusiness.fundingRequired || 0)}</span></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-[#7F8895] flex items-center justify-center"></div>
                        <span className="text-gray-500 dark:text-[#A3ACB8]">INC <span className="text-gray-900 dark:text-[#F1F5F9] ml-1">{formatCompactINR(state.investments.filter((inv: any) => inv.businessId === selectedBusiness.id).reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0))}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}`;

if (code.includes(targetHeader)) {
  code = code.replace(targetHeader, newHeader);
  fs.writeFileSync('src/pages/Investments.tsx', code);
  console.log('Successfully updated mobile header 2!');
} else {
  console.log('Target header not found.');
}
