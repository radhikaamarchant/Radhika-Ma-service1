import fs from 'fs';

const code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf8');

let updatedCode = code.replace(
  `  const getTime = (id: string) => parseInt(id.replace(/\\D/g, "")) || 0;
  const activeBusinesses = state.businesses
    .filter((b: any) => b.status === "active" || b.status === "funded")
    .sort((a, b) => getTime(b.id) - getTime(a.id));`,
  `  const getTime = (id: string) => parseInt(id.replace(/\\D/g, "")) || 0;
  const activeBusinesses = [...state.businesses]
    .sort((a, b) => getTime(b.id) - getTime(a.id));`
);

updatedCode = updatedCode.replace(
  `                            <span className="truncate">{selectedInvestor ? selectedInvestor.name : "Select Investor"}</span>`,
  `                            <span className="truncate">{selectedInvestor ? selectedInvestor.name.toUpperCase() : "Select Investor"}</span>`
);

updatedCode = updatedCode.replace(
  `                                    <button key={b.id} onClick={() => { setFormData({ ...formData, businessId: b.id }); setDesktopShowBusinessSelect(false); }} className="w-full text-left px-3 py-2 text-[13px] text-gray-700 dark:text-[#C4C4C4] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] flex items-center justify-between">
                                      {b.name}
                                      {formData.businessId === b.id && <CheckCircle className="w-3.5 h-3.5 text-[#4184F3]" />}`,
  `                                    <button key={b.id} onClick={() => { setFormData({ ...formData, businessId: b.id }); setDesktopShowBusinessSelect(false); }} className="w-full text-left px-3 py-2 text-[13px] text-gray-700 dark:text-[#C4C4C4] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] flex items-center justify-between">
                                      {b.name.toUpperCase()}
                                      {formData.businessId === b.id && <CheckCircle className="w-3.5 h-3.5 text-[#4184F3]" />}`
);

updatedCode = updatedCode.replace(
  `                                    <button key={i.id} onClick={() => { setFormData({ ...formData, investorId: i.id }); setDesktopShowInvestorSelect(false); }} className="w-full text-left px-3 py-2 text-[13px] text-gray-700 dark:text-[#C4C4C4] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] flex items-center justify-between">
                                      {i.name}
                                      {formData.investorId === i.id && <CheckCircle className="w-3.5 h-3.5 text-[#4184F3]" />}`,
  `                                    <button key={i.id} onClick={() => { setFormData({ ...formData, investorId: i.id }); setDesktopShowInvestorSelect(false); }} className="w-full text-left px-3 py-2 text-[13px] text-gray-700 dark:text-[#C4C4C4] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] flex items-center justify-between">
                                      {i.name.toUpperCase()}
                                      {formData.investorId === i.id && <CheckCircle className="w-3.5 h-3.5 text-[#4184F3]" />}`
);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', updatedCode);
console.log("Success");
