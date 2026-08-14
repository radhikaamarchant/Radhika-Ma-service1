const fs = require('fs');

let code = fs.readFileSync('src/utils/AppContext.tsx', 'utf8');

const regex = /        case "DELETE_USER":\s*await deleteDoc\(doc\(db, "users", action.payload\)\);\s*break;\s*case "ADD_EMPLOYEE":\s*await setDoc\(doc\(db, "employees", action.payload.id\), payloadWithTimestamp\);\s*break;\s*case "UPDATE_EMPLOYEE":\s*await setDoc\(doc\(db, "employees", action.payload.id\), payloadWithTimestamp\);\s*break;\s*case "DELETE_EMPLOYEE":\s*await deleteDoc\(doc\(db, "employees", action.payload\)\);\s*break;/;

code = code.replace(regex, `        case "DELETE_USER":
          newState.users = newState.users.filter((u) => u.id !== action.payload);
          break;`);

fs.writeFileSync('src/utils/AppContext.tsx', code);
