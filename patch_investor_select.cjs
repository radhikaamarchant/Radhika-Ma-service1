const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

// Replace "Select All" button logic (both occurrences)
content = content.replace(
  /onClick=\{\(e\) => \{\s*e\.stopPropagation\(\);\s*const filteredIds/g,
  `onClick={(e) => {
    e.stopPropagation();
    if (!isInvestorMultiSelect) {
      setIsInvestorMultiSelect(true);
      return;
    }
    const filteredIds`
);

// Replace "Select All" text (both occurrences)
content = content.replace(
  />\s*Select All\s*<\/button>/g,
  `>
  {isInvestorMultiSelect ? "Choose All" : "Choose"}
</button>`
);

// Replace individual investor selection logic (both occurrences)
content = content.replace(
  /onClick=\{\(e\) => \{\s*e\.stopPropagation\(\);\s*setFormData\(\{\s*\.\.\.formData,\s*investorIds: \[i\.id\],\s*\}\);\s*setDesktopShowInvestorSelect\(false\);\s*setInvestorSearch\(""\);\s*\}\}/g,
  `onClick={(e) => {
    e.stopPropagation();
    if (isInvestorMultiSelect) {
      const isSelected = formData.investorIds.includes(i.id);
      setFormData({
        ...formData,
        investorIds: isSelected
          ? formData.investorIds.filter((id) => id !== i.id)
          : [...formData.investorIds, i.id],
      });
    } else {
      setFormData({
        ...formData,
        investorIds: [i.id],
      });
      setDesktopShowInvestorSelect(false);
      setInvestorSearch("");
    }
  }}`
);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
console.log("Patched multi select logic");
