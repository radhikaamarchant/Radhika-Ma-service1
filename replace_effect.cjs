const fs = require('fs');
const content = fs.readFileSync('src/utils/AppContext.tsx', 'utf8');

const startIdx = content.indexOf('const applyChanges = <T extends { id?: string }>(currentList: T[], changes: any[]): T[] => {');
const endIdx = content.indexOf('}, []); // Only run once on mount') + '}, []); // Only run once on mount'.length;

const newBlock = `  useEffect(() => {
    let isMounted = true;
    
    const handleQuotaError = (error: any) => {
      console.warn("Firestore error:", error.message);
      if (isMounted) {
        setState((s) => ({
          ...s,
          loading: false,
          error: "Database daily limit reached! Please try again tomorrow.",
        }));
      }
    };

    const fetchInitialData = async () => {
      try {
        const [bizSnap, invSnap, invsSnap, settingsSnap] = await Promise.all([
          getDocs(collection(db, "businesses")),
          getDocs(collection(db, "investors")),
          getDocs(collection(db, "investments")),
          getDoc(doc(db, "settings", "global"))
        ]);

        if (!isMounted) return;

        setState((s) => ({
          ...s,
          businesses: bizSnap.docs.map((d) => d.data() as Business),
          investors: invSnap.docs.map((d) => d.data() as Investor),
          investments: invsSnap.docs.map((d) => d.data() as Investment),
          settings: settingsSnap.exists() ? (settingsSnap.data() as GlobalSettings) : s.settings,
          loading: false,
        }));
      } catch (err) {
        handleQuotaError(err);
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, []); // Only run once on mount`;

if (startIdx !== -1 && endIdx !== -1) {
  const newContent = content.substring(0, startIdx) + newBlock + content.substring(endIdx);
  fs.writeFileSync('src/utils/AppContext.tsx', newContent);
  console.log("Replaced successfully!");
} else {
  console.log("Could not find blocks!");
}
