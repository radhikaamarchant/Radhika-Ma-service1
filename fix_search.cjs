const fs = require('fs');
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

const targetStr = `      <div className="md:sticky md:top-0 z-30 bg-white dark:bg-kite-bg dark:md:bg-[#181818] shadow-sm w-full">
<div
        className={\`flex items-center justify-between w-full py-3 px-4 w-full \${showAddForm ?"hidden md:flex" :"flex"}\`}
      >
        {""}
        {!isSearchExpanded && (
          <button
            onClick={() => {
              if (!showAddForm) {
                setFormData({ businessId: "", investorId: "", amount: "", timePeriodMonths: "12", adminCommissionInvestorPct: "2", adminCommissionBusinessPct: "2" });
                setAddModalBusinessId("");
                setAddModalInvestorId("");
                setIsFromAnalysis(false);
              }
              setShowAddForm(!showAddForm);
            }}
            className="flex md:hidden items-center space-x-1.5 px-4 py-2 bg-kite-blue text-white rounded font-medium text-[13px] md:text-[14px] hover:bg-blue-600 transition-colors shadow-sm"
          >
            {""}
            <Plus className="w-4 h-4" /> <span>Add</span>{""}
          </button>
        )}
        
        {/* Mobile Search */}
        <div className={\`md:hidden flex items-center justify-end h-[36px] \${isSearchExpanded ? 'w-full' : 'w-auto'}\`}>
          {!isSearchExpanded ? (
            <button
              onClick={() => setIsSearchExpanded(true)}
              className="p-1 hover:bg-gray-100 dark:md:hover:bg-[#131415] rounded-full transition-colors flex-shrink-0 flex items-center gap-2"
            >
              <Search className="w-[18px] h-[18px] text-kite-blue" />
            </button>
          ) : (
            <div className="flex items-center w-full transition-all duration-300 bg-kite-surface rounded-sm h-[36px]">
              <button
                onClick={() => {
                  setIsSearchExpanded(false);
                  setSearchTerm("");
                }}
                className="p-2 -ml-2 hover:bg-gray-100 dark:md:hover:bg-[#131415] rounded-full mr-1 transition-colors flex-shrink-0 flex items-center justify-center"
              >
                <ArrowLeft className="w-[18px] h-[18px] text-kite-blue" />
              </button>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search Eg: RMAS,SARITA.."
                className="bg-transparent border-none outline-none w-full text-[13px] text-kite-text placeholder-gray-400 dark:placeholder-[#7A7A7A] font-sans h-[36px]"
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
        
        {/* Desktop Search */}
        <div className="hidden md:flex items-center w-full max-w-[250px] bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#2A2A2A] rounded h-[36px] overflow-hidden focus-within:border-kite-blue transition-colors relative ml-auto">
            <div className="pl-3 pr-2 flex items-center justify-center absolute left-0 text-gray-400 dark:text-[#A3ACB8]">
                <Search className="w-[16px] h-[16px]" />
            </div>
            <input
                type="text"
                placeholder="Search Eg: RMAS,SARITA.."
                className="bg-transparent border-none outline-none w-full pl-9 pr-8 text-[14px] text-kite-text placeholder-gray-400 dark:placeholder-[#7A7A7A] font-sans h-[36px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="p-2 text-gray-600 hover:text-kite-text transition-colors flex-shrink-0 absolute right-0"
                >
                  <X className="w-4 h-4" />
                </button>
            )}
        </div>
      </div>`;

const newStr = `      <div className="md:sticky md:top-0 z-30 bg-white dark:bg-kite-bg dark:md:bg-[#181818] shadow-sm w-full">
<div className="px-4 py-3 border-b border-gray-100 dark:border-[#1c2a37] bg-white dark:bg-[#1c2a37] dark:md:bg-[#181818]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 md:dark:text-[#7A7A7A] dark:text-[#8F8F8F]" />
            <input 
              type="text"
              placeholder="Search Eg: RMAS,SARITA.."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 md:dark:bg-transparent dark:bg-transparent border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3] transition-colors font-sans"
            />
          </div>
      </div>`;

code = code.replace(targetStr, newStr);
fs.writeFileSync('src/pages/Investments.tsx', code);
