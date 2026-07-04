import fs from 'fs';
let code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf8');

code = code.replace(
  'onClick={() => setOrderMode("BUY")}',
  'onClick={() => { setOrderMode("BUY"); setFormData({ ...formData, investorId: "" }); }}'
);
code = code.replace(
  'onClick={() => setOrderMode("SELL")}',
  'onClick={() => { setOrderMode("SELL"); setFormData({ ...formData, investorId: "" }); }}'
);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', code);
console.log("Success OrderMode Patch");
