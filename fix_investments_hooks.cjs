const fs = require('fs');

let content = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

// 1. Remove the useKeyboardShortcuts from inside the IIFE
content = content.replace(/useKeyboardShortcuts\(\{\s*'enter': \(e\) => \{\s*if \(withdrawStep === 1\) \{\s*e\.preventDefault\(\);\s*handleConfirmWithdraw\(\);\s*\}\s*\},[\s\S]*?\}, withdrawStep === 1\);/, '');

// 2. Add confirmWithdrawRef to the top level
content = content.replace(
  /const \[withdrawStep, setWithdrawStep\] = useState\(0\);/,
  'const [withdrawStep, setWithdrawStep] = useState(0);\n  const confirmWithdrawRef = useRef<() => void>();'
);

// 3. Update the existing top-level useKeyboardShortcuts to handle withdrawStep === 1
content = content.replace(
  /useKeyboardShortcuts\(\{/,
  `useKeyboardShortcuts({
    'enter': (e) => {
      if (withdrawStep === 1 && confirmWithdrawRef.current) {
        e.preventDefault();
        confirmWithdrawRef.current();
        return;
      }
      if (showAddForm && !isSubmitting && formData.businessId && formData.investorId) {
        e.preventDefault();
        handleAddSubmit(e as any);
      }
    },
    'shift+enter': (e) => {
      if (withdrawStep === 1 && confirmWithdrawRef.current) {
        e.preventDefault();
        confirmWithdrawRef.current();
        return;
      }
      if (showAddForm && !isSubmitting && formData.businessId && formData.investorId) {
        e.preventDefault();
        handleAddSubmit(e as any);
      }
    },
    'shift': (e) => {
      if (withdrawStep === 1 && confirmWithdrawRef.current) {
        e.preventDefault();
        confirmWithdrawRef.current();
        return;
      }
      if (showAddForm && !isSubmitting && formData.businessId && formData.investorId) {
        e.preventDefault();
        handleAddSubmit(e as any);
      }
    },
    // We overwrite the existing ones below, but wait, if I just replace useKeyboardShortcuts({ with this, I need to remove the existing ones.`
);
// Wait, regex replacement is tricky, let's write a better script.
