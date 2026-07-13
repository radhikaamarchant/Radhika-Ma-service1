const fs = require('fs');

let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

// 1. Change state definition
content = content.replace(
  'const [selectedImage, setSelectedImage] = useState<string | null>(null);',
  'const [selectedPreviewInvestor, setSelectedPreviewInvestor] = useState<Investor | null>(null);'
);

// 2. Change image click handlers
content = content.replace(
  'setSelectedImage(investor.photoUrl || null);',
  'setSelectedPreviewInvestor(investor);'
);
content = content.replace(
  'setSelectedImage(investor.photoUrl || null);',
  'setSelectedPreviewInvestor(investor);'
);

// 3. Replace the modal jsx block
const originalModal = `{selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedImage(null);
          }}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full md:bg-transparent md:rounded-none"
            >
              <X className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            <img
              src={selectedImage}
              alt="Profile Full"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border-2 border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}`;

const newModal = `{selectedPreviewInvestor && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8 animate-fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPreviewInvestor(null);
          }}
        >
          <div className="relative w-full max-w-4xl bg-white dark:bg-kite-bg rounded-lg shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] min-h-[400px] animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPreviewInvestor(null);
              }}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full z-[101]"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            
            {/* Left side - Image */}
            <div className="w-full md:w-1/2 bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center h-[300px] md:h-auto md:min-h-0 relative shrink-0 border-b md:border-b-0 md:border-r border-kite-border">
              {selectedPreviewInvestor.photoUrl ? (
                <img
                  src={selectedPreviewInvestor.photoUrl}
                  alt={selectedPreviewInvestor.name}
                  className="w-full h-full object-cover absolute inset-0"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-kite-blue/10 dark:bg-kite-blue/20 text-kite-blue flex items-center justify-center overflow-hidden border border-kite-border-soft">
                  <span className="text-4xl font-normal">{(selectedPreviewInvestor.shortName || selectedPreviewInvestor.name)?.substring(0, 2).toUpperCase()}</span>
                </div>
              )}
            </div>

            {/* Right side - Information */}
            <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto bg-white dark:bg-kite-bg">
              <h2 className="text-[18px] md:text-[22px] font-medium text-kite-text mb-1">{selectedPreviewInvestor.name?.toUpperCase()}</h2>
              <p className="text-[12px] md:text-[13px] text-kite-text-light mb-6 tracking-wide" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                #{selectedPreviewInvestor.investorId}
              </p>

              {selectedPreviewInvestor.bio && (
                <div className="mb-6">
                  <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-2">Bio</h3>
                  <p className="text-[13px] md:text-[14px] text-kite-text whitespace-pre-wrap leading-relaxed">{selectedPreviewInvestor.bio}</p>
                </div>
              )}

              {selectedPreviewInvestor.address && (selectedPreviewInvestor.address.flatHouse || selectedPreviewInvestor.address.residentHouseName || selectedPreviewInvestor.address.landmark || selectedPreviewInvestor.address.city || selectedPreviewInvestor.address.state) && (
                <div className="mb-6">
                  <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-2">Full Address</h3>
                  <div className="text-[13px] md:text-[14px] text-kite-text space-y-1">
                    {selectedPreviewInvestor.address.flatHouse && <p>{selectedPreviewInvestor.address.flatHouse}</p>}
                    {selectedPreviewInvestor.address.residentHouseName && <p>{selectedPreviewInvestor.address.residentHouseName}</p>}
                    {selectedPreviewInvestor.address.landmark && <p>{selectedPreviewInvestor.address.landmark}</p>}
                    {(selectedPreviewInvestor.address.city || selectedPreviewInvestor.address.state) && (
                      <p>
                        {selectedPreviewInvestor.address.city}{selectedPreviewInvestor.address.city && selectedPreviewInvestor.address.state ? ', ' : ''}{selectedPreviewInvestor.address.state}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-kite-border">
                <div className="bg-kite-bg dark:bg-kite-surface p-4 rounded-sm border border-kite-border">
                  <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Available Balance</h3>
                  <p className={"text-[15px] md:text-[17px] font-medium " + ((() => {
                    const balance = getUnifiedBankBalance(
                      selectedPreviewInvestor.name,
                      state.businesses,
                      state.investors,
                      state.investments,
                      state.settings,
                    );
                    return balance >= 0 ? "text-kite-blue" : "text-kite-red";
                  })())}>
                    {(() => {
                      const balance = getUnifiedBankBalance(
                        selectedPreviewInvestor.name,
                        state.businesses,
                        state.investors,
                        state.investments,
                        state.settings,
                      );
                      return (balance >= 0 ? "" : "-") + formatINR(Math.abs(balance));
                    })()}
                  </p>
                </div>
                <div className="bg-kite-bg dark:bg-kite-surface p-4 rounded-sm border border-kite-border">
                  <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Total Invested</h3>
                  <p className="text-[15px] md:text-[17px] font-medium text-kite-text">
                    {(() => {
                      const activeInvs = state.investments.filter(
                        (inv) => inv.investorId === selectedPreviewInvestor.id && inv.status !== "completed"
                      );
                      let totalAmountInvested = activeInvs.reduce((sum, inv) => sum + inv.amount, 0);
                      if (selectedPreviewInvestor.id === "admin_investor") {
                        totalAmountInvested = getUnifiedBankBalance(
                          "Radhika M",
                          state.businesses,
                          state.investors,
                          state.investments,
                          state.settings,
                        );
                      }
                      return formatINR(totalAmountInvested);
                    })()}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}`;

content = content.replace(originalModal, newModal);

fs.writeFileSync('src/pages/Investors.tsx', content);
