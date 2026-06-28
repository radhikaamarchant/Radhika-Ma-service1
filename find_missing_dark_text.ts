import fs from 'fs';
const content = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('text-') && !line.includes('dark:text') && !line.includes('text-white')) {
    console.log(`Line ${i + 1}: ${line.trim()}`);
  }
});
