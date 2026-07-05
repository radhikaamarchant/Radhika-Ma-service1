const fs = require('fs');
let content = fs.readFileSync('src/components/LivePortfolioDetail.tsx', 'utf8');

if (!content.includes('useKeyboardShortcuts')) {
  content = content.replace(
    /import \{ useAppContext \} from "\.\.\/utils\/AppContext";/,
    'import { useAppContext } from "../utils/AppContext";\nimport { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";'
  );
}

const hookCode = `useKeyboardShortcuts({
    'enter': (e) => {
      if (withdrawStep === 1) {
        e.preventDefault();
        handleConfirmWithdraw();
      }
    },
    'shift+enter': (e) => {
      if (withdrawStep === 1) {
        e.preventDefault();
        handleConfirmWithdraw();
      }
    },
    'shift': (e) => {
      if (withdrawStep === 1) {
        e.preventDefault();
        handleConfirmWithdraw();
      }
    }
  }, withdrawStep === 1);

  const handleConfirmWithdraw = `;

content = content.replace(/const handleConfirmWithdraw = /, hookCode);
fs.writeFileSync('src/components/LivePortfolioDetail.tsx', content);

// And Investments.tsx for handleConfirmWithdraw
let invContent = fs.readFileSync('src/pages/Investments.tsx', 'utf8');
const hookCode2 = `useKeyboardShortcuts({
    'enter': (e) => {
      if (withdrawStep === 1) {
        e.preventDefault();
        handleConfirmWithdraw();
      }
    },
    'shift+enter': (e) => {
      if (withdrawStep === 1) {
        e.preventDefault();
        handleConfirmWithdraw();
      }
    },
    'shift': (e) => {
      if (withdrawStep === 1) {
        e.preventDefault();
        handleConfirmWithdraw();
      }
    }
  }, withdrawStep === 1);

  const handleConfirmWithdraw = `;
invContent = invContent.replace(/const handleConfirmWithdraw = /, hookCode2);
fs.writeFileSync('src/pages/Investments.tsx', invContent);
