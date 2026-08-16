const fs = require('fs');
let code = fs.readFileSync('src/utils/firebase.ts', 'utf8');

// Replace initializeFirestore with getFirestore
code = code.replace(/import \{ getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager \} from "firebase\/firestore";/, 'import { getFirestore } from "firebase/firestore";');

code = code.replace(/export const db = initializeFirestore\(app, \{\s*localCache: persistentLocalCache\(\{ tabManager: persistentMultipleTabManager\(\) \}\)\s*\}, \(firebaseConfig as any\)\.firestoreDatabaseId\);/, 'export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);');

fs.writeFileSync('src/utils/firebase.ts', code);
