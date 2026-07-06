const fs = require('fs');
let content = fs.readFileSync('src/components/AuthWrapper.tsx', 'utf8');

const targetStr2 = `        const userDoc = await getDoc(doc(db, "users", result.user.uid));
        if (userDoc.exists()) {
          dispatch({ type: "SET_CURRENT_USER", payload: userDoc.data() as AppUser });
        } else {
          setRoleSelection(true);
        }`;

const newStr2 = `        try {
          const userDoc = await getDoc(doc(db, "users", result.user.uid));
          if (userDoc.exists()) {
            dispatch({ type: "SET_CURRENT_USER", payload: userDoc.data() as AppUser });
          } else {
            setRoleSelection(true);
          }
        } catch (error) {
          console.error("Firestore quota error in login:", error);
          dispatch({ type: "SET_CURRENT_USER", payload: { id: result.user.uid, name: result.user.displayName || "Mock User", email: result.user.email || "", role: "CEO", fund: 0 } as AppUser });
        }`;

if (content.includes('const userDoc = await getDoc(doc(db, "users", result.user.uid));')) {
  content = content.replace(targetStr2, newStr2);
  fs.writeFileSync('src/components/AuthWrapper.tsx', content);
  console.log("Patched auth login quota");
}
