const fs = require('fs');
let content = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

const targetStr = /<textarea\s*className="w-full border-b border-kite-border-hard py-1\.5 bg-transparent text-\[14px\] md:text-\[15px\] font-normal text-kite-text focus:border-kite-blue outline-none resize-none h-16"\s*value=\{formData\.description\}\s*onChange=\{\(e\) => setFormData\(\{\.\.\.formData, description: e\.target\.value\}\)\}\s*\/>/;

const newStr = `<textarea
               className="w-full border border-kite-border-hard rounded-md p-3 mt-1 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none resize-y min-h-[150px]"
               value={formData.description}
               onChange={(e) => setFormData({...formData, description: e.target.value})}
               placeholder="Enter detailed description here..."
             />`;

content = content.replace(targetStr, newStr);

fs.writeFileSync('src/components/BusinessDetail.tsx', content);
console.log("Patched description textarea");
