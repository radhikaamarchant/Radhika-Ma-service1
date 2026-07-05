const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

if (!content.includes('useKeyboardShortcuts')) {
  content = content.replace(
    /import \{ useMobileBackNavigation \} from "\.\.\/hooks\/useMobileBackNavigation";/,
    'import { useMobileBackNavigation } from "../hooks/useMobileBackNavigation";\nimport { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";'
  );
}

const hookNextCode = `useKeyboardShortcuts({
    'enter': (e) => {
      if (viewMode === 'add-step-1' && newInvestor.name && newInvestor.phone) {
        e.preventDefault();
        handleNextStep(e as any);
      }
    },
    'shift+enter': (e) => {
      if (viewMode === 'add-step-1' && newInvestor.name && newInvestor.phone) {
        e.preventDefault();
        handleNextStep(e as any);
      }
    },
    'shift': (e) => {
      if (viewMode === 'add-step-1' && newInvestor.name && newInvestor.phone) {
        e.preventDefault();
        handleNextStep(e as any);
      }
    }
  }, viewMode === 'add-step-1');

  const handleNextStep = `;

content = content.replace(/const handleNextStep = /, hookNextCode);

const hookSaveCode = `useKeyboardShortcuts({
    'enter': (e) => {
      if (viewMode === 'add-step-2') {
        e.preventDefault();
        handleVerifiedSave(e as any);
      }
    },
    'shift+enter': (e) => {
      if (viewMode === 'add-step-2') {
        e.preventDefault();
        handleVerifiedSave(e as any);
      }
    },
    'shift': (e) => {
      if (viewMode === 'add-step-2') {
        e.preventDefault();
        handleVerifiedSave(e as any);
      }
    }
  }, viewMode === 'add-step-2');

  const handleVerifiedSave = `;

content = content.replace(/const handleVerifiedSave = /, hookSaveCode);

const hookPayCode = `useKeyboardShortcuts({
    'enter': (e) => {
      if (viewMode === 'withdraw-bank') {
        e.preventDefault();
        handlePay();
      }
    },
    'shift+enter': (e) => {
      if (viewMode === 'withdraw-bank') {
        e.preventDefault();
        handlePay();
      }
    },
    'shift': (e) => {
      if (viewMode === 'withdraw-bank') {
        e.preventDefault();
        handlePay();
      }
    }
  }, viewMode === 'withdraw-bank');

  const handlePay = `;
  
content = content.replace(/const handlePay = /, hookPayCode);

fs.writeFileSync('src/pages/Investors.tsx', content);
