import fs from 'fs';

const code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf8');
const targetStr = `  const activeBusinesses = state.businesses.filter(b => b.status === "active" || b.status === "funded");
  const sortedInvestors = [...state.investors].sort((a, b) => a.name.localeCompare(b.name));`;

const replacementStr = `  const getTime = (id: string) => parseInt(id.replace(/\\D/g, "")) || 0;
  const activeBusinesses = state.businesses
    .filter((b: any) => b.status === "active" || b.status === "funded")
    .sort((a, b) => getTime(b.id) - getTime(a.id));
  const sortedInvestors = [...state.investors]
    .sort((a, b) => new Date(b.joinDate || 0).getTime() - new Date(a.joinDate || 0).getTime());`;

if (code.includes(targetStr)) {
  const updatedCode = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/components/AddInvestmentModal.tsx', updatedCode);
  console.log("Success");
} else {
  console.log("Target string not found!");
}
