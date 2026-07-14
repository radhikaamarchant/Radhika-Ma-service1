const fs = require('fs');
let code = fs.readFileSync('src/utils/AppContext.tsx', 'utf-8');

const changeHelper = `  const applyChanges = <T extends { id?: string }>(currentList: T[], changes: any[]): T[] => {
    let newList = [...currentList];
    changes.forEach((change) => {
      const data = change.doc.data() as T;
      const id = data.id || change.doc.id;
      if (change.type === "added") {
        const idx = newList.findIndex((item) => (item.id || (item as any).uid) === id);
        if (idx === -1) {
          newList.push(data);
        } else {
          newList[idx] = data;
        }
      }
      if (change.type === "modified") {
        newList = newList.map((item) => ((item.id || (item as any).uid) === id ? data : item));
      }
      if (change.type === "removed") {
        newList = newList.filter((item) => (item.id || (item as any).uid) !== id);
      }
    });
    return newList;
  };
`;

code = code.replace('useEffect(() => {', changeHelper + '\n  useEffect(() => {');

const oldBusinesses = `    const unsubBusinesses = onSnapshot(collection(db, "businesses"), (snap) => {
      setState((s) => ({
        ...s,
        businesses: snap.docs.map((d) => d.data() as Business),
        loading: false,
      }));
    }, handleQuotaError);`;

const newBusinesses = `    const unsubBusinesses = onSnapshot(collection(db, "businesses"), (snap) => {
      setState((s) => ({
        ...s,
        businesses: applyChanges(s.businesses, snap.docChanges()),
        loading: false,
      }));
    }, handleQuotaError);`;

code = code.replace(oldBusinesses, newBusinesses);

const oldInvestors = `    const unsubInvestors = onSnapshot(collection(db, "investors"), (snap) => {
      setState((s) => ({
        ...s,
        investors: snap.docs.map((d) => d.data() as Investor),
      }));
    }, handleQuotaError);`;

const newInvestors = `    const unsubInvestors = onSnapshot(collection(db, "investors"), (snap) => {
      setState((s) => ({
        ...s,
        investors: applyChanges(s.investors, snap.docChanges()),
      }));
    }, handleQuotaError);`;

code = code.replace(oldInvestors, newInvestors);

const oldInvestments = `    const unsubInvestments = onSnapshot(collection(db, "investments"), (snap) => {
      setState((s) => ({
        ...s,
        investments: snap.docs.map((d) => d.data() as Investment),
      }));
    }, handleQuotaError);`;

const newInvestments = `    const unsubInvestments = onSnapshot(collection(db, "investments"), (snap) => {
      setState((s) => ({
        ...s,
        investments: applyChanges(s.investments, snap.docChanges()),
      }));
    }, handleQuotaError);`;

code = code.replace(oldInvestments, newInvestments);

const oldUsers = `    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setState((s) => ({
        ...s,
        users: snap.docs.map((d) => d.data() as AppUser),
      }));
    }, handleQuotaError);`;

const newUsers = `    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setState((s) => ({
        ...s,
        users: applyChanges(s.users, snap.docChanges()),
      }));
    }, handleQuotaError);`;

code = code.replace(oldUsers, newUsers);

fs.writeFileSync('src/utils/AppContext.tsx', code);
