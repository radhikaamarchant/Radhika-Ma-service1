const fs = require('fs');
let content = fs.readFileSync('src/utils/AppContext.tsx', 'utf8');

if (!content.includes('import { MOCK_BUSINESSES, MOCK_INVESTORS, MOCK_INVESTMENTS } from "./mockData";')) {
  content = content.replace('import { Business, Investor, Investment, GlobalSettings, AppUser } from "../types";',
    'import { Business, Investor, Investment, GlobalSettings, AppUser } from "../types";\nimport { MOCK_BUSINESSES, MOCK_INVESTORS, MOCK_INVESTMENTS } from "./mockData";');
}

const targetStr = `    const handleQuotaError = (error: any) => {
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

const newStr = `    const handleQuotaError = (error: any) => {
      console.error("Firestore error:", error);
      setState((s) => ({
        ...s,
        businesses: s.businesses.length ? s.businesses : MOCK_BUSINESSES,
        investors: s.investors.length ? s.investors : MOCK_INVESTORS,
        investments: s.investments.length ? s.investments : MOCK_INVESTMENTS,
        loading: false,
        error: "Firestore quota exceeded. Switched to offline mock data mode.",
      }));
    };`;

if (content.includes('import("./mockData")')) {
    content = content.replace(targetStr, newStr);
    fs.writeFileSync('src/utils/AppContext.tsx', content);
    console.log("Patched quota error handler to use static import");
}

