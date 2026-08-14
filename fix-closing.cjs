const fs = require('fs');

function fixTrailingParenthesis(filePath, varName) {
  let code = fs.readFileSync(filePath, 'utf8');
  // It looks like `{rendered_filteredBusinesses})}` or `{rendered_filteredBusinesses})}{" "`
  const regex = new RegExp(`\\{${varName}\\}\\)\\}`, 'g');
  code = code.replace(regex, `{${varName}}`);
  
  // also check for {rendered_X})} {" "}
  const regex2 = new RegExp(`\\{${varName}\\}\\)\\}(\\{" "\\}|\\s|")`, 'g');
  code = code.replace(regex2, `{${varName}}$1`);
  
  fs.writeFileSync(filePath, code);
}

fixTrailingParenthesis('src/pages/Businesses.tsx', 'rendered_filteredBusinesses');
fixTrailingParenthesis('src/pages/Investors.tsx', 'rendered_filteredInvestors');
fixTrailingParenthesis('src/pages/DataAnalysis.tsx', 'renderedSearchList');

