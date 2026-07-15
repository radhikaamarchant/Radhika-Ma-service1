const admin = require('firebase-admin');
const serviceAccount = require('./firebase-applet-config.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
async function run() {
  try {
    const snap = await db.collection('businesses').limit(1).get();
    console.log("Success! Docs:", snap.size);
  } catch(e) {
    console.error("Error:", e.message);
  }
}
run();
