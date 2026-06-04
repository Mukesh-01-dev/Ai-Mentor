import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" with { type: "json" };

if (!admin.apps.length) {
  // Check if it's just the dummy/mock file we created
  if (serviceAccount.project_id === "mock-project" || !serviceAccount.private_key.includes("BEGIN PRIVATE KEY")) {
    console.warn("⚠️ Warning: Using dummy Firebase credentials. Firebase features will not work.");
    
    // Initialize with a mock application config to bypass local RSA key parsing
    admin.initializeApp({
      projectId: serviceAccount.project_id || "mock-project"
    });
  } else {
    // Initialize normally if a real service account key is present
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}

export default admin;