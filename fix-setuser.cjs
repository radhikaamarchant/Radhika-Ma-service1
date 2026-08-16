const fs = require('fs');
let code = fs.readFileSync('src/utils/AppContext.tsx', 'utf8');

code = code.replace(/case "SET_CURRENT_USER":\s*if \(action\.payload\) \{\s*await setDoc\(doc\(db, "users", action\.payload\.id\), action\.payload\);\s*\}\s*break;/, `case "SET_CURRENT_USER":
          // Removed redundant write to Firestore on login
          break;`);

fs.writeFileSync('src/utils/AppContext.tsx', code);
