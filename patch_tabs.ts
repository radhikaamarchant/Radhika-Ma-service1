import fs from 'fs';
let content = fs.readFileSync('src/index.css', 'utf8');

const regex = /  \.dark \\.text-\\\\\\[15px\\\\\\]\\.md\\\\:text-\\\\\\[16px\\\\\\]\\.font-medium \{/;
content = content.replace(regex, `  .dark .text-\\[15px\\].md\\:text-\\[16px\\].font-medium,\n  .dark button.h-\\[44px\\] span.text-\\[15px\\] {`);

fs.writeFileSync('src/index.css', content);
console.log("Patched tabs");
