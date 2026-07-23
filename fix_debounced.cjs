const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

const sOld = `  const [investorSearchQuery, setInvestorSearchQuery] = useState("");\n  const [debouncedInvestorSearchQuery] = useDebounce(investorSearchQuery, 300);`;
code = code.replace(sOld, '');

const tOld = `  const filteredBusinessInvestments = useMemo(() => businessInvestments.filter(inv => {`;
const tNew = `  const [investorSearchQuery, setInvestorSearchQuery] = useState("");\n  const [debouncedInvestorSearchQuery] = useDebounce(investorSearchQuery, 300);\n\n  const filteredBusinessInvestments = useMemo(() => businessInvestments.filter(inv => {`;
code = code.replace(tOld, tNew);

fs.writeFileSync('src/components/BusinessDetail.tsx', code);
