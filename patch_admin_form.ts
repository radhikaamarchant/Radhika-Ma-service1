import fs from 'fs';

let content = fs.readFileSync('src/pages/Bids.tsx', 'utf8');

const regex = /function AdminBidsView\(\{\s*ipos,\s*saveIpos,\s*commissions,\s*applications,\s*onClose\s*\}\s*:\s*any\)\s*\{([\s\S]*?)\}\nfunction DetailsModal/m;

const match = content.match(regex);
if (match) {
  let adminFuncBody = match[1];
  
  // Add state from useAppContext
  if (!adminFuncBody.includes('useAppContext')) {
    adminFuncBody = adminFuncBody.replace(
      'const [isCreating, setIsCreating] = useState(false);',
      'const { state } = useAppContext();\n  const [isCreating, setIsCreating] = useState(false);'
    );
  }

  // Update handleSave to be less strict or just keep it simple but allow 0
  adminFuncBody = adminFuncBody.replace(
    'if (!editingIpo.companyName || !editingIpo.priceBandMin || !editingIpo.status) return alert("Fill required fields");',
    'if (!editingIpo.companyName || editingIpo.priceBandMin === undefined || !editingIpo.status) return alert("Fill required fields");'
  );

  // Replace inputs with formatted amounts and company name with select
  adminFuncBody = adminFuncBody.replace(
    /<div>\s*<label className="block text-kite-text-light mb-1 text-\[11px\] uppercase">Company Name<\/label>\s*<input type="text"[^>]+>\s*<\/div>/,
    `<div>
            <label className="block text-kite-text-light mb-1 text-[11px] uppercase">Company Name</label>
            <input 
              type="text" 
              list="admin-businesses-list"
              className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" 
              value={editingIpo.companyName || ''} 
              onChange={e => setEditingIpo({...editingIpo, companyName: e.target.value.toUpperCase()})} 
              placeholder="Search business..."
            />
            <datalist id="admin-businesses-list">
              {state.businesses.map(b => (
                 <option key={b.id} value={b.shortName?.toUpperCase() || b.name.toUpperCase()} />
              ))}
            </datalist>
          </div>`
  );

  // Update Amount Inputs
  const inputRegex = /<input type="number" className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value=\{editingIpo\.([^ |]+) \|\| ''\} onChange=\{e => setEditingIpo\(\{\.\.\.editingIpo, \1: Number\(e\.target\.value\)\}\)\} \/>/g;
  
  adminFuncBody = adminFuncBody.replace(inputRegex, (match, field) => {
    return `<input 
               type="text" 
               className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" 
               value={editingIpo.${field} ? Number(editingIpo.${field}).toLocaleString('en-IN') : ''} 
               onChange={e => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setEditingIpo({...editingIpo, ${field}: raw ? parseInt(raw, 10) : '' as any});
               }} 
             />`;
  });

  const fullReplace = `function AdminBidsView({ ipos, saveIpos, commissions, applications, onClose }: any) {${adminFuncBody}}\nfunction DetailsModal`;
  
  content = content.replace(regex, fullReplace);
  fs.writeFileSync('src/pages/Bids.tsx', content);
  console.log("Admin form updated successfully.");
} else {
  console.log("Could not find AdminBidsView to replace");
}
