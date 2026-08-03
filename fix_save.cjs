const fs = require('fs');

let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

const targetStr = `  const handleSaveTaxPayer = () => {
    if (state.settings) {
      const updatedSettings = {
        ...state.settings,
        inactivityTax: taxPayerConfig
      };
      dispatch({ type: "UPDATE_SETTINGS", payload: updatedSettings });
      setCurrentView("menu");
    }
  };`;

const newStr = `  const [isSavingTax, setIsSavingTax] = useState(false);
  const handleSaveTaxPayer = async () => {
    if (state.settings) {
      setIsSavingTax(true);
      const updatedSettings = {
        ...state.settings,
        inactivityTax: taxPayerConfig
      };
      await dispatch({ type: "UPDATE_SETTINGS", payload: updatedSettings });
      setTimeout(() => {
        setIsSavingTax(false);
      }, 500);
    }
  };`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/pages/AdminPage.tsx', code);
  console.log("Updated handleSaveTaxPayer");
} else {
  console.error("Target string not found in handleSaveTaxPayer");
}
