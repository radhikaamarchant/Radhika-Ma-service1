const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

const targetStr = `      const updatedSettings = {
        ...state.settings,
        inactivityTax: taxPayerConfig
      };`;

const newStr = `      const updatedSettings = {
        ...state.settings,
        inactivityTax: {
          ...(state.settings.inactivityTax || {}),
          ...taxPayerConfig
        }
      };`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/pages/AdminPage.tsx', code);
  console.log("Fixed handleSaveTaxPayer map destruction");
} else {
  console.error("Target string not found for taxPayerConfig");
}
