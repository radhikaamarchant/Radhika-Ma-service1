const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

// 1. add import
content = content.replace('import InvestorDetail from "../components/InvestorDetail";', 'import InvestorDetail from "../components/InvestorDetail";\nimport AddInvestmentModal from "../components/AddInvestmentModal";');

// 2. add states
content = content.replace('const [viewMode, setViewMode] = useState<"list" | "form" | "investor-detail">("list");', 'const [viewMode, setViewMode] = useState<"list" | "form" | "investor-detail">("list");\n  const [showAddForm, setShowAddForm] = useState(false);\n  const [addModalBusinessId, setAddModalBusinessId] = useState("");\n  const [addModalInvestorId, setAddModalInvestorId] = useState("");');

// 3. update InvestorDetail props
content = content.replace(/<InvestorDetail\s+investorId=\{selectedInvestor\.id\}\s+onBack=\{\(\) => setViewMode\("list"\)\}\s*\/>/, `<InvestorDetail
              investorId={selectedInvestor.id}
              onBack={() => setViewMode("list")}
              onBuyClick={(investment: any) => {
                setAddModalBusinessId(investment.businessId);
                setAddModalInvestorId(investment.investorId);
                setShowAddForm(true);
              }}
            />`);

// 4. add AddInvestmentModal render
content = content.replace('</div>\n    </div>\n  );\n}', `</div>\n    </div>\n      <AddInvestmentModal 
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        initialBusinessId={addModalBusinessId}
        initialInvestorId={addModalInvestorId}
      />\n  );\n}`);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Patched Investors.tsx");
