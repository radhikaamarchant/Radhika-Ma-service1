const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf8');

const hookCode = `useKeyboardShortcuts({
    'enter': (e) => {
      if (!isBooking && selectedBusiness && selectedInvestor) {
        e.preventDefault();
        handleAddSubmit(e as any);
      }
    },
    'shift+enter': (e) => {
      if (!isBooking && selectedBusiness && selectedInvestor) {
        e.preventDefault();
        handleAddSubmit(e as any);
      }
    },
    'shift': (e) => {
      if (!isBooking && selectedBusiness && selectedInvestor) {
        e.preventDefault();
        handleAddSubmit(e as any);
      }
    }
  }, isOpen);

  const handleAddSubmit = `;

content = content.replace(/useKeyboardShortcuts\(\{[\s\S]*?\}, isOpen\);\n\n  const handleAddSubmit = /m, hookCode);
fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);

// Now for Investments.tsx where `showAddForm` is used.
let invContent = fs.readFileSync('src/pages/Investments.tsx', 'utf8');
if (!invContent.includes('useKeyboardShortcuts')) {
  invContent = invContent.replace(
    /import \{ useAppContext \} from "\.\.\/utils\/AppContext";/,
    'import { useAppContext } from "../utils/AppContext";\nimport { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";'
  );
}

const invHookCode = `useKeyboardShortcuts({
    'enter': (e) => {
      if (showAddForm && !isSubmitting && formData.businessId && formData.investorId) {
        e.preventDefault();
        handleAddSubmit(e as any);
      }
    },
    'shift+enter': (e) => {
      if (showAddForm && !isSubmitting && formData.businessId && formData.investorId) {
        e.preventDefault();
        handleAddSubmit(e as any);
      }
    },
    'shift': (e) => {
      if (showAddForm && !isSubmitting && formData.businessId && formData.investorId) {
        e.preventDefault();
        handleAddSubmit(e as any);
      }
    }
  }, showAddForm);

  const handleAddSubmit = `;

invContent = invContent.replace(/const handleAddSubmit = /, invHookCode);
fs.writeFileSync('src/pages/Investments.tsx', invContent);
