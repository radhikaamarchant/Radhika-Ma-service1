const fs = require('fs');

let code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

const targetOnClick = `                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (formData.investorIds.includes(i.id)) {
                                        setFormData({ ...formData, investorIds: formData.investorIds.filter(id => id !== i.id) });
                                      } else {
                                        setFormData({ ...formData, investorIds: [...formData.investorIds, i.id] });
                                      }
                                    }}`;

const newOnClick = `                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFormData({ ...formData, investorIds: [i.id] });
                                      setDesktopShowInvestorSelect(false);
                                      setInvestorSearch("");
                                    }}`;

if (code.includes(targetOnClick)) {
  code = code.replace(targetOnClick, newOnClick);
  fs.writeFileSync('src/components/AddInvestmentModal.tsx', code);
  console.log('Successfully updated to single select!');
} else {
  console.log('Target onClick not found.');
}
