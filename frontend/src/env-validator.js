// env-validator.js — run this before any Firebase / Stripe init
const REQUIRED_ENV_VARS = [
  { key: "VITE_API_BASE_URL",                 hint: "Backend server URL (e.g. http://localhost:5000)" },
  { key: "VITE_FIREBASE_API_KEY",             hint: "Firebase API key" },
  { key: "VITE_FIREBASE_AUTH_DOMAIN",         hint: "Firebase auth domain (e.g. your-project.firebaseapp.com)" },
  { key: "VITE_FIREBASE_PROJECT_ID",          hint: "Firebase project ID" },
  { key: "VITE_FIREBASE_STORAGE_BUCKET",      hint: "Firebase storage bucket (e.g. your-project.appspot.com)" },
  { key: "VITE_FIREBASE_MESSAGING_SENDER_ID", hint: "Firebase messaging sender ID" },
  { key: "VITE_FIREBASE_APP_ID",              hint: "Firebase app ID" },
  { key: "VITE_STRIPE_PUBLISHABLE_KEY",       hint: "Stripe publishable key (starts with pk_)" },
];

const PLACEHOLDER_PATTERNS = [
  /^your_/i,
  /^your-/i,
  /^<.+>$/,
  /^placeholder/i,
  /^changeme/i,
  /^xxx/i,
];

function isPlaceholder(value) {
  return PLACEHOLDER_PATTERNS.some((re) => re.test(value.trim()));
}

const missing = [];
const invalid = [];

for (const { key, hint } of REQUIRED_ENV_VARS) {
  const value = import.meta.env[key];
  if (!value) {
    missing.push(key);
  } else if (isPlaceholder(value)) {
    invalid.push(`${key} still has a placeholder value — replace it with your real ${hint}`);
  }
}

let errorMessage = null;

if (missing.length > 0) {
  errorMessage = `[Config] Missing env variable(s) in .env: ${missing.join(", ")} — copy .env.example to .env and fill in the values.`;
} else if (invalid.length > 0) {
  errorMessage = `[Config] ${invalid[0]}`;
}

if (errorMessage) {
  // Print clearly in the terminal
  console.error("\n\x1b[31m" + errorMessage + "\x1b[0m\n");

  // Show in the browser instead of a blank/crashed page
  document.getElementById("root").innerHTML = `
    <div style="
      font-family: monospace;
      background: #1a1a1a;
      color: #ff4d4d;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      box-sizing: border-box;
    ">
      <div>
        <div style="font-size:1.1rem; font-weight:bold; margin-bottom:0.5rem;">Environment Setup Error</div>
        <div style="color:#fff;">${errorMessage}</div>
      </div>
    </div>
  `;

  // Stop the rest of the app from loading
  throw new Error(errorMessage);
}
