const fs = require('fs');
let content = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

// 1. Change tracking-widest to tracking-normal in the menu header
content = content.replace(
  /<p className="text-\[12px\] md:text-\[13px\] text-kite-text-light tracking-widest">\{business\.ownerName \|\| "Owner Name"\}<\/p>/g,
  '<p className="text-[12px] md:text-[13px] text-kite-text-light tracking-normal">{business.ownerName || "Owner Name"}</p>'
);

// 2. Add Business Owner Name directly below Business Name in the profile view
const businessNameInputBlock = `           <div>
             <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">Business Name</label>
             <input
               type="text"
               className="w-full border-b border-kite-border-hard py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none"
               value={formData.name}
               onChange={(e) => setFormData({...formData, name: e.target.value})}
             />
           </div>`;

const newOwnerNameBlock = `
           <div>
             <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">Business Owner Name</label>
             <div className="w-full py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text tracking-normal">
               {business.ownerName}
             </div>
           </div>`;

if (!content.includes('>Business Owner Name</label>')) {
  content = content.replace(businessNameInputBlock, businessNameInputBlock + newOwnerNameBlock);
}

fs.writeFileSync('src/components/BusinessDetail.tsx', content);
console.log("Patched owner name");
