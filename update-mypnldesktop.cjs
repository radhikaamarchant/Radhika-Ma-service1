const fs = require('fs');

const code = `import React, { useState, useMemo, useEffect } from "react";
import { useAppContext } from "../utils/AppContext";
import { X, Search, ChevronLeft, Save } from "lucide-react";
import { Business, Investor } from "../types";

interface GroupedAccount {
  id: string; // bankName + accountNumber + ifscCode
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderNames: string[];
  investors: Investor[];
  businesses: Business[];
}

export default function MyPnLDesktop() {
  const { state } = useAppContext();
  const [selectedAccount, setSelectedAccount] = useState<GroupedAccount | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Local state for account settings
  const [accountType, setAccountType] = useState<"SAVING" | "CURRENT">("SAVING");
  const [savingWithdrawalLimit, setSavingWithdrawalLimit] = useState("");
  const [currentWithdrawalLimit, setCurrentWithdrawalLimit] = useState("");
  const [taxThresholdAmount, setTaxThresholdAmount] = useState("");
  const [taxPercentage, setTaxPercentage] = useState("");

  useEffect(() => {
    if (selectedAccount) {
      setAccountType("SAVING");
      setSavingWithdrawalLimit("");
      setCurrentWithdrawalLimit("");
      setTaxThresholdAmount("");
      setTaxPercentage("");
    }
  }, [selectedAccount]);

  const groupedAccounts = useMemo(() => {
    const map = new Map<string, GroupedAccount>();
    
    state.investors.forEach(inv => {
      if (inv.bankDetails?.accountNumber) {
        const id = \`\${inv.bankDetails.bankName}-\${inv.bankDetails.accountNumber}-\${inv.bankDetails.ifscCode}\`.toUpperCase();
        if (!map.has(id)) {
          map.set(id, { 
            id,
            bankName: inv.bankDetails.bankName,
            accountNumber: inv.bankDetails.accountNumber,
            ifscCode: inv.bankDetails.ifscCode,
            accountHolderNames: [inv.bankDetails.accountHolderName],
            investors: [inv],
            businesses: []
          });
        } else {
          const group = map.get(id)!;
          if (!group.accountHolderNames.includes(inv.bankDetails.accountHolderName)) {
            group.accountHolderNames.push(inv.bankDetails.accountHolderName);
          }
          group.investors.push(inv);
        }
      }
    });

    state.businesses.forEach(biz => {
      if (biz.bankDetails?.accountNumber) {
        const id = \`\${biz.bankDetails.bankName}-\${biz.bankDetails.accountNumber}-\${biz.bankDetails.ifscCode}\`.toUpperCase();
        if (!map.has(id)) {
          map.set(id, { 
            id,
            bankName: biz.bankDetails.bankName,
            accountNumber: biz.bankDetails.accountNumber,
            ifscCode: biz.bankDetails.ifscCode,
            accountHolderNames: [biz.bankDetails.accountHolderName],
            investors: [],
            businesses: [biz]
          });
        } else {
          const group = map.get(id)!;
          if (!group.accountHolderNames.includes(biz.bankDetails.accountHolderName)) {
            group.accountHolderNames.push(biz.bankDetails.accountHolderName);
          }
          group.businesses.push(biz);
        }
      }
    });

    return Array.from(map.values());
  }, [state.investors, state.businesses]);

  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return groupedAccounts;
    const lowerQ = searchQuery.toLowerCase();
    return groupedAccounts.filter(acc => 
      acc.bankName.toLowerCase().includes(lowerQ) ||
      acc.accountNumber.toLowerCase().includes(lowerQ) ||
      acc.ifscCode.toLowerCase().includes(lowerQ) ||
      acc.accountHolderNames.some(name => name.toLowerCase().includes(lowerQ))
    );
  }, [groupedAccounts, searchQuery]);

  const handleSaveConfig = () => {
    alert("Configuration saved for account: " + selectedAccount?.accountNumber);
  };

  if (selectedAccount) {
    return (
      <div className="w-full max-w-6xl mx-auto p-8 space-y-8">
        <div className="flex items-center space-x-4 border-b border-kite-border dark:border-[#2b2b2b] pb-6">
          <button 
            onClick={() => setSelectedAccount(null)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#2b2b2b] rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-kite-text dark:text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-kite-text dark:text-white uppercase">
              {selectedAccount.bankName}
            </h1>
            <p className="text-[13px] text-kite-text-light mt-1 font-mono">
              A/C: {selectedAccount.accountNumber} | IFSC: {selectedAccount.ifscCode}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Account Configuration */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-[13px] font-semibold text-kite-text-light uppercase tracking-widest border-b border-kite-border dark:border-[#2b2b2b] pb-2">
              Account Configuration
            </h2>
            
            <div className="space-y-5 bg-gray-50 dark:bg-[#181818] p-5 rounded-sm border border-kite-border dark:border-[#2b2b2b]">
              <div>
                <label className="block text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-2">Account Type</label>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setAccountType("SAVING")}
                    className={\`flex-1 py-2 text-[12px] font-medium rounded-sm border transition-colors \${accountType === "SAVING" ? "bg-kite-blue/10 border-kite-blue text-kite-blue" : "border-kite-border dark:border-[#2b2b2b] text-kite-text dark:text-white hover:bg-gray-100 dark:hover:bg-[#222]"}\`}
                  >
                    SAVING
                  </button>
                  <button 
                    onClick={() => setAccountType("CURRENT")}
                    className={\`flex-1 py-2 text-[12px] font-medium rounded-sm border transition-colors \${accountType === "CURRENT" ? "bg-kite-blue/10 border-kite-blue text-kite-blue" : "border-kite-border dark:border-[#2b2b2b] text-kite-text dark:text-white hover:bg-gray-100 dark:hover:bg-[#222]"}\`}
                  >
                    CURRENT
                  </button>
                </div>
              </div>

              {accountType === "SAVING" && (
                <div>
                  <label className="block text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-2">Saving Limit / Withdrawal (₹)</label>
                  <input
                    type="number"
                    value={savingWithdrawalLimit}
                    onChange={(e) => setSavingWithdrawalLimit(e.target.value)}
                    placeholder="E.g. 50000"
                    className="block w-full px-3 py-2 border border-kite-border dark:border-[#2b2b2b] rounded-sm leading-5 bg-white dark:bg-kite-surface text-kite-text dark:text-white placeholder-kite-text-light focus:outline-none focus:ring-1 focus:ring-kite-blue focus:border-kite-blue sm:text-sm transition-colors"
                  />
                </div>
              )}

              {accountType === "CURRENT" && (
                <div>
                  <label className="block text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-2">Current Limit / Withdrawal (₹)</label>
                  <input
                    type="number"
                    value={currentWithdrawalLimit}
                    onChange={(e) => setCurrentWithdrawalLimit(e.target.value)}
                    placeholder="E.g. 200000"
                    className="block w-full px-3 py-2 border border-kite-border dark:border-[#2b2b2b] rounded-sm leading-5 bg-white dark:bg-kite-surface text-kite-text dark:text-white placeholder-kite-text-light focus:outline-none focus:ring-1 focus:ring-kite-blue focus:border-kite-blue sm:text-sm transition-colors"
                  />
                </div>
              )}

              <div className="pt-2 border-t border-kite-border dark:border-[#2b2b2b]">
                <h3 className="text-[12px] font-semibold text-kite-text dark:text-white uppercase mb-3">Income Tax Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-2">Amount Threshold (₹)</label>
                    <input
                      type="number"
                      value={taxThresholdAmount}
                      onChange={(e) => setTaxThresholdAmount(e.target.value)}
                      placeholder="E.g. 1000000"
                      className="block w-full px-3 py-2 border border-kite-border dark:border-[#2b2b2b] rounded-sm leading-5 bg-white dark:bg-kite-surface text-kite-text dark:text-white placeholder-kite-text-light focus:outline-none focus:ring-1 focus:ring-kite-blue focus:border-kite-blue sm:text-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-2">Tax Percentage (%)</label>
                    <input
                      type="number"
                      value={taxPercentage}
                      onChange={(e) => setTaxPercentage(e.target.value)}
                      placeholder="E.g. 18"
                      className="block w-full px-3 py-2 border border-kite-border dark:border-[#2b2b2b] rounded-sm leading-5 bg-white dark:bg-kite-surface text-kite-text dark:text-white placeholder-kite-text-light focus:outline-none focus:ring-1 focus:ring-kite-blue focus:border-kite-blue sm:text-sm transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleSaveConfig}
                  className="w-full py-2.5 bg-kite-blue text-white text-[13px] font-medium rounded-sm hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Profiles */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 h-fit">
            {/* Investors Section */}
            {selectedAccount.investors.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-[13px] font-semibold text-kite-text-light uppercase tracking-widest border-b border-kite-border dark:border-[#2b2b2b] pb-2">
                  Associated Investors ({selectedAccount.investors.length})
                </h2>
                <div className="space-y-4">
                  {selectedAccount.investors.map((inv, idx) => (
                    <div key={idx} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-[#181818] rounded-sm border border-kite-border dark:border-[#2b2b2b]">
                      {inv.photoUrl ? (
                        <img src={inv.photoUrl} alt="Investor" className="w-12 h-12 rounded-full object-cover border border-kite-border dark:border-[#2b2b2b]" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-kite-blue/10 text-kite-blue flex items-center justify-center font-semibold text-lg">
                          {inv.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-[15px] font-semibold text-kite-text dark:text-white uppercase">{inv.name}</div>
                        <div className="text-[13px] text-kite-text-light uppercase">{inv.address?.city || 'Unknown City'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Businesses Section */}
            {selectedAccount.businesses.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-[13px] font-semibold text-kite-text-light uppercase tracking-widest border-b border-kite-border dark:border-[#2b2b2b] pb-2">
                  Associated Businesses ({selectedAccount.businesses.length})
                </h2>
                <div className="space-y-4">
                  {selectedAccount.businesses.map((biz, idx) => (
                    <div key={idx} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-[#181818] rounded-sm border border-kite-border dark:border-[#2b2b2b]">
                      {biz.photoUrl ? (
                        <img src={biz.photoUrl} alt="Business" className="w-12 h-12 rounded-full object-cover border border-kite-border dark:border-[#2b2b2b]" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-kite-blue/10 text-kite-blue flex items-center justify-center font-semibold text-lg">
                          {biz.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-[15px] font-semibold text-kite-text dark:text-white uppercase">{biz.name}</div>
                        <div className="text-[13px] text-kite-text-light uppercase">Owner: {biz.ownerName}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-kite-text dark:text-white uppercase">Bank Ledger / Statement</h1>
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-kite-text-light" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-kite-border dark:border-[#2b2b2b] rounded-sm leading-5 bg-white dark:bg-kite-surface text-kite-text dark:text-white placeholder-kite-text-light focus:outline-none focus:ring-1 focus:ring-kite-blue focus:border-kite-blue sm:text-sm transition-colors"
            placeholder="Search accounts, names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <section>
        <div className="w-full">
          <div className="grid grid-cols-[1.5fr_1.5fr_2fr_1fr_1fr] text-[13px] font-medium text-kite-text-light uppercase tracking-wider py-3 border-b border-t border-kite-border dark:border-[#2b2b2b]">
            <div>BANK NAME</div>
            <div>ACCOUNT NUMBER</div>
            <div>ACCOUNT HOLDER(S)</div>
            <div>A/C TYPE</div>
            <div className="text-right">ACTION</div>
          </div>
          {filteredAccounts.map((acc, idx) => (
            <div key={idx} className="grid grid-cols-[1.5fr_1.5fr_2fr_1fr_1fr] text-[14px] text-kite-text dark:text-white py-4 border-b border-kite-border dark:border-[#2b2b2b] items-center hover:bg-gray-50 dark:hover:bg-[#181818] transition-colors">
              <div className="font-semibold uppercase">{acc.bankName || 'UNKNOWN BANK'}</div>
              <div className="font-mono">{acc.accountNumber}</div>
              <div className="uppercase truncate pr-4" title={acc.accountHolderNames.join(', ')}>
                {acc.accountHolderNames.join(', ')}
              </div>
              <div>SAVING</div>
              <div className="text-right">
                <button 
                  onClick={() => setSelectedAccount(acc)}
                  className="px-4 py-1.5 bg-kite-blue/10 text-kite-blue hover:bg-kite-blue/20 transition-colors text-[13px] font-medium rounded-sm"
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
          {filteredAccounts.length === 0 && (
            <div className="py-8 text-center text-[13px] text-kite-text-light border-b border-kite-border dark:border-[#2b2b2b]">
              No bank records found matching "{searchQuery}"
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/MyPnLDesktop.tsx', code);
