const fs = require('fs');
let content = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

if (!content.includes('Search,')) {
  content = content.replace(
    '  Upload,',
    '  Upload,\n  Search,'
  );
}

const targetSection = `               <input
                 type="text"
                 placeholder="Search investor..."
                 value={investorSearchQuery}
                 onChange={(e) => setInvestorSearchQuery(e.target.value)}
                 className="hidden md:block w-full md:w-64 border border-kite-border-hard rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-kite-blue"
               />`;

const newSection = `               <div className="hidden md:flex items-center border-b border-kite-border-hard w-64 pb-1">
                 <Search className="w-4 h-4 text-kite-text-light mr-2" />
                 <input
                   type="text"
                   placeholder="Search investor..."
                   value={investorSearchQuery}
                   onChange={(e) => setInvestorSearchQuery(e.target.value)}
                   className="w-full bg-transparent border-none outline-none text-[13px] text-kite-text placeholder-kite-text-light font-medium"
                 />
               </div>`;

if (content.includes(targetSection)) {
  content = content.replace(targetSection, newSection);
}

const targetTableRow = `<td className="py-4 pl-5 pr-4 text-kite-text font-medium whitespace-nowrap">{investor?.name || "Unknown"}</td>`;
const newTableRow = `<td className="py-4 pl-5 pr-4 text-kite-text font-medium whitespace-nowrap uppercase">{investor?.name?.toUpperCase() || "UNKNOWN"}</td>`;

if (content.includes(targetTableRow)) {
  content = content.replace(targetTableRow, newTableRow);
}

fs.writeFileSync('src/components/BusinessDetail.tsx', content);
console.log("Patched search box and uppercase investor names");
