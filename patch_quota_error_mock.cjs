const fs = require('fs');
let content = fs.readFileSync('src/utils/AppContext.tsx', 'utf8');

const targetStr = `    const handleQuotaError = (error: any) => {
      console.error("Firestore error:", error);
      setState((s) => ({
        ...s,
        loading: false,
        error: "Firestore error: " + (error.message || "Quota exceeded. Please check billing or retry later.")
      }));
    };`;

const newStr = `    const handleQuotaError = (error: any) => {
      console.error("Firestore error:", error);
      import("./mockData").then((mock) => {
        setState((s) => ({
          ...s,
          businesses: s.businesses.length ? s.businesses : mock.MOCK_BUSINESSES,
          investors: s.investors.length ? s.investors : mock.MOCK_INVESTORS,
          investments: s.investments.length ? s.investments : mock.MOCK_INVESTMENTS,
          loading: false,
          error: "Firestore quota exceeded. Switched to offline mock data mode.",
        }));
      });
    };`;

if (content.includes('const handleQuotaError')) {
    content = content.replace(targetStr, newStr);
    fs.writeFileSync('src/utils/AppContext.tsx', content);
    console.log("Patched quota error handler to load mock data");
}
