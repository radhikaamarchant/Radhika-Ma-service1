import fs from 'fs';
let code = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

code = code.replace(
  `    name: business?.name || "",`,
  `    name: business?.name || "",
    shortName: business?.shortName || "",`
);

code = code.replace(
  `        name: business.name || "",`,
  `        name: business.name || "",
        shortName: business.shortName || "",`
);

code = code.replace(
  `        name: formData.name,`,
  `        name: formData.name,
        shortName: formData.shortName ? formData.shortName.toUpperCase() : "",`
);

code = code.replace(
  `           <div>
             <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">Business Name</label>
             <input
               type="text"
               className="w-full border-b border-kite-border-hard py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none"
               value={formData.name}
               onChange={(e) => setFormData({...formData, name: e.target.value})}
             />
           </div>`,
  `           <div>
             <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">Business Name</label>
             <input
               type="text"
               className="w-full border-b border-kite-border-hard py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none"
               value={formData.name}
               onChange={(e) => setFormData({...formData, name: e.target.value})}
             />
           </div>
           <div>
             <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">Short Business Name</label>
             <input
               type="text"
               className="w-full border-b border-kite-border-hard py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none uppercase"
               value={formData.shortName}
               onChange={(e) => setFormData({...formData, shortName: e.target.value})}
               placeholder="e.g. ACME"
             />
           </div>`
);

fs.writeFileSync('src/components/BusinessDetail.tsx', code);
console.log("Success BusinessDetail Patch");
