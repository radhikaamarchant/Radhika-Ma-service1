const fs = require('fs');
let content = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

if (!content.includes('const [isEditingDescription, setIsEditingDescription] = useState(false);')) {
  content = content.replace(
    /const \[formData, setFormData\] = useState\(\{/,
    `const [isEditingDescription, setIsEditingDescription] = useState(false);\n  const [formData, setFormData] = useState({`
  );
}

const targetTextarea = /<textarea\s*className="w-full border border-kite-border-hard rounded-md p-3 mt-1 bg-transparent text-\[14px\] md:text-\[15px\] font-normal text-kite-text focus:border-kite-blue outline-none resize-y min-h-\[150px\]"\s*value=\{formData\.description\}\s*onChange=\{\(e\) => setFormData\(\{\.\.\.formData, description: e\.target\.value\}\)\}\s*placeholder="Enter detailed description here\.\.\."\s*\/>/;

const newTextarea = `<textarea
               className={\`w-full border-b bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none transition-all duration-200 \${isEditingDescription ? 'border border-kite-border-hard rounded-md p-3 mt-1 resize-y min-h-[150px]' : 'border-kite-border-hard py-1.5 resize-none h-16'}\`}
               value={formData.description}
               onChange={(e) => setFormData({...formData, description: e.target.value})}
               onFocus={() => setIsEditingDescription(true)}
               onBlur={() => setIsEditingDescription(false)}
               placeholder={isEditingDescription ? "Enter detailed description here..." : "No description"}
             />`;

content = content.replace(targetTextarea, newTextarea);

fs.writeFileSync('src/components/BusinessDetail.tsx', content);
console.log("Patched description focus");
