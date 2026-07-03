import fs from 'fs';

let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

const hooks = `  useMobileBackNavigation(showAddForm, () => { setShowAddForm(false); setIsFromAnalysis(false); });
  useMobileBackNavigation(showBusinessSelect, () => setShowBusinessSelect(false));
  useMobileBackNavigation(showInvestorSelect, () => setShowInvestorSelect(false));
  useMobileBackNavigation(!!selectedInvestment, () => setSelectedInvestment(null));`;

code = code.replace(hooks, '');

const targetToInsertAfter = `  const [isBooking, setIsBooking] = useState(false);`;

if (code.includes(targetToInsertAfter)) {
  code = code.replace(targetToInsertAfter, targetToInsertAfter + '\\n\\n' + hooks);
  fs.writeFileSync('src/pages/Investments.tsx', code);
  console.log("Success Investments");
} else {
  console.log("Could not find target to insert after in Investments");
}
