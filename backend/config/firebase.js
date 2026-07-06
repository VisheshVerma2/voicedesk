const admin = require("firebase-admin");

let db;

function initFirebase() {
  if (admin.apps.length > 0) return admin.app();

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });

  db = admin.firestore();
  db.settings({ ignoreUndefinedProperties: true });
  console.log("✅ Firebase connected");
  return admin.app();
}

function getDb() {
  if (!db) initFirebase();
  return db;
}

module.exports = { initFirebase, getDb };
