const fs = require('fs');
let code = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

const regex = /\{filteredBusinesses\.map\(\(business, idx\) => \{([\s\S]*?)return \([\s\S]*?\}\)\}\s*\{filteredBusinesses\.length === 0/g;

const match = regex.exec(code);
if (match) {
  // we will replace the inline map with a useMemo block.
  // Wait, I can't easily parse the whole map block with regex if it has nested brackets.
  // Let's replace just the opening and closing.
}
