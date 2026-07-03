import fs from 'fs';

const code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

const targetStr = `                     <div className="md:hidden w-full border-b border-gray-200 dark:border-[#44546A] pt-2 px-4 pb-2.5 mt-5 relative z-10">
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
                     </div>`;

const replacementStr = `                     <div className="md:hidden w-full border-b border-gray-200 dark:border-[#44546A] pt-4 px-4 pb-4 relative z-10">
                        <div className="flex justify-between items-center relative z-10">
                          <div className="flex items-center space-x-2">
                             <p className="text-[11px] text-gray-500 dark:text-[#A3ACB8] font-medium uppercase tracking-wider">Brokerage ROI</p>
                             <div className="w-3 h-3 rounded-full border border-gray-300 dark:border-[#7F8895] flex items-center justify-center text-[8px] text-gray-500 dark:text-[#7F8895]">i</div>
                          </div>
                          <div className="relative inline-flex items-center cursor-pointer" onClick={() => setShowBrokerageROI(!showBrokerageROI)}>
                            <div className={\`w-9 h-5 rounded-full transition-colors \${showBrokerageROI ? "bg-[#4184F3]" : "bg-gray-300 dark:bg-[#4B5565]"}\`}>
                              <div className={\`absolute top-[2px] left-[2px] w-4 h-4 rounded-full bg-white transition-transform \${showBrokerageROI ? "translate-x-4" : ""} shadow-sm\`}></div>
                            </div>
                          </div>
                        </div>
                        {showBrokerageROI && (
                          <div className="space-y-4 pt-4 pb-1 mt-4 border-t border-gray-200 dark:border-[#44546A]">
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
                     </div>`;

const updatedCode = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/pages/Investments.tsx', updatedCode);
