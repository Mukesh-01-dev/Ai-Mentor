import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keyPath = path.resolve(__dirname, "./serviceAccountKey.json");

let serviceAccount = null;
if (fs.existsSync(keyPath)) {
  try {
    serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
  } catch (error) {
    console.error("Failed to parse serviceAccountKey.json:", error);
  }
} else {
  console.warn(
    "WARNING: serviceAccountKey.json is missing in backend/config. Firebase admin features will not work."
  );
}

if (serviceAccount && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;