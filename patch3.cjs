const fs = require('fs');
let code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

const target = `<div className="p-2 border-b border-gray-100 dark:border-[#2A2A2A] shrink-0">
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400 dark:text-[#8F8F8F]" />
                              <input
                                type="text"
                                autoFocus
                                placeholder="Search..."
                                className="w-full pl-8 pr-3 py-1 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3]"
                                value={investorSearch}
                                onChange={(e) =>
                                  setInvestorSearch(e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <div className="flex-1 overflow-y-auto">
                            {sortedInvestors
                              .filter((i) => {
                                if (
                                  !i.name
                                    .toLowerCase()
                                    .includes(investorSearch.toLowerCase())
                                )
                                  return false;
                                if (
                                  !isMobile &&
                                  orderMode === "SELL" &&
                                  selectedBusiness
                                ) {
                                  const hasActive = state.investments.some(
                                    (inv: any) =>
                                      inv.investorId === i.id &&
                                      inv.businessId === selectedBusiness.id &&
                                      inv.status === "active",
                                  );
                                  if (!hasActive) return false;
                                }
                                return true;
                              })
                              .map((i) => {
                                const activeCount = selectedBusiness
                                  ? state.investments.filter(
                                      (inv: any) =>
                                        inv.investorId === i.id &&
                                        inv.businessId ===
                                          selectedBusiness.id &&
                                        inv.status === "active",
                                    ).length
                                  : 0;
                                return (
                                  <button
                                    key={i.id}
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        investorId: i.id,
                                      });
                                      setDesktopShowInvestorSelect(false);
                                    }}
                                    className="w-full text-left px-3 py-2 text-[13px] text-gray-700 dark:text-[#C4C4C4] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>{i.name.toUpperCase()}</span>
                                      {activeCount > 0 && (
                                        <div className="bg-[#4184F3] text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[16px] h-[16px]">
                                          {activeCount}
                                        </div>
                                      )}
                                    </div>
                                    {formData.investorId === i.id && (
                                      <CheckCircle className="w-3.5 h-3.5 text-[#4184F3]" />
                                    )}
                                  </button>
                                );
                              })}
                            {sortedInvestors.filter((i) =>
                              i.name
                                .toLowerCase()
                                .includes(investorSearch.toLowerCase()),
                            ).length === 0 && (
                              <div className="px-3 py-4 text-center text-[12px] text-gray-500 dark:text-[#8F8F8F]">
                                No investors found
                              </div>
                            )}
                          </div>`;

const replacement = `<div className="p-2 border-b border-gray-100 dark:border-[#2A2A2A] shrink-0 flex flex-col gap-2">
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400 dark:text-[#8F8F8F]" />
                              <input
                                type="text"
                                autoFocus
                                placeholder="Search by name or ID..."
                                className="w-full pl-8 pr-3 py-1 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3]"
                                value={investorSearch}
                                onChange={(e) =>
                                  setInvestorSearch(e.target.value)
                                }
                              />
                            </div>
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const filteredIds = sortedInvestors.filter((i) => {
                                    if (
                                      !i.name.toLowerCase().includes(investorSearch.toLowerCase()) &&
                                      !i.investorId?.toLowerCase().includes(investorSearch.toLowerCase())
                                    )
                                      return false;
                                    if (!isMobile && orderMode === "SELL" && selectedBusiness) {
                                      const hasActive = state.investments.some(
                                        (inv: any) =>
                                          inv.investorId === i.id &&
                                          inv.businessId === selectedBusiness.id &&
                                          inv.status === "active",
                                      );
                                      if (!hasActive) return false;
                                    }
                                    return true;
                                  }).map(i => i.id);

                                  if (filteredIds.every(id => formData.investorIds.includes(id)) && filteredIds.length > 0) {
                                    setFormData({ ...formData, investorIds: formData.investorIds.filter(id => !filteredIds.includes(id)) });
                                  } else {
                                    const newSet = new Set([...formData.investorIds, ...filteredIds]);
                                    setFormData({ ...formData, investorIds: Array.from(newSet) });
                                  }
                                }}
                                className="text-[12px] text-[#4184F3] hover:underline font-medium"
                              >
                                Select All
                              </button>
                            </div>
                          </div>
                          <div className="flex-1 overflow-y-auto">
                            {sortedInvestors
                              .filter((i) => {
                                if (
                                  !i.name.toLowerCase().includes(investorSearch.toLowerCase()) &&
                                  !i.investorId?.toLowerCase().includes(investorSearch.toLowerCase())
                                )
                                  return false;
                                if (
                                  !isMobile &&
                                  orderMode === "SELL" &&
                                  selectedBusiness
                                ) {
                                  const hasActive = state.investments.some(
                                    (inv: any) =>
                                      inv.investorId === i.id &&
                                      inv.businessId === selectedBusiness.id &&
                                      inv.status === "active",
                                  );
                                  if (!hasActive) return false;
                                }
                                return true;
                              })
                              .map((i) => {
                                const activeCount = selectedBusiness
                                  ? state.investments.filter(
                                      (inv: any) =>
                                        inv.investorId === i.id &&
                                        inv.businessId ===
                                          selectedBusiness.id &&
                                        inv.status === "active",
                                    ).length
                                  : 0;
                                return (
                                  <button
                                    key={i.id}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (formData.investorIds.includes(i.id)) {
                                        setFormData({ ...formData, investorIds: formData.investorIds.filter(id => id !== i.id) });
                                      } else {
                                        setFormData({ ...formData, investorIds: [...formData.investorIds, i.id] });
                                      }
                                    }}
                                    className={\`w-full text-left px-3 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors flex items-center justify-between \${formData.investorIds.includes(i.id) ? "bg-blue-50/50 dark:bg-[#4184F3]/10 text-[#4184F3]" : "text-gray-900 dark:text-[#E3E3E3]"}\`}
                                  >
                                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                                      {i.photoUrl ? (
                                        <img src={i.photoUrl} alt={i.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                                      ) : (
                                        <div className="w-5 h-5 rounded-full bg-[#E8F0FE] dark:bg-[#4184F3]/20 flex items-center justify-center text-[#4184F3] text-[10px] font-bold shrink-0">
                                          {i.name.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <span className="truncate">{i.name.toUpperCase()}</span>
                                      <span className="text-[10px] text-gray-400 dark:text-[#8F8F8F] shrink-0">({i.investorId})</span>
                                      {activeCount > 0 && (
                                        <div className="bg-[#4184F3] text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[16px] h-[16px] shrink-0">
                                          {activeCount}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center shrink-0 ml-2">
                                      {formData.investorIds.includes(i.id) && (
                                        <CheckCircle className="w-3.5 h-3.5 text-[#4184F3]" />
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            {sortedInvestors.filter((i) =>
                                i.name.toLowerCase().includes(investorSearch.toLowerCase()) ||
                                i.investorId?.toLowerCase().includes(investorSearch.toLowerCase())
                            ).length === 0 && (
                              <div className="px-3 py-4 text-center text-[12px] text-gray-500 dark:text-[#8F8F8F]">
                                No investors found
                              </div>
                            )}
                          </div>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/AddInvestmentModal.tsx', code);
  console.log('Replaced successfully');
} else {
  console.log('Target not found');
}
