const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

content = content.replace(
  'const [searchTerm, setSearchTerm] = useState("");',
  'const [searchTerm, setSearchTerm] = useState("");\n  const [showAddForm, setShowAddForm] = useState(false);\n  const [addModalBusinessId, setAddModalBusinessId] = useState("");\n  const [addModalInvestorId, setAddModalInvestorId] = useState("");'
);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Patched Investors.tsx state");
