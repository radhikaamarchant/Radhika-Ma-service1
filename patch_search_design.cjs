const fs = require('fs');
let content = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

const targetStr = `               <div className="hidden md:flex items-center border-b border-kite-border-hard w-64 pb-1">
                 <Search className="w-4 h-4 text-kite-text-light mr-2" />
                 <input
                   type="text"
                   placeholder="Search investor..."
                   value={investorSearchQuery}
                   onChange={(e) => setInvestorSearchQuery(e.target.value)}
                   className="w-full bg-transparent border-none outline-none text-[13px] text-kite-text placeholder-kite-text-light font-medium"
                 />
               </div>`;

const newStr = `               <div className="relative hidden md:block">
                 <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-kite-text-light" />
                 <input
                   type="text"
                   placeholder="Search..."
                   value={investorSearchQuery}
                   onChange={(e) => setInvestorSearchQuery(e.target.value)}
                   className="w-full md:w-[240px] pl-8 pr-3 py-1.5 text-[13px] border border-kite-border-soft dark:border-kite-border-hard bg-white dark:bg-kite-bg text-kite-text rounded-sm focus:outline-none focus:border-kite-blue focus:ring-[0.5px] focus:ring-kite-blue transition-all"
                 />
               </div>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync('src/components/BusinessDetail.tsx', content);
  console.log("Patched search input design");
} else {
  console.log("Target string not found in BusinessDetail.tsx");
}
