const fs = require('fs');
let code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf8');

code = code.replace(
  `                              ).length === 0 && (
                                <div className="px-3 py-4 text-center text-[12px] text-gray-500 dark:text-[#8F8F8F]">
                                  No investors found
                                </div>
                              )}
                            </div>`,
  `                              ).length === 0 && (
                                <div className="px-3 py-4 text-center text-[12px] text-gray-500 dark:text-[#8F8F8F]">
                                  No investors found
                                </div>
                              )}
                              <div className="h-6 w-full shrink-0" style={{ height: '24px', flexShrink: 0 }}></div>
                            </div>`
);

code = code.replace(
  `                                  ).length === 0 && (
                                    <div className="px-3 py-4 text-center text-[12px] text-gray-500 dark:text-[#8F8F8F]">
                                      No investors found
                                    </div>
                                  )}
                                </div>`,
  `                                  ).length === 0 && (
                                    <div className="px-3 py-4 text-center text-[12px] text-gray-500 dark:text-[#8F8F8F]">
                                      No investors found
                                    </div>
                                  )}
                                  <div className="h-6 w-full shrink-0" style={{ height: '24px', flexShrink: 0 }}></div>
                                </div>`
);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', code);
