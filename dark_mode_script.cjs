const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(file => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

const replaceColors = (content) => {
  return content
    .replace(/\bbg-white\b/g, 'bg-[#1C212D]')
    .replace(/\bbg-gray-50\b/g, 'bg-[#0A0D14]')
    .replace(/\bbg-gray-100\b/g, 'bg-[#131722]')
    .replace(/\bbg-gray-200\b/g, 'bg-[#2A2E39]')
    .replace(/\bborder-gray-100\b/g, 'border-[#2A2E39]')
    .replace(/\bborder-gray-200\b/g, 'border-[#2A2E39]')
    .replace(/\btext-black\b/g, 'text-white')
    .replace(/\btext-gray-900\b/g, 'text-gray-100')
    .replace(/\btext-gray-800\b/g, 'text-gray-200')
    // subtle adjustments for inner cards
    .replace(/\bbg-blue-50\b/g, 'bg-blue-900/20')
    .replace(/\bborder-blue-100\b/g, 'border-blue-900/50')
    .replace(/\bbg-green-50\b/g, 'bg-green-900/20')
    .replace(/\bborder-green-100\b/g, 'border-green-900/50')
    .replace(/\bbg-amber-50\b/g, 'bg-amber-900/20')
    .replace(/\bborder-amber-100\b/g, 'border-amber-900/50')
    .replace(/\bbg-purple-50\b/g, 'bg-purple-900/20')
    .replace(/\bborder-purple-100\b/g, 'border-purple-900/50')
    .replace(/\bbg-red-50\b/g, 'bg-red-900/20')
    .replace(/\bborder-red-100\b/g, 'border-red-900/50');
};

walk('./src', (err, results) => {
  if (err) throw err;
  results.forEach(file => {
    // don't touch App.tsx and Sidebar.tsx as they are manually tweaked
    if (file.includes('App.tsx') || file.includes('Sidebar.tsx') || file.includes('index.css')) return;
    
    let content = fs.readFileSync(file, 'utf8');
    let newContent = replaceColors(content);
    if (content !== newContent) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log('Updated', file);
    }
  });
});
