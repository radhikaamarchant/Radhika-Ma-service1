const fs = require('fs');
let code = fs.readFileSync('src/utils/AppContext.tsx', 'utf8');

code = code.replace(
  '        case "DELETE_USER":\n          await deleteDoc(doc(db, "users", action.payload));\n          break;',
  '        case "DELETE_USER":\n          await deleteDoc(doc(db, "users", action.payload));\n          break;\n        case "ADD_EMPLOYEE":\n          await setDoc(doc(db, "employees", action.payload.id), payloadWithTimestamp);\n          break;\n        case "UPDATE_EMPLOYEE":\n          await setDoc(doc(db, "employees", action.payload.id), payloadWithTimestamp);\n          break;\n        case "DELETE_EMPLOYEE":\n          await deleteDoc(doc(db, "employees", action.payload));\n          break;'
);

fs.writeFileSync('src/utils/AppContext.tsx', code);
