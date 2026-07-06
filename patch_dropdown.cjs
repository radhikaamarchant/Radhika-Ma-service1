const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

content = content.replace(
  'className="p-3 hover:bg-gray-50 cursor-pointer text-kite-text font-normal uppercase text-[13px] md:text-[14px]"',
  'className="p-3 hover:bg-gray-50 dark:hover:bg-[#202020] cursor-pointer text-kite-text font-normal uppercase text-[13px] md:text-[14px]"'
);

content = content.replace(
  /\{Array\.from\(\s*new Set\(state\.businesses\.map\(\(b\) => b\.ownerName\)\),\s*\)\s*\.filter\(\(name\) =>/g,
  `{Array.from(
                        new Set(state.businesses.map((b) => b.ownerName)),
                      )
                        .filter((name) => !state.investors.some((inv) => (inv.name || "").toLowerCase() === (name || "").toLowerCase()))
                        .filter((name) =>`
);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Patched dropdown");
