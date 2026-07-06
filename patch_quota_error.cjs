const fs = require('fs');
let content = fs.readFileSync('src/utils/AppContext.tsx', 'utf8');

const targetStr = `    const handleQuotaError = (error: any) => {
      console.error("Firestore error:", error);
    };`;

const newStr = `    const handleQuotaError = (error: any) => {
      console.error("Firestore error:", error);
      setState((s) => ({
        ...s,
        loading: false,
        error: "Firestore error: " + (error.message || "Quota exceeded. Please check billing or retry later.")
      }));
    };`;

if (content.includes('const handleQuotaError')) {
    content = content.replace(targetStr, newStr);
    fs.writeFileSync('src/utils/AppContext.tsx', content);
    console.log("Patched quota error handler");
}
