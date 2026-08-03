const fs = require('fs');

let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

// Find the function
const startStr = "const renderPremiumBusinessDetails = (business: Business) => {";
const endStr = "  const renderBusinessDetails = (business: Business) => {";

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
    console.error("Function not found");
    process.exit(1);
}

const originalFunc = code.substring(startIndex, endIndex);

const newFunc = `const renderPremiumBusinessDetails = (business: Business) => {
    const bizInvestments = state.investments.filter(i => i.businessId === business.id);
    const activeInvs = bizInvestments.filter(i => i.status === "active");
    const completedInvs = bizInvestments.filter(i => i.status === "completed");
  
    const totalInvestors = new Set(bizInvestments.map(i => i.investorId)).size;
    const activeInvestors = new Set(activeInvs.map(i => i.investorId)).size;
  
    const totalInvestedAmount = bizInvestments.reduce((sum, i) => sum + i.amount, 0);
    const currentInvestedAmount = activeInvs.reduce((sum, i) => sum + i.amount, 0);
  
    let totalProfitPaid = 0;
    completedInvs.forEach(inv => {
        const p = inv.payoutDetails;
        if (p) {
            totalProfitPaid += (p.totalCredited + (p.rmasCommission || 0) + (p.happyIncomeTax || 0)) - inv.amount;
        }
    });
  
    let expectedProfit = 0;
    activeInvs.forEach(inv => {
        expectedProfit += inv.amount * (inv.interestRate / 100);
    });
  
    const ownerAsInvestor = state.investors.find(i => i.name.toLowerCase() === business.ownerName.toLowerCase());
  
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 dark:bg-black/70 p-4 animate-in fade-in duration-200">
        
        {/* MOBILE VERSION (Untouched Logic & Style) */}
        <div className="md:hidden bg-[#111111] border border-[#2a2a2a] rounded-xl w-full max-h-[90vh] overflow-y-auto text-white shadow-2xl relative font-sans hide-scrollbar">
          <button
              onClick={() => setPremiumBusiness(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 border border-[#333] rounded-full transition-all z-20 group"
          >
              <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
          </button>
          
          <div className="relative h-64 w-full">
            {business.photoUrl ? (
                <img src={business.photoUrl} alt="Cover" className="w-full h-full object-cover opacity-50 mix-blend-overlay" />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#111111]"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/80 to-transparent"></div>
            <div className="absolute bottom-6 left-8 flex items-end gap-6">
                <div className="flex gap-4 items-end">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border border-[#333] bg-[#1a1a1a] shadow-2xl shrink-0">
                        {business.photoUrl ? (
                            <img src={business.photoUrl} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl font-light text-gray-500 bg-[#1a1a1a]">
                                {(business.shortName || business.name)?.substring(0,2).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>
                <div className="pb-1">
                    <h2 className="text-3xl font-semibold tracking-tight text-white mb-2">{business.name}</h2>
                    <div className="flex items-center gap-3 text-sm text-gray-400 font-medium">
                        <span className="flex items-center gap-1.5">
                           {ownerAsInvestor && ownerAsInvestor.photoUrl && <img src={ownerAsInvestor.photoUrl} className="w-5 h-5 rounded-full" />}
                           {business.ownerName}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                        <span className="tracking-wider uppercase">{business.businessId}</span>
                        {statsMap.get(business.id)?.isBlueTick && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                <span className="flex items-center gap-1 text-blue-400"><BadgeCheck className="w-4 h-4" /> Verified</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
          </div>
          
          <div className="p-4 space-y-8">
            <div className="grid grid-cols-2 gap-4">
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

            {business.companyInfo ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-2 gap-6 bg-[#1a1a1a] p-6 rounded-lg border border-[#2a2a2a]">
                        <div>
                            <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-1.5">Company Name</p>
                            <p className="text-[15px] font-medium text-gray-200">{business.companyInfo.companyName}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-1.5">Established</p>
                            <p className="text-[15px] font-medium text-gray-200">{business.companyInfo.since}</p>
                        </div>
                        <div className="col-span-2 pt-4 border-t border-[#2a2a2a]">
                            <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-1.5">Owner</p>
                            <p className="text-[15px] font-medium text-gray-200">{business.companyInfo.ownerName || business.ownerName}</p>
                        </div>
                        <div className="col-span-2 pt-4 border-t border-[#2a2a2a]">
                            <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-2.5">About Company</p>
                            <p className="text-[14px] text-gray-300 leading-relaxed font-light">{business.companyInfo.companyInformation}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <p className="text-[11px] text-kite-blue uppercase tracking-widest font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Revenue & Profit Strategy</p>
                            <div className="bg-[#1a1a1a] p-5 rounded-lg border border-[#2a2a2a] text-[14px] text-gray-300 leading-relaxed font-light">
                                {business.companyInfo.profitRevenueInvest}
                            </div>
                        </div>
                        
                        <div>
                            <p className="text-[11px] text-[#4CAF50] uppercase tracking-widest font-semibold mb-3 flex items-center gap-2"><Lightbulb className="w-4 h-4"/> Investment Idea</p>
                            <div className="bg-[#1a1a1a] p-5 rounded-lg border border-[#2a2a2a] text-[14px] text-gray-300 leading-relaxed font-light">
                                {business.companyInfo.investmentIdea}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 pt-4">
                            <div>
                                <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-2.5">Shareholders</p>
                                <p className="text-[14px] text-gray-300 leading-relaxed font-light bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a]">{business.companyInfo.companyShareHolder}</p>
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-2.5">Address</p>
                                <p className="text-[14px] text-gray-300 leading-relaxed font-light bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a]">{business.companyInfo.companyAddress}</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6 pt-4 border-t border-[#2a2a2a]">
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
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-16 text-center text-gray-500 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-4">
                        <Info className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-[15px] font-medium text-gray-400">No Premium Company Profile</p>
                    <p className="text-[13px] mt-2 text-gray-600 max-w-sm">This business has not provided detailed company information for premium analysis.</p>
                </div>
            )}
          </div>
        </div>

        {/* DESKTOP VERSION (Light/Dark Mode, Horizontal Lines, Minimal) */}
        <div className="hidden md:block bg-white dark:bg-kite-surface border border-kite-border rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto text-kite-text shadow-xl relative font-sans hide-scrollbar">
          <button
              onClick={() => setPremiumBusiness(null)}
              className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-black/50 hover:bg-gray-200 dark:hover:bg-black/80 rounded-full transition-all z-20 group"
          >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
          </button>
          
          {/* Header Section */}
          <div className="relative h-48 w-full border-b border-kite-border bg-gray-50 dark:bg-kite-bg">
              <div className="absolute inset-0 p-8 flex items-end gap-6">
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-kite-border bg-white dark:bg-kite-surface shadow-md shrink-0">
                      {business.photoUrl ? (
                          <img src={business.photoUrl} className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl font-light text-kite-text-light bg-gray-50 dark:bg-kite-bg">
                              {(business.shortName || business.name)?.substring(0,2).toUpperCase()}
                          </div>
                      )}
                  </div>
                  <div className="pb-1 flex-1">
                      <h2 className="text-2xl font-semibold tracking-tight text-kite-text mb-2">{business.name}</h2>
                      <div className="flex items-center gap-3 text-sm text-kite-text-light font-medium">
                          <span className="flex items-center gap-1.5">
                             <Users className="w-4 h-4"/> 
                             {business.ownerName}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600"></span>
                          <span className="tracking-wider uppercase">{business.businessId}</span>
                          {statsMap.get(business.id)?.isBlueTick && (
                              <>
                                  <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600"></span>
                                  <span className="flex items-center gap-1 text-kite-blue"><BadgeCheck className="w-4 h-4" /> Verified</span>
                              </>
                          )}
                      </div>
                  </div>
              </div>
          </div>
          
          <div className="p-8">
              {/* Stats - Horizontal Minimal */}
              <div className="grid grid-cols-6 gap-0 divide-x divide-kite-border border-y border-kite-border py-6 mb-8">
                  <div className="px-4 first:pl-0">
                      <p className="text-[11px] text-kite-text-light uppercase tracking-widest font-semibold mb-1">Total Investors</p>
                      <p className="text-base font-medium text-kite-text">{totalInvestors}</p>
                  </div>
                  <div className="px-4">
                      <p className="text-[11px] text-kite-text-light uppercase tracking-widest font-semibold mb-1">Active Investors</p>
                      <p className="text-base font-medium text-kite-blue">{activeInvestors}</p>
                  </div>
                  <div className="px-4">
                      <p className="text-[11px] text-kite-text-light uppercase tracking-widest font-semibold mb-1">Total Invested</p>
                      <p className="text-base font-medium text-kite-text">{formatCompactINRDesktop(totalInvestedAmount)}</p>
                  </div>
                  <div className="px-4">
                      <p className="text-[11px] text-kite-text-light uppercase tracking-widest font-semibold mb-1">Currently Invested</p>
                      <p className="text-base font-medium text-kite-blue">{formatCompactINRDesktop(currentInvestedAmount)}</p>
                  </div>
                  <div className="px-4">
                      <p className="text-[11px] text-kite-text-light uppercase tracking-widest font-semibold mb-1">Profit Paid Out</p>
                      <p className="text-base font-medium text-[#4CAF50]">{formatCompactINRDesktop(totalProfitPaid)}</p>
                  </div>
                  <div className="px-4 last:pr-0">
                      <p className="text-[11px] text-kite-text-light uppercase tracking-widest font-semibold mb-1">Expected Profit</p>
                      <p className="text-base font-medium text-amber-600 dark:text-amber-500">{formatCompactINRDesktop(expectedProfit)}</p>
                  </div>
              </div>
        
              {business.companyInfo ? (
                  <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                      {/* Company Meta */}
                      <div className="flex gap-8 border-b border-kite-border pb-6">
                          <div className="flex-1">
                              <p className="text-[11px] text-kite-text-light uppercase tracking-widest font-semibold mb-1.5">Company Name</p>
                              <p className="text-[15px] font-medium text-kite-text">{business.companyInfo.companyName}</p>
                          </div>
                          <div className="flex-1">
                              <p className="text-[11px] text-kite-text-light uppercase tracking-widest font-semibold mb-1.5">Established</p>
                              <p className="text-[15px] font-medium text-kite-text">{business.companyInfo.since}</p>
                          </div>
                          <div className="flex-1">
                              <p className="text-[11px] text-kite-text-light uppercase tracking-widest font-semibold mb-1.5">Owner</p>
                              <p className="text-[15px] font-medium text-kite-text">{business.companyInfo.ownerName || business.ownerName}</p>
                          </div>
                      </div>
                      
                      {/* About */}
                      <div className="border-b border-kite-border pb-6">
                          <p className="text-[11px] text-kite-text-light uppercase tracking-widest font-semibold mb-2.5">About Company</p>
                          <p className="text-[14px] text-kite-text/80 leading-relaxed font-light">{business.companyInfo.companyInformation}</p>
                      </div>
        
                      {/* Revenue & Profit */}
                      <div className="border-b border-kite-border pb-6">
                          <p className="text-[11px] text-kite-blue uppercase tracking-widest font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Revenue & Profit Strategy</p>
                          <p className="text-[14px] text-kite-text/80 leading-relaxed font-light">{business.companyInfo.profitRevenueInvest}</p>
                      </div>
        
                      {/* Investment Idea */}
                      <div className="border-b border-kite-border pb-6">
                          <p className="text-[11px] text-[#4CAF50] uppercase tracking-widest font-semibold mb-3 flex items-center gap-2"><Lightbulb className="w-4 h-4"/> Investment Idea</p>
                          <p className="text-[14px] text-kite-text/80 leading-relaxed font-light">{business.companyInfo.investmentIdea}</p>
                      </div>
        
                      {/* Grid 2 Columns: Shareholders & Address */}
                      <div className="grid grid-cols-2 gap-8 border-b border-kite-border pb-6">
                          <div>
                              <p className="text-[11px] text-kite-text-light uppercase tracking-widest font-semibold mb-2.5">Shareholders</p>
                              <p className="text-[14px] text-kite-text/80 leading-relaxed font-light">{business.companyInfo.companyShareHolder}</p>
                          </div>
                          <div>
                              <p className="text-[11px] text-kite-text-light uppercase tracking-widest font-semibold mb-2.5">Address</p>
                              <p className="text-[14px] text-kite-text/80 leading-relaxed font-light">{business.companyInfo.companyAddress}</p>
                          </div>
                      </div>
        
                      {/* Documents & Govt Reg */}
                      <div className="grid grid-cols-2 gap-8 pt-2">
                          <div>
                              <p className="text-[11px] text-kite-text-light uppercase tracking-widest font-semibold mb-3">Documents</p>
                              <div className="flex flex-col gap-2.5">
                                  {business.companyInfo.documents && business.companyInfo.documents.length > 0 ? (
                                      business.companyInfo.documents.map((doc, idx) => (
                                          <div key={idx} className="flex items-center gap-2">
                                              <BadgeCheck className="w-4 h-4 text-kite-blue shrink-0" />
                                              <span className="text-[14px] text-kite-text/90 font-medium">{doc}</span>
                                          </div>
                                      ))
                                  ) : (
                                      <span className="text-kite-text-light text-sm">No documents provided</span>
                                  )}
                              </div>
                          </div>
                          <div>
                              <p className="text-[11px] text-kite-text-light uppercase tracking-widest font-semibold mb-3">Government Reg Identifies</p>
                              <div className="flex flex-col gap-2.5">
                                  {business.companyInfo.governmentRegIdentifies && business.companyInfo.governmentRegIdentifies.length > 0 ? (
                                      business.companyInfo.governmentRegIdentifies.map((reg, idx) => (
                                          <div key={idx} className="flex items-center gap-2">
                                              <BadgeCheck className="w-4 h-4 text-[#4CAF50] shrink-0" />
                                              <span className="text-[14px] text-kite-text/90 font-medium">{reg}</span>
                                          </div>
                                      ))
                                  ) : (
                                      <span className="text-kite-text-light text-sm">No reg identifies provided</span>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className="py-16 text-center text-kite-text-light flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-kite-bg border border-kite-border flex items-center justify-center mb-4">
                          <Info className="w-8 h-8 text-kite-text-light/50" />
                      </div>
                      <p className="text-[15px] font-medium text-kite-text-light">No Premium Company Profile</p>
                      <p className="text-[13px] mt-2 text-kite-text-light/70 max-w-sm">This business has not provided detailed company information for premium analysis.</p>
                  </div>
              )}
          </div>
        </div>

      </div>
    );
  };
`;

code = code.replace(originalFunc, newFunc);
fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
