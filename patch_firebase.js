const fs = require('fs');
let code = fs.readFileSync('src/utils/firebase.ts', 'utf8');

code = code.replace(
  'import { getFirestore } from "firebase/firestore";',
  'import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";'
);

code = code.replace(
  'export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);',
  `export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
}, (firebaseConfig as any).firestoreDatabaseId);`
);

fs.writeFileSync('src/utils/firebase.ts', code);
