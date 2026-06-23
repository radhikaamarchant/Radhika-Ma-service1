import fs from 'fs';
let content = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

content = content.replace(/\? "text-amber-500 flex-shrink-0" : "text-amber-600 flex-shrink-0"\} \/>/g, '? "text-amber-500 flex-shrink-0" : "text-amber-600 flex-shrink-0"}`} />');

// Let's also find others by regex matching the exact broken pattern:
content = content.replace(/className=\{\`([^\`]+)\} \/>/g, 'className={`$1}`} />');

fs.writeFileSync('src/pages/DataAnalysis.tsx', content, 'utf8');

const files = fs.readdirSync('src/pages').map(f => 'src/pages/' + f).concat(fs.readdirSync('src/components').map(f => 'src/components/' + f)).concat(['src/App.tsx']);

for (const filepath of files) {
  if (!filepath.endsWith('.tsx')) continue;
  let text = fs.readFileSync(filepath, 'utf8');
  let newText = text.replace(/className=\{\`([^\`]+)\} \/>/g, 'className={`$1}`} />');
  if (text !== newText) {
     console.log('Fixed backticks in', filepath);
     fs.writeFileSync(filepath, newText, 'utf8');
  }
}

