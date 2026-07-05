import fs from 'fs';

let content = fs.readFileSync('src/pages/Bids.tsx', 'utf8');

const regex = /\{activeTab === 'My Applications' \? \([\s\S]*?\) : \([\s\S]*?<div className="min-w-\[1000px\]">/m;

const replacement = `<div className="min-w-[1000px]">`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  
  // also need to clean up the trailing )} from the ternary.
  // We can just find the closing tags of the table container.
  
  const closingRegex = /\s*\)\}\s*<\/div>\s*<\/div>/m;
  // wait, let's just do a string replacement for the exact lines.
}

