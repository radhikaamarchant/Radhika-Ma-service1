const fs = require('fs');

let appContext = fs.readFileSync('src/utils/AppContext.tsx', 'utf8');
appContext = appContext.replace(/console\.error\("Firestore error:", error\);/g, 'console.warn("Firestore error:", error.message);');
fs.writeFileSync('src/utils/AppContext.tsx', appContext);

let authWrapper = fs.readFileSync('src/components/AuthWrapper.tsx', 'utf8');
authWrapper = authWrapper.replace(/console\.error\("Firestore quota error in auth:", error\);/g, 'console.warn("Firestore quota error in auth:", error.message);');
authWrapper = authWrapper.replace(/console\.error\("Firestore quota error in login:", error\);/g, 'console.warn("Firestore quota error in login:", error.message);');
fs.writeFileSync('src/components/AuthWrapper.tsx', authWrapper);

console.log("Patched console.error to console.warn");
