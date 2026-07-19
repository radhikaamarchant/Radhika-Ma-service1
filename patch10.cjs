const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

content = content.replace(
  'const [orderMode, setOrderMode] = useState<"BUY" | "SELL">("BUY");',
  'const [orderMode, setOrderMode] = useState<"BUY" | "SELL">("BUY");\n  const [orderTab, setOrderTab] = useState<"REGULAR" | "CAP">("REGULAR");'
);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
