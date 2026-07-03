import fs from 'fs';

let code = fs.readFileSync('src/components/InvestorDetail.tsx', 'utf8');

const hooks = `  useMobileBackNavigation(isEditingDetails, () => setIsEditingDetails(false));
  useMobileBackNavigation(!!selectedPortfolioInvestment, () => setSelectedPortfolioInvestment(null));`;

code = code.replace(hooks, '');

const targetToInsertAfter = `  const [formData, setFormData] = useState({`;

if (code.includes(targetToInsertAfter)) {
  code = code.replace(targetToInsertAfter, hooks + '\\n\\n' + targetToInsertAfter);
  fs.writeFileSync('src/components/InvestorDetail.tsx', code);
  console.log("Success InvestorDetail");
} else {
  console.log("Could not find target to insert after in InvestorDetail");
}
