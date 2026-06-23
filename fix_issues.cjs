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

const replaceText = (content) => {
  return content
    .replace(/text-black fill-blue-500/g, 'text-white fill-blue-500')
    .replace(/bg-gray-900 text-black/g, 'bg-slate-900 text-white')
    .replace(/bg-blue-600 text-black/g, 'bg-blue-600 text-white')
    .replace(/bg-blue-100 text-blue-700/g, 'bg-blue-50 text-blue-700')
    .replace(/bg-blue-600 flex-shrink-0 text-black/g, 'bg-blue-600 flex-shrink-0 text-white')
    .replace(/bg-gray-900 p-6 rounded-xl text-black/g, 'bg-slate-900 p-6 rounded-xl text-white')
};

walk('./src', (err, results) => {
  if (err) throw err;
  results.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = replaceText(content);
    if (content !== newContent) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log('Fixed text in', file);
    }
  });
});
