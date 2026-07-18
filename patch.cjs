const fs = require('fs');
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

const targetStart = `        <div className="flex flex-col pb-16">`;
const targetEndStr = `      </div>{""}\n      <AnimatePresence>\n      {/* Details Modal */}`;

const startIdx = code.indexOf(targetStart);
const endIdx = code.indexOf(targetEndStr);

if (startIdx !== -1 && endIdx !== -1) {
  const codeToWrap = code.substring(startIdx, endIdx + `      </div>{""}\n`.length);
  const wrappedCode = `        {renderedList}\n`;
  
  code = code.substring(0, startIdx) + wrappedCode + code.substring(endIdx + `      </div>{""}\n`.length);
  fs.writeFileSync('src/pages/Investments.tsx', code);
  console.log('Successfully applied renderedList');
} else {
  console.log('Could not find target strings');
  console.log('startIdx:', startIdx);
  console.log('endIdx:', endIdx);
}
