const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

content = content.replace(
  /}\s*;\s*const handleInputModeChange/g,
  `}
      setIsBooking(false);
      onClose();
    }, 600);
  };

  const handleInputModeChange`
);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
console.log("Patched submit end");
