const fs = require('fs');
const invFile = fs.readFileSync('src/pages/Investments.tsx', 'utf8');
const modFile = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf8');

const invLines = invFile.split('\n');
const desktopFormStart = invLines.findIndex(l => l.includes('key="desktop-add-form"'));
const desktopFormEnd = invLines.findIndex((l, i) => i > desktopFormStart && l.trim() === '</motion.div>' && invLines[i-1].includes('AnimatePresence>'));

// We want lines from desktopFormStart-1 (the <motion.div) to desktopFormEnd
let newUI = invLines.slice(desktopFormStart - 1, desktopFormEnd + 1).join('\n');

// In newUI, replace `onClick={() => setShowAddForm(false)}` with `onClick={onClose}`
newUI = newUI.replace('onClick={() => setShowAddForm(false)}', 'onClick={onClose}');
newUI = newUI.replace('setShowAddForm(false);', 'onClose();');
newUI = newUI.replace('setShowAddForm(false);', 'onClose();');
newUI = newUI.replace('setShowAddForm(false)', 'onClose()');

// Remove `key="desktop-add-form"` and `className="hidden md:flex fixed inset-0 z-[110] bg-black/60 items-center justify-center p-4"`
// and change it to `className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 font-sans"`
newUI = newUI.replace('key="desktop-add-form"', '');
newUI = newUI.replace('className="hidden md:flex fixed inset-0 z-[110] bg-black/60 items-center justify-center p-4"', 'className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 font-sans"');

const modLines = modFile.split('\n');
const returnStart = modLines.findIndex(l => l.trim() === 'return (');
const preReturn = modLines.slice(0, returnStart).join('\n');

let newPreReturn = preReturn;
// Insert states if missing
if (!newPreReturn.includes('desktopShowBusinessSelect')) {
    newPreReturn = newPreReturn.replace('const [showInvestorSelect, setShowInvestorSelect] = useState(false);', `const [showInvestorSelect, setShowInvestorSelect] = useState(false);
  const [desktopShowBusinessSelect, setDesktopShowBusinessSelect] = useState(false);
  const [desktopShowInvestorSelect, setDesktopShowInvestorSelect] = useState(false);
  const [businessSearch, setBusinessSearch] = useState("");`);
}

if (!newPreReturn.includes('activeBusinesses')) {
    newPreReturn = newPreReturn.replace('const sortedInvestors', `const activeBusinesses = state.businesses.filter(b => b.status === "active" || b.status === "funded");\n  const sortedInvestors`);
}

const finalFile = newPreReturn + '\n  return (\n    <AnimatePresence>\n      {isOpen && (\n' + newUI + '\n      )}\n    </AnimatePresence>\n  );\n}\n';

fs.writeFileSync('src/components/AddInvestmentModal.tsx', finalFile);
console.log("Successfully replaced AddInvestmentModal.tsx UI");
