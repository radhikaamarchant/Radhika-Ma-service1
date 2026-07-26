const fs = require('fs');
let code = fs.readFileSync('src/pages/Businesses.tsx', 'utf-8');

// Replace labels and inputs
const regex = /<label className="absolute left-3[^"]*">([\s\S]*?)<\/label>\s*(?:\{"\s*"\}\s*)?<input([\s\S]*?)\/>/g;
let replacedCount = 0;

code = code.replace(regex, (match, labelContent, inputAttrs) => {
    replacedCount++;
    return `<input${inputAttrs}/>\n                      <label className="absolute left-3 top-3.5 px-1 text-sm text-gray-500 transition-all duration-200 pointer-events-none peer-focus:-top-2.5 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-kite-bg md:dark:peer-focus:bg-[#181818] peer-focus:text-[#387ed1] peer-focus:z-20 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-kite-bg md:dark:peer-[:not(:placeholder-shown)]:bg-[#181818] peer-[:not(:placeholder-shown)]:z-20 uppercase tracking-wide font-medium">${labelContent}</label>`;
});

fs.writeFileSync('src/pages/Businesses.tsx', code);
console.log(`Replaced ${replacedCount} inputs.`);
