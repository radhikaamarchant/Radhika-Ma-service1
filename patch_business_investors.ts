import * as fs from 'fs';

let content = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

const target1 = `  const [investorSearchQuery, setInvestorSearchQuery] = useState("");

  const filteredBusinessInvestments = useMemo(() => businessInvestments.filter(inv => {
    const investor = state.investors.find(i => i.id === inv.investorId);
    return investor?.name?.toLowerCase().includes(investorSearchQuery.toLowerCase());
  }), [businessInvestments, state.investors, investorSearchQuery]);`;

const replacement1 = `  const [investorSearchQuery, setInvestorSearchQuery] = useState("");
  const [investorMode, setInvestorMode] = useState<"holding" | "payout">("holding");

  const filteredBusinessInvestments = useMemo(() => businessInvestments.filter(inv => {
    const investor = state.investors.find(i => i.id === inv.investorId);
    const matchesSearch = investor?.name?.toLowerCase().includes(investorSearchQuery.toLowerCase());
    const matchesMode = investorMode === "holding" ? inv.status !== "completed" : inv.status === "completed";
    return matchesSearch && matchesMode;
  }), [businessInvestments, state.investors, investorSearchQuery, investorMode]);`;

content = content.replace(target1, replacement1);

const target2 = `            <div className="px-5 py-3 border-b border-kite-border-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
               <h3 className="text-[17px] font-normal text-kite-text-light capitalize tracking-wider">Available Investor</h3>
               <div className="relative hidden md:block">`;

const replacement2 = `            <div className="px-5 py-3 border-b border-kite-border-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
               <div className="flex items-center gap-4">
                 <h3 className="text-[17px] font-normal text-kite-text-light capitalize tracking-wider hidden md:block">Available Investor</h3>
                 <div className="flex items-center bg-gray-100 dark:bg-kite-bg p-0.5 rounded-sm overflow-hidden border border-kite-border-soft dark:border-kite-border-hard">
                   <button
                     onClick={() => setInvestorMode("holding")}
                     className={\`px-4 py-1.5 text-[13px] font-medium transition-colors \${
                       investorMode === "holding"
                         ? "bg-white dark:bg-kite-surface text-kite-text shadow-sm"
                         : "text-kite-text-light hover:text-kite-text"
                     }\`}
                   >
                     Holding
                   </button>
                   <button
                     onClick={() => setInvestorMode("payout")}
                     className={\`px-4 py-1.5 text-[13px] font-medium transition-colors \${
                       investorMode === "payout"
                         ? "bg-white dark:bg-kite-surface text-kite-text shadow-sm"
                         : "text-kite-text-light hover:text-kite-text"
                     }\`}
                   >
                     Pay Out
                   </button>
                 </div>
               </div>
               <div className="relative hidden md:block">`;

content = content.replace(target2, replacement2);

fs.writeFileSync('src/components/BusinessDetail.tsx', content, 'utf8');
console.log('Done!');
