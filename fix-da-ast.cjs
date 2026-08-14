const fs = require('fs');

let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');
const mapStr = `{businessesWithStats\n            .filter((b) =>\n              b.name.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||\n              b.ownerName.toLowerCase().includes(deferredSearchTerm.toLowerCase())\n            )\n            .map((b) => {`;
const mapStart = code.indexOf(mapStr);

if (mapStart !== -1) {
  let braces = 0;
  let mapEnd = -1;
  for (let i = mapStart + 1; i < code.length; i++) {
    if (code[i] === '{') braces++;
    if (code[i] === '}') {
      braces--;
      if (braces === 0) {
        mapEnd = i;
        break;
      }
    }
  }

  if (mapEnd !== -1) {
    // We capture the content inside the {} of the block
    const mapContent = code.substring(mapStart + 1, mapEnd + 1);
    
    // Replace trailing } with })
    let mapCleaned = mapContent.trim();
    if (mapCleaned.endsWith('}')) {
      // It's just `.map(b => { ... }` so we need `)` at the very end
      mapCleaned += ')';
    }

    const returnStart = code.lastIndexOf('  return (', mapStart);
    const memoBlock = `  const renderedSearchList = useMemo(() => {\n    return ${mapCleaned};\n  }, [businessesWithStats, deferredSearchTerm, isDesktop, onNavigate, state.investments, premiumBusiness]);\n\n`;
    
    code = code.substring(0, returnStart) + memoBlock + code.substring(returnStart, mapStart) + `{renderedSearchList}` + code.substring(mapEnd + 1);
    fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
  }
}

