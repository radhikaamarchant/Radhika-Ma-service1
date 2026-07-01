const fs = require('fs');
const content = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

const startStr = '        {showAddForm && (';
const endStr = '        className={`w-full bg-transparent border-t border-kite-border';

let startIdx = content.indexOf(startStr);
let endIdx = content.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
    let animEnd = content.lastIndexOf('      </AnimatePresence>', endIdx);
    if (animEnd !== -1) {
        endIdx = animEnd + '      </AnimatePresence>\n'.length;
        const replacement = fs.readFileSync('replacement.tsx', 'utf8');
        const newContent = content.slice(0, startIdx) + replacement + content.slice(endIdx);
        fs.writeFileSync('src/pages/Investments.tsx', newContent);
        console.log('Replaced successfully');
    } else {
        console.log('Could not find </AnimatePresence>');
    }
} else {
    console.log('Could not find boundaries');
}
