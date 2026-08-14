const fs = require('fs');

let code = fs.readFileSync('src/utils/AppContext.tsx', 'utf8');

// Add Employee to imports from types
code = code.replace(
  'import { Business, Investor, Investment, GlobalSettings, AppUser } from "../types";',
  'import { Business, Investor, Investment, GlobalSettings, AppUser, Employee } from "../types";'
);

// Add to AppState
code = code.replace(
  '  users: AppUser[];',
  '  users: AppUser[];\n  employees: Employee[];'
);

// Add to initialState
code = code.replace(
  '  users: [],',
  '  users: [],\n  employees: [],'
);

// Add Actions
code = code.replace(
  '  | { type: "CLEAR_ERROR" };',
  '  | { type: "CLEAR_ERROR" }\n  | { type: "ADD_EMPLOYEE"; payload: Employee }\n  | { type: "UPDATE_EMPLOYEE"; payload: Employee }\n  | { type: "DELETE_EMPLOYEE"; payload: string };'
);

// Add to listeners (onSnapshot)
const listenerCode = `    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      if (!isMounted) return;
      setState((s) => {
        const newUsers = applyChanges(s.users, snap.docChanges());
        if (s.users !== newUsers || !s.usersLoaded) {
          return { ...s, users: newUsers, usersLoaded: true };
        }
        return s;
      });
    }, handleQuotaError);

    const unsubEmployees = onSnapshot(collection(db, "employees"), (snap) => {
      if (!isMounted) return;
      setState((s) => {
        const newEmployees = applyChanges(s.employees || [], snap.docChanges());
        if (s.employees !== newEmployees) {
          return { ...s, employees: newEmployees };
        }
        return s;
      });
    }, handleQuotaError);`;

code = code.replace(
  /    const unsubUsers = onSnapshot\(collection\(db, "users"\)[\s\S]*?}, handleQuotaError\);/,
  listenerCode
);

// unsub in return
code = code.replace(
  '      unsubUsers();',
  '      unsubUsers();\n      unsubEmployees();'
);

// Add to Reducer (dispatch optimistic updates)
const reducerCode = `        case "DELETE_USER":
          newState.users = newState.users.filter((u) => u.id !== action.payload);
          break;
        case "ADD_EMPLOYEE":
          newState.employees = [...(newState.employees || []), action.payload];
          break;
        case "UPDATE_EMPLOYEE":
          newState.employees = (newState.employees || []).map((e) =>
            e.id === action.payload.id ? action.payload : e
          );
          break;
        case "DELETE_EMPLOYEE":
          newState.employees = (newState.employees || []).filter((e) => e.id !== action.payload);
          break;`;

code = code.replace(
  /        case "DELETE_USER":[\s\S]*?break;/,
  reducerCode
);

// Add to Firebase writing
const fbCode = `        case "DELETE_USER":
          await deleteDoc(doc(db, "users", action.payload));
          break;
        case "ADD_EMPLOYEE":
          await setDoc(doc(db, "employees", action.payload.id), payloadWithTimestamp);
          break;
        case "UPDATE_EMPLOYEE":
          await setDoc(doc(db, "employees", action.payload.id), payloadWithTimestamp);
          break;
        case "DELETE_EMPLOYEE":
          await deleteDoc(doc(db, "employees", action.payload));
          break;`;

code = code.replace(
  /        case "DELETE_USER":[\s\S]*?break;/,
  fbCode
);

fs.writeFileSync('src/utils/AppContext.tsx', code);
