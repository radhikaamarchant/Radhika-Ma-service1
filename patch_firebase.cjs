const fs = require('fs');
let code = fs.readFileSync('src/utils/firebase.ts', 'utf8');

code = code.replace(
  `export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
});`,
  `export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
}, (firebaseConfig as any).firestoreDatabaseId);`
);

fs.writeFileSync('src/utils/firebase.ts', code);
