import fs from 'fs';

const code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

const targetStr = `                  {/* Amount */}
                  <div className="flex flex-col space-y-6 md:space-y-0">
                     <div className="w-full border-b border-gray-200 dark:border-[#44546A] pt-2 px-4 pb-0 md:p-4 relative z-10">
                        <p className="text-[11px] text-gray-500 dark:text-[#A3ACB8] font-medium mb-1 md:mb-2 uppercase tracking-wider">Investment Amount</p>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full bg-transparent px-0 py-0 pb-2 md:pb-0 md:py-1 text-[18px] font-medium text-gray-900 dark:text-[#F1F5F9] outline-none placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="₹0"
                            value={formData.amount ? \`₹\${formData.amount}\` : ""}
                            onChange={handleAmountChange}
                          />
                        </div>
                     </div>
                     <div className="hidden md:block w-full border-b border-gray-200 dark:border-[#44546A] pt-2 px-4 pb-0 md:p-4 relative z-10">
                        <p className="text-[11px] text-gray-500 dark:text-[#A3ACB8] font-medium mb-1 md:mb-2 uppercase tracking-wider">Duration (M)</p>
                        <div className="relative">
                          <input
                            type="number"
                            className="w-full bg-transparent px-0 py-0 pb-2 md:pb-0 md:py-1 text-[18px] font-medium text-gray-900 dark:text-[#F1F5F9] outline-none placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="12"
                            value={formData.timePeriodMonths}
                            onChange={(e) => setFormData({ ...formData, timePeriodMonths: e.target.value })}
                          />
                        </div>
                     </div>
                     <div className="md:hidden w-full border-b border-gray-200 dark:border-[#44546A] pt-2 px-4 pb-2 relative z-10">`;

const replacementStr = `                  {/* Amount */}
                  <div className="flex flex-col space-y-6 md:space-y-0">
                     <div className="w-full border-b border-gray-200 dark:border-[#44546A] pt-2 px-4 pb-2.5 md:p-4 relative z-10">
                        <p className="text-[11px] text-gray-500 dark:text-[#A3ACB8] font-medium mb-1 md:mb-2 uppercase tracking-wider">Investment Amount</p>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full bg-transparent px-0 py-0 pb-2 md:pb-0 md:py-1 text-[18px] font-medium text-gray-900 dark:text-[#F1F5F9] outline-none placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="₹0"
                            value={formData.amount ? \`₹\${formData.amount}\` : ""}
                            onChange={handleAmountChange}
                          />
                        </div>
                     </div>
                     <div className="hidden md:block w-full border-b border-gray-200 dark:border-[#44546A] pt-2 px-4 pb-2.5 md:p-4 relative z-10">
                        <p className="text-[11px] text-gray-500 dark:text-[#A3ACB8] font-medium mb-1 md:mb-2 uppercase tracking-wider">Duration (M)</p>
                        <div className="relative">
                          <input
                            type="number"
                            className="w-full bg-transparent px-0 py-0 pb-2 md:pb-0 md:py-1 text-[18px] font-medium text-gray-900 dark:text-[#F1F5F9] outline-none placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="12"
                            value={formData.timePeriodMonths}
                            onChange={(e) => setFormData({ ...formData, timePeriodMonths: e.target.value })}
                          />
                        </div>
                     </div>
                     <div className="md:hidden w-full border-b border-gray-200 dark:border-[#44546A] pt-2 px-4 pb-2.5 mt-5 relative z-10">`;

const updatedCode = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/pages/Investments.tsx', updatedCode);
