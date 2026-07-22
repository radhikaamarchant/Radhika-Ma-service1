const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

// Replace activeCount block (both occurrences)
content = content.replace(
  /const activeCount = selectedBusiness\s*\?\s*state\.investments\.filter\(\s*\([^)]*\)\s*=>\s*inv\.investorId === i\.id &&\s*inv\.businessId ===\s*selectedBusiness\.id &&\s*inv\.status === "active",\s*\)\.length\s*:\s*0;/g,
  `const activeInvs = selectedBusiness ? state.investments.filter((inv: any) => inv.investorId === i.id && inv.businessId === selectedBusiness.id && inv.status === "active") : [];
  const activeCount = activeInvs.length;
  const totalQty = activeInvs.reduce((sum, inv: any) => sum + (inv.quantity || (selectedBusiness?.triggerAmount ? Math.floor(inv.amount / selectedBusiness.triggerAmount) : 0)), 0);`
);

// Replace activeCount display
content = content.replace(
  /\{activeCount > 0 && \(\s*<div className="bg-\[#4184F3\] text-white text-\[10px\] font-medium px-1\.5 py-0\.5 rounded-full flex items-center justify-center min-w-\[16px\] h-\[16px\] shrink-0">\s*\{activeCount\}\s*<\/div>\s*\)\}/g,
  `{activeCount > 0 && (
    <div className="bg-[#4184F3] text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full flex items-center justify-center shrink-0">
      {orderMode === "SELL" ? \`\${totalQty} Qty\` : activeCount}
    </div>
  )}`
);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
console.log("Patched investor qty display");
