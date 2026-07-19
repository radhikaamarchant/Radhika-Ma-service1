const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

content = content.replace(/accent-\\\$\\{orderMode === 'BUY' \? '\[#4184F3\]' : '\[#FF5722\]'\\}/g, 
  "${orderMode === 'BUY' ? 'accent-[#4184F3]' : 'accent-[#FF5722]'}");

content = content.replace(/focus:border-\\\$\\{orderMode === 'BUY' \? '\[#4184F3\]' : '\[#FF5722\]'\\}/g, 
  "${orderMode === 'BUY' ? 'focus:border-[#4184F3]' : 'focus:border-[#FF5722]'}");

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
