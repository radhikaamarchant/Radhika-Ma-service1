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
                     <div className="w-full border-b border-gray-200 dark:border-[#44546A] pt-2 px-4 pb-0 md:p-4 relative z-10">
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
                  </div>
                </div>

                {/* Secondary Toggles Card */}
                <div className="bg-white dark:bg-transparent overflow-hidden relative p-4 space-y-4 border-b border-gray-200 dark:border-[#44546A]">`;

const replacementStr = `                  {/* Amount */}
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
                     <div className="md:hidden w-full border-b border-gray-200 dark:border-[#44546A] pt-2 px-4 pb-2 relative z-10">
                        <button className="text-[12px] font-medium text-[#4184F3] flex items-center space-x-1" onClick={() => setShowBrokerageROI(!showBrokerageROI)}>
                          <span className="text-[16px] leading-none mb-0.5">{showBrokerageROI ? "−" : "+"}</span>
                          <span>{showBrokerageROI ? "Remove" : "Add"} Brokerage ROI</span>
                        </button>
                        {showBrokerageROI && (
                          <div className="space-y-4 pt-2 pb-2 mt-2 border-t border-gray-200 dark:border-[#44546A]">
                            <div className="flex justify-between items-center">
                              <p className="text-[13px] text-gray-700 dark:text-[#C4C4C4] font-medium">Expected ROI (%)</p>
                              <input
                                type="number"
                                className="w-16 bg-transparent px-0 py-1 text-right text-[15px] font-medium text-[#4184F3] outline-none border-b border-gray-200 dark:border-[#44546A] focus:border-[#4184F3]"
                                placeholder="10.5"
                                value={expectedRoi}
                                onChange={(e) => setExpectedRoi(e.target.value)}
                              />
                            </div>
                            <div className="flex justify-between items-center">
                               <p className="text-[13px] text-gray-700 dark:text-[#C4C4C4] font-medium">Investor Brokerage (%)</p>
                               <input
                                  type="number"
                                  className="w-16 bg-transparent px-0 py-1 text-right text-[15px] font-medium text-[#4184F3] outline-none border-b border-gray-200 dark:border-[#44546A] focus:border-[#4184F3]"
                                  placeholder="2"
                                  value={formData.adminCommissionInvestorPct}
                                  onChange={(e) => setFormData({ ...formData, adminCommissionInvestorPct: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                               <p className="text-[13px] text-gray-700 dark:text-[#C4C4C4] font-medium">Business Brokerage (%)</p>
                               <input
                                  type="number"
                                  className="w-16 bg-transparent px-0 py-1 text-right text-[15px] font-medium text-[#4184F3] outline-none border-b border-gray-200 dark:border-[#44546A] focus:border-[#4184F3]"
                                  placeholder="2"
                                  value={formData.adminCommissionBusinessPct}
                                  onChange={(e) => setFormData({ ...formData, adminCommissionBusinessPct: e.target.value })}
                                />
                            </div>
                          </div>
                        )}
                     </div>
                  </div>
                </div>

                {/* Secondary Toggles Card */}
                <div className="hidden md:block bg-white dark:bg-transparent overflow-hidden relative p-4 space-y-4 border-b border-gray-200 dark:border-[#44546A]">`;

const updatedCode = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/pages/Investments.tsx', updatedCode);
