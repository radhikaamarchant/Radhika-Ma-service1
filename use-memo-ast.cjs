const fs = require('fs');

function applyUseMemoToMap(filePath, searchMarker, arrayName, mappedVar, depsStr) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  const mapStr = `{${arrayName}.map((${mappedVar}, idx) => {`;
  const mapStart = code.indexOf(mapStr);
  
  if (mapStart === -1) {
    console.log("Could not find map string in", filePath);
    return;
  }
  
  // Find the end of the map block
  let braces = 0;
  let mapEnd = -1;
  let inString = false;
  let stringChar = '';
  
  for (let i = mapStart + 1; i < code.length; i++) {
    const char = code[i];
    
    // basic string handling to avoid braces in strings
    if ((char === '"' || char === "'" || char === "`") && code[i-1] !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }
    
    if (!inString) {
      if (char === '{') braces++;
      if (char === '}') {
        braces--;
        if (braces === 0) {
          mapEnd = i;
          break;
        }
      }
    }
  }
  
  if (mapEnd !== -1) {
    const mapContent = code.substring(mapStart + 1, mapEnd + 1); // get the `array.map(...)` part without the curly braces
    
    const returnStart = code.lastIndexOf('  return (', mapStart);
    if (returnStart === -1) return console.log("Could not find return");
    
    const memoBlock = `  const rendered_${arrayName} = useMemo(() => {\n    return ${mapContent};\n  }, [${depsStr}]);\n\n`;
    
    // Insert memo block right before the return statement
    code = code.substring(0, returnStart) + memoBlock + code.substring(returnStart, mapStart) + `{rendered_${arrayName}}` + code.substring(mapEnd + 1);
    
    fs.writeFileSync(filePath, code);
    console.log("Successfully patched", filePath);
  } else {
    console.log("Could not find end of map block for", filePath);
  }
}

// Businesses.tsx
applyUseMemoToMap(
  'src/pages/Businesses.tsx',
  'filteredBusinesses.map',
  'filteredBusinesses',
  'business',
  'filteredBusinesses, businessStatsMap, state.investments, expandedBusinessId'
);

// Investors.tsx
applyUseMemoToMap(
  'src/pages/Investors.tsx',
  'filteredInvestors.map',
  'filteredInvestors',
  'investor',
  'filteredInvestors, selectedPreviewInvestor, previewHistory'
);

