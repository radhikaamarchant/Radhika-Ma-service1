const fs = require('fs');

const topContent = `
        {viewMode === "list" && (
          <>
            <div className="md:sticky md:top-0 z-30 bg-white dark:bg-kite-bg shadow-sm">
              <div className="px-3 md:px-4 pt-2 md:pt-4 pb-2 md:pb-4 flex flex-col md:flex-row md:justify-between md:items-center relative mb-1 md:mb-0">
                <div className="flex flex-col md:flex-row w-full items-start md:items-center justify-between transition-all duration-300 gap-3 md:gap-0">
                  <div className="hidden md:block">
                    <h2 className="text-[13px] md:text-[14px] font-medium text-kite-text tracking-wider uppercase">
                      My Investors
                    </h2>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center w-full md:w-auto md:justify-end gap-2 md:gap-4">
                    {/* Action Button (Top on mobile, left of search on desktop) */}
                    <div className="w-full md:w-auto pt-1 md:pt-0 pb-2 md:pb-0">
                      <button
                        onClick={startAddInvestor}
                        className="flex items-center space-x-1.5 py-2 text-kite-blue font-medium text-[13px] md:text-[14px] hover:text-blue-600 transition-colors shadow-none"
                      >
                        <Plus className="w-4 h-4" />
                        <span>New Investor</span>
                      </button>
                    </div>
                    {/* Search Container (Bottom on mobile, right on desktop) */}
                    <div className="w-full md:w-auto flex items-center justify-start md:justify-end pt-1 md:pt-0 h-[36px]">
                      {!isSearchExpanded ? (
                        <button
                          onClick={() => setIsSearchExpanded(true)}
                          className="-ml-1 md:ml-0 p-1 hover:bg-gray-100 dark:hover:bg-kite-bg rounded-full transition-colors flex-shrink-0 flex items-center gap-2"
                        >
                          <Search className="w-[18px] h-[18px] text-kite-blue" />
                        </button>
                      ) : (
                        <div className="flex items-center w-full md:w-[250px] transition-all duration-300 bg-white dark:bg-kite-surface md:bg-gray-100 md:dark:bg-[#161616] rounded-sm h-[36px]">
                          <button
                            onClick={() => {
                              setIsSearchExpanded(false);
                              setSearchTerm("");
                            }}
                            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-kite-bg rounded-full mr-1 transition-colors flex-shrink-0"
                          >
                            <ArrowLeft className="w-[18px] h-[18px] text-kite-blue" />
                          </button>
                          <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search Eg: Radhika"
                            className="bg-transparent border-none outline-none w-full text-[13px] md:text-[14px] text-kite-text placeholder-gray-400 dark:placeholder-[#7A7A7A] font-sans h-[36px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm("")}
                              className="p-2 text-gray-600 hover:text-kite-text transition-colors flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* DESKTOP HEADER */}
              <div className="hidden md:flex items-center px-4 bg-[#F9F9F9] dark:bg-[#1a1a1a] border-b border-kite-border w-full">
                <div className="w-[30%] text-left py-2 text-[12px] text-kite-text-muted">INVESTOR NAME</div>
                <div className="w-[14%] text-left py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pl-4">ID</div>
                <div className="w-[18%] text-right py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pr-4">INVEST AMOUNT</div>
                <div className="w-[16%] text-right py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pr-4">PERCENTAGE</div>
                <div className="w-[22%] text-right py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pl-5">TOTAL PROFIT</div>
              </div>
            </div>

            <div className="w-full bg-transparent border-t border-kite-border md:border-t-0 md:border-transparent rounded-none overflow-hidden z-10 md:mt-0">
              <div className="overflow-hidden">
                {/* Desktop Table View */}
                <div className="flex flex-col border-b border-kite-border pb-20 md:pb-0">
`;

let content = fs.readFileSync('src/pages/Investors.tsx', 'utf8');
const searchString = '{viewMode === "list" && (';
const searchIndex = content.indexOf(searchString);

const tailSearchString = '{filteredInvestors.map((investor, idx) => {';
const tailSearchIndex = content.indexOf(tailSearchString);

if (searchIndex !== -1 && tailSearchIndex !== -1) {
   content = content.substring(0, searchIndex) + topContent + "                  " + content.substring(tailSearchIndex);
   fs.writeFileSync('src/pages/Investors.tsx', content);
   console.log("Success replacing investors top header.");
} else {
   console.log("Failed to find index");
}
