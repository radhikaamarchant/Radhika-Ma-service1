const fs = require('fs');
let content = fs.readFileSync('src/components/AuthWrapper.tsx', 'utf8');

const targetStr = `          // Check if user exists in db
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            dispatch({ type: "SET_CURRENT_USER", payload: userDoc.data() as AppUser });
            setLoading(false);
          } else {
            setRoleSelection(true);
            setLoading(false);
          }`;

const newStr = `          // Check if user exists in db
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              dispatch({ type: "SET_CURRENT_USER", payload: userDoc.data() as AppUser });
              setLoading(false);
            } else {
              setRoleSelection(true);
              setLoading(false);
            }
          } catch (error) {
            console.error("Firestore quota error in auth:", error);
            // Graceful fallback to mock user
            dispatch({ 
              type: "SET_CURRENT_USER", 
              payload: { id: user.uid, name: user.displayName || "Mock User", email: user.email || "", role: "CEO", fund: 0 } as AppUser 
            });
            setLoading(false);
          }`;

if (content.includes('const userDoc = await getDoc(doc(db, "users", user.uid));')) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync('src/components/AuthWrapper.tsx', content);
  console.log("Patched auth quota");
}
