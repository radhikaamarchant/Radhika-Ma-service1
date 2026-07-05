const fs = require('fs');
let content = fs.readFileSync('src/pages/Businesses.tsx', 'utf-8');

const target = `                </button>{" "}
                <div className="w-full flex justify-start pt-1 md:pt-2">`;

const replacement = `                </button>{" "}
                  </div>{" "}
                  {/* Search Container (Bottom on mobile, right on desktop) */}{" "}
                  <div className="w-full md:w-auto flex items-center justify-start md:justify-end pt-1 md:pt-0 h-[36px]">`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/pages/Businesses.tsx', content);
  console.log('Fixed Businesses.tsx part 2');
} else {
  console.log('Could not find target in Businesses.tsx part 2');
}
