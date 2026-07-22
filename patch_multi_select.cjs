const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

// 1. Add state
content = content.replace(
  '  const [isBooking, setIsBooking] = useState(false);',
  '  const [isBooking, setIsBooking] = useState(false);\n  const [isInvestorMultiSelect, setIsInvestorMultiSelect] = useState(false);'
);

// 2. Reset state on open
content = content.replace(
  '      setOrderMode("BUY");\n    }\n  }, [isOpen, initialBusinessId, initialInvestorId]);',
  '      setOrderMode("BUY");\n      setIsInvestorMultiSelect(false);\n    }\n  }, [isOpen, initialBusinessId, initialInvestorId]);'
);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
console.log("Patched state");
