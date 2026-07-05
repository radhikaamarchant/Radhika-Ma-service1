const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf8');

if (!content.includes('useKeyboardShortcuts')) {
  content = content.replace(
    /import \{ useMobileBackNavigation \} from "\.\.\/hooks\/useMobileBackNavigation";/,
    'import { useMobileBackNavigation } from "../hooks/useMobileBackNavigation";\nimport { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";'
  );
  
  content = content.replace(
    /const handleAddSubmit = \(e: React\.FormEvent\) => \{/,
    `useKeyboardShortcuts({
    'enter': (e) => {
      e.preventDefault();
      if (!isBooking && selectedBusiness && selectedInvestor) {
        handleAddSubmit(e as any);
      }
    },
    'shift': (e) => {
      e.preventDefault();
      if (!isBooking && selectedBusiness && selectedInvestor) {
        handleAddSubmit(e as any);
      }
    }
  }, isOpen);

  const handleAddSubmit = (e: React.FormEvent) => {`
  );
  
  fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
  console.log("Patched AddInvestmentModal.tsx");
}
