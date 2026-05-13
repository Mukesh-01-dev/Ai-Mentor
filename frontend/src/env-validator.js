
const REQUIRED_ENV_VARS = [
  { key: "VITE_API_BASE_URL",                 hint: "Backend server URL (e.g. http://localhost:5000)" },
  { key: "VITE_FIREBASE_API_KEY",             hint: "Firebase API key" },
  { key: "VITE_FIREBASE_AUTH_DOMAIN",         hint: "Firebase auth domain (e.g. your-project.firebaseapp.com)" },
  { key: "VITE_FIREBASE_PROJECT_ID",          hint: "Firebase project ID" },
  { key: "VITE_FIREBASE_STORAGE_BUCKET",      hint: "Firebase storage bucket (e.g. your-project.appspot.com)" },
  { key: "VITE_FIREBASE_MESSAGING_SENDER_ID", hint: "Firebase messaging sender ID" },
  { key: "VITE_FIREBASE_APP_ID",              hint: "Firebase app ID" },

];

const PLACEHOLDER_PATTERNS = [
  /^your_/i,
  /^your-/i,
  /^<.+>$/,
  /^placeholder/i,
  /^changeme/i,
  /^xxx/i,
];

const missing = [];
const placeholders = [];

for (const { key, hint } of REQUIRED_ENV_VARS) {
  const value = import.meta.env[key];
  if (!value || value.trim() === "") {
    missing.push(key);
  } else if (PLACEHOLDER_PATTERNS.some((re) => re.test(value.trim()))) {
    placeholders.push(`${key} (hint: ${hint})`);
  }
}

if (missing.length > 0) {
  // Throw — surfaces in terminal HMR output; nothing renders in the browser UI
  throw new Error(
    `[Env] Missing variable(s): ${missing.join(", ")}. ` +
    `Copy .env.example → .env, fill in the values, then restart the dev server.`
  );
}

if (placeholders.length > 0) {
  throw new Error(
    `[Env] Placeholder value(s) detected: ${placeholders.join("; ")}. ` +
    `Replace them with real credentials in your .env file.`
  );
}
