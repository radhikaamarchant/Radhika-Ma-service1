const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

// Add premiumBusiness and isDesktop state
const statePattern = /const \[addModalBusinessId, setAddModalBusinessId\] = useState\(""\);/;
code = code.replace(statePattern, `const [addModalBusinessId, setAddModalBusinessId] = useState("");
  const [premiumBusiness, setPremiumBusiness] = useState<Business | null>(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);`);

// Replace the lists variables definitions
const listsPattern = /const topBusinesses = \[\.\.\.businessesWithStats\][\s\S]*?const overviewBusinesses = \[\.\.\.businessesWithStats\][\s\S]*?\}\);/m;

const replacementLists = `const topBusinesses = [...businessesWithStats]
    .sort((a, b) => b.totalInv - a.totalInv)
    .slice(0, 10);

  const topInvested = isDesktop
    ? [...businessesWithStats]
        .filter((b) => b.totalInv > 0)
        .sort((a, b) => b.totalInv - a.totalInv)
        .slice(0, 10)
    : [...businessesWithStats]
        .filter((b) => b.totalInv > 0)
        .sort((a, b) => b.liveTotalValue - a.liveTotalValue)
        .slice(0, 10);

  const topBacked = isDesktop
    ? [...businessesWithStats]
        .filter((b) => b.totalInv > 0 && b.totalRet > b.totalInv * 0.05)
        .sort((a, b) => (b.totalRet / b.totalInv) - (a.totalRet / a.totalInv))
        .slice(0, 10)
    : [...businessesWithStats]
        .filter((b) => b.investorCount > 0)
        .sort((a, b) => b.investorCount - a.investorCount)
        .slice(0, 10);

  const topEarners = [...businessesWithStats]
    .filter((b) => b.totalRet > 0)
    .sort((a, b) => b.totalRet - a.totalRet)
    .slice(0, 10);

  const untappedBusinesses = businessesWithStats.filter(
    (b) => b.totalInv === 0,
  );

  const newlyListed = [...businessesWithStats]
    .filter((b) => b.totalInv < b.fundingRequired * 0.5)
    .reverse()
    .slice(0, 8);

  const bestMarket = isDesktop
    ? businessesWithStats
        .filter((b) => b.totalInv > 0 && b.totalRet > 0 && (b.downMarket || 0) > 0 && (b.increaseMarket || 0) > 0)
        .sort((a, b) => b.totalRet - a.totalRet)
    : businessesWithStats
        .filter((b) => b.overallTrend >= b.interestRate + 10)
        .sort((a, b) => b.overallTrend - a.overallTrend);

  const sortedByInvForMed = [...businessesWithStats].filter(b => b.totalInv > 0 && b.totalRet > 0).sort((a,b) => b.totalInv - a.totalInv);
  const medStartIndex = Math.max(0, Math.floor(sortedByInvForMed.length / 2) - 3);
  const mediumBusinesses = isDesktop
    ? sortedByInvForMed.slice(medStartIndex, medStartIndex + 6)
    : [];

  const overviewBusinesses = [...businessesWithStats]
    .filter(
      (b) =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.businessId.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy ==="investment") {
        return b.liveTotalValue - a.liveTotalValue;
      }
      return a.interestRate - b.interestRate;
    });`;

code = code.replace(listsPattern, replacementLists);

// Insert renderPremiumBusinessDetails function
const renderBusinessPattern = /const renderBusinessDetails = \(business: Business\) => \{/;

const premiumRender = `const renderPremiumBusinessDetails = (business: Business) => {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto text-white shadow-2xl relative font-sans hide-scrollbar">
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
                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-[#333] bg-[#1a1a1a] shadow-2xl shrink-0">
                    {business.photoUrl ? (
                        <img src={business.photoUrl} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-light text-gray-500 bg-[#1a1a1a]">
                            {(business.shortName || business.name)?.substring(0,2).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="pb-1">
                    <h2 className="text-3xl font-semibold tracking-tight text-white mb-2">{business.name}</h2>
                    <div className="flex items-center gap-3 text-sm text-gray-400 font-medium">
                        <span className="flex items-center gap-1.5"><Users className="w-4 h-4"/> {business.ownerName}</span>
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
          
          <div className="p-8 space-y-8">
            {business.companyInfo ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-[#1a1a1a] p-6 rounded-lg border border-[#2a2a2a]">
                        <div>
                            <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-1.5">Company Name</p>
                            <p className="text-[15px] font-medium text-gray-200">{business.companyInfo.companyName}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-1.5">Established</p>
                            <p className="text-[15px] font-medium text-gray-200">{business.companyInfo.since}</p>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-1.5">Owner</p>
                            <p className="text-[15px] font-medium text-gray-200">{business.companyInfo.ownerName || business.ownerName}</p>
                        </div>
                        <div className="col-span-2 md:col-span-3 pt-4 border-t border-[#2a2a2a]">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div>
                                <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-2.5">Shareholders</p>
                                <p className="text-[14px] text-gray-300 leading-relaxed font-light bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a]">{business.companyInfo.companyShareHolder}</p>
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-2.5">Address</p>
                                <p className="text-[14px] text-gray-300 leading-relaxed font-light bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a]">{business.companyInfo.companyAddress}</p>
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
      </div>
    );
  };

  const renderBusinessDetails = (business: Business) => {`;

code = code.replace(renderBusinessPattern, premiumRender);


// Update tabs mapping
const tabsPattern = /\{\s*id:\s*"best-market"[^\}]*\}\s*,\s*\{\s*id:\s*"top-backed"[^\}]*\}\s*,\s*\{\s*id:\s*"top-invested"[^\}]*\}\s*,\s*\{\s*id:\s*"top-earners"[^\}]*\}\s*,/m;
const newTabs = `{ id:"best-market", label:"Best Market", type:"scroll" },
              { id:"top-backed", label:"Top Backed", type:"category" },
              { id:"top-invested", label:"Top Invested", type:"category" },
              { id:"top-earners", label:"Top Earners", type:"category" },
              ...(isDesktop ? [{ id: "medium", label: "Medium", type: "category" }] : []),`;
code = code.replace(tabsPattern, newTabs);


// Update rendering switch
const renderSwitch1 = /activeTab === "best-market" \? bestMarket :\s*activeTab === "top-backed" \? topBacked :\s*activeTab === "top-invested" \? topInvested :\s*activeTab === "top-earners" \? topEarners :/g;
const newRenderSwitch1 = `activeTab === "best-market" ? bestMarket :
                activeTab === "top-backed" ? topBacked :
                activeTab === "top-invested" ? topInvested :
                activeTab === "top-earners" ? topEarners :
                activeTab === "medium" ? mediumBusinesses :`;
code = code.replace(renderSwitch1, newRenderSwitch1);


// Update onClick
const onClickPattern = /<div key=\{b\.id\} onClick=\{.*?\} className="p-3 md:p-4 hover:bg-kite-bg/s;
// Let's use a replacer function to be safe
code = code.replace(/<div key=\{b\.id\} onClick=\{\(\) => setSelectedBusiness\(b\)\} className="p-3/g, 
  `<div key={b.id} onClick={() => isDesktop ? setPremiumBusiness(b) : setSelectedBusiness(b)} className="p-3`);

// Also add premiumBusiness rendering at the bottom
code = code.replace(/\{selectedBusiness && renderBusinessDetails\(selectedBusiness\)\}/, 
  `{selectedBusiness && renderBusinessDetails(selectedBusiness)}\n      {premiumBusiness && renderPremiumBusinessDetails(premiumBusiness)}`);

fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
