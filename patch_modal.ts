import fs from 'fs';

let code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf8');
const targetUse = `  const [isBooking, setIsBooking] = useState(false);`;
const replacementUse = `  const [isBooking, setIsBooking] = useState(false);

  useMobileBackNavigation(isOpen, onClose);
`;
if (code.includes(targetUse)) {
  code = code.replace(targetUse, replacementUse);
  fs.writeFileSync('src/components/AddInvestmentModal.tsx', code);
}
