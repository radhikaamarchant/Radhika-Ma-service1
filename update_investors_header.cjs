const fs = require('fs');

let code = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

const oldHeader = `<div className="px-3 md:px-4 pt-2 md:pt-4 pb-2 md:pb-4 flex flex-col md:flex-row md:justify-between md:items-center relative mb-1 md:mb-0">`;
const newHeaderDesktop = `<div className="hidden md:flex px-4 pt-4 pb-4 flex-row justify-between items-center relative mb-0">`;

code = code.replace(oldHeader, newHeaderDesktop);

const mobileHeader = `
                {/* MOBILE HEADER */}
                <div className="sticky top-0 z-30 bg-[#f2f2f2] dark:bg-[#121212] w-full md:hidden pt-3 px-4 pb-3">
                  <div className="bg-white dark:bg-[#1e1e1e] rounded-[4px] shadow-sm flex items-center px-3 py-2.5 mb-3 border border-gray-200 dark:border-[#2A2A2A]">
                    <Search className="w-5 h-5 text-gray-400 dark:text-[#A3ACB8]" />
                    <input 
                      type="text"
                      placeholder="Search & add"
                      className="flex-1 bg-transparent border-none outline-none ml-2 text-[15px] text-gray-900 dark:text-[#F1F5F9] placeholder-gray-400 dark:placeholder-[#A3ACB8]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="flex items-center text-gray-400 dark:text-[#A3ACB8] text-[14px]">
                      <span className="mr-3">{filteredInvestors.length}/250</span>
                      <SlidersHorizontal className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={startAddInvestor} className="flex items-center space-x-1.5 text-[#4184F3] font-medium text-[15px]">
                      <Plus className="w-[18px] h-[18px]" />
                      <span>New Investor</span>
                    </button>
                  </div>
                </div>
`;

code = code.replace(newHeaderDesktop, mobileHeader + '\n                ' + newHeaderDesktop);

code = code.replace('<div className="md:sticky md:top-0 z-30 bg-white dark:bg-kite-bg w-full">', '<div className="sticky top-0 z-30 bg-white dark:bg-kite-bg w-full">');

fs.writeFileSync('src/pages/Investors.tsx', code);
console.log('Successfully updated Investors header!');
