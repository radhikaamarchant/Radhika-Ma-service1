import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('./src', (filePath) => {
  if (!filePath.endsWith('.tsx')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const replacements = [
    { from: /bg-\[#F8F9FA\](?! dark:)/g, to: 'bg-[#F8F9FA] dark:bg-kite-bg' },
    { from: /border-gray-200/g, to: 'border-kite-border-hard' },
    { from: /border-gray-100/g, to: 'border-kite-border-soft' },
    { from: /divide-gray-100/g, to: 'divide-kite-border-soft' },
    { from: /divide-gray-200/g, to: 'divide-kite-border-hard' },
  ];

  for (const { from, to } of replacements) {
    if (from.test(content)) {
      // Re-test to actually replace since regex state changes with /g
      content = content.replace(from, to);
      changed = true;
    }
  }

  // Handle bg-white (but make sure not to double add dark:bg-kite-surface)
  if (/bg-white(?! dark:bg-kite-surface)/.test(content)) {
      content = content.replace(/bg-white(?! dark:bg-kite-surface)(?! dark:bg-transparent)(?! dark:bg-kite-bg)/g, 'bg-white dark:bg-kite-surface');
      changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
  }
});
