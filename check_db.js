import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json"));
const app = initializeApp(config);
const db = initializeFirestore(app, {}, config.firestoreDatabaseId);

async function check() {
  const b = await getDocs(collection(db, "businesses"));
  console.log("businesses:", b.size);
  const i = await getDocs(collection(db, "investors"));
  console.log("investors:", i.size);
  const v = await getDocs(collection(db, "investments"));
  console.log("investments:", v.size);
  process.exit(0);
}
check();
