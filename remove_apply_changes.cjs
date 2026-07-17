const fs = require('fs');
let content = fs.readFileSync('src/utils/AppContext.tsx', 'utf8');

const startIdx = content.indexOf('  const applyChanges = <T extends { id?: string }>(currentList: T[], changes: any[]): T[] => {');
const endIdx = content.indexOf('  useEffect(() => {');

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + content.substring(endIdx);
  fs.writeFileSync('src/utils/AppContext.tsx', content);
  console.log("Removed applyChanges successfully!");
} else {
  console.log("Could not find blocks!");
}
