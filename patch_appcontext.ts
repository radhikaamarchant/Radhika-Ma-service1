import fs from 'fs';

let content = fs.readFileSync('src/utils/AppContext.tsx', 'utf8');

content = content.replace(
  `        case "DELETE_BUSINESS":
          await deleteDoc(doc(db, "businesses", action.payload));
          state.investments
            .filter((i) => i.businessId === action.payload)
            .forEach(async (inv) => {
              await deleteDoc(doc(db, "investments", inv.id));
            });
          break;`,
  `        case "DELETE_BUSINESS": {
          const bizInvestments = state.investments.filter((i) => i.businessId === action.payload);
          await Promise.all(bizInvestments.map((inv) => deleteDoc(doc(db, "investments", inv.id))));
          await deleteDoc(doc(db, "businesses", action.payload));
          break;
        }`
);

content = content.replace(
  `        case "DELETE_INVESTOR":
          await deleteDoc(doc(db, "investors", action.payload));
          state.investments
            .filter((i) => i.investorId === action.payload)
            .forEach(async (inv) => {
              await deleteDoc(doc(db, "investments", inv.id));
            });
          break;`,
  `        case "DELETE_INVESTOR": {
          const invInvestments = state.investments.filter((i) => i.investorId === action.payload);
          await Promise.all(invInvestments.map((inv) => deleteDoc(doc(db, "investments", inv.id))));
          await deleteDoc(doc(db, "investors", action.payload));
          break;
        }`
);

fs.writeFileSync('src/utils/AppContext.tsx', content);
console.log("Success AppContext Patch");
