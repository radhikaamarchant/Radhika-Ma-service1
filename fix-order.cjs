const fs = require('fs');
let code = fs.readFileSync('src/pages/Businesses.tsx', 'utf-8');

// Replace all labels then input/select blocks

const regex = /<label className="absolute left-3[^"]*">([\s\S]*?)<\/label>\s*<input([^>]*)\/>/g;
let replacedCount = 0;

code = code.replace(regex, (match, labelContent, inputAttrs) => {
    replacedCount++;
    return `<input${inputAttrs}/>\n                      <label className="absolute left-3 top-3.5 px-1 text-sm text-gray-500 transition-all duration-200 pointer-events-none peer-focus:-top-2.5 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-kite-bg md:dark:peer-focus:bg-[#181818] peer-focus:text-[#387ed1] peer-focus:z-20 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-kite-bg md:dark:peer-[:not(:placeholder-shown)]:bg-[#181818] peer-[:not(:placeholder-shown)]:z-20 uppercase tracking-wide font-medium">${labelContent}</label>`;
});

// Also replace `<label> ... </label> <div ... className="peer ..."` for Select Existing Owner
const selectRegex = /<label className="absolute left-3[^"]*">([\s\S]*?)<\/label>\s*(<div[^>]*className="peer[^>]*>[\s\S]*?<\/div>\s*\{showOwnerSelect)/g;
code = code.replace(selectRegex, (match, labelContent, rest) => {
    // Note: div doesn't support placeholder-shown, but we can just use the label. Wait, if it has a value, we can use a class.
    return `${rest}\n                      <label className="absolute left-3 -top-2.5 px-1 text-xs text-gray-500 transition-all duration-200 pointer-events-none bg-white dark:bg-kite-bg md:dark:bg-[#181818] text-[#387ed1] z-20 uppercase tracking-wide font-medium">${labelContent}</label>`;
});

// Also replace `<label> ... </label> <select ...`
const selectTagRegex = /<label className="absolute left-3[^"]*">([\s\S]*?)<\/label>\s*<select([\s\S]*?)<\/select>/g;
code = code.replace(selectTagRegex, (match, labelContent, selectContent) => {
    return `<select${selectContent}</select>\n                      <label className="absolute left-3 -top-2.5 px-1 text-xs text-gray-500 transition-all duration-200 pointer-events-none bg-white dark:bg-kite-bg md:dark:bg-[#181818] z-20 uppercase tracking-wide font-medium">${labelContent}</label>`;
});

fs.writeFileSync('src/pages/Businesses.tsx', code);
console.log(`Replaced ${replacedCount} inputs.`);
