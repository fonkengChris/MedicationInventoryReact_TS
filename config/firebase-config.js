const admin = require("firebase-admin");
const path = require("path");

const serviceAccountPath =
  process.env.NODE_ENV === "development"
    ? path.join(
        __dirname,
        "medication-inventory-bf350-firebase-adminsdk-fbsvc-9d84adec39.json"
      )
    : process.env.FIREBASE_SERVICE_ACCOUNT;

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
