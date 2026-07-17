import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function count() {
  const collections = ["businesses", "investors", "investments", "settings", "transactions", "ipo", "users"];
  for (const coll of collections) {
    try {
      const snapshot = await getDocs(collection(db, coll));
      console.log(`${coll} = ${snapshot.size}`);
    } catch (e) {
      console.log(`${coll} = Error or 0 (${e.message})`);
    }
  }
  process.exit(0);
}

count();
