import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// ─── Required environment variables ───────────────────────────────────────────
const REQUIRED_ENV_VARS = [
  { key: "VITE_API_BASE_URL",                 hint: "Backend server URL (e.g. http://localhost:5000)" },
  { key: "VITE_FIREBASE_API_KEY",             hint: "Firebase API key from your Firebase project settings" },
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

/** Vite plugin — validates env vars before the dev server or build starts. */
function envValidatorPlugin(requiredVars) {
  return {
    name: "vite-env-validator",
    // `config` hook runs early, receives the resolved env object
    config(_, { mode }) {
      const env = loadEnv(mode, process.cwd(), "");

      const missing = [];
      const placeholders = [];

      for (const { key, hint } of requiredVars) {
        const value = env[key];
        if (!value || value.trim() === "") {
          missing.push({ key, hint });
        } else if (PLACEHOLDER_PATTERNS.some((re) => re.test(value.trim()))) {
          placeholders.push({ key, hint });
        }
      }

      const RED   = "\x1b[31m";
      const YELLOW= "\x1b[33m";
      const BOLD  = "\x1b[1m";
      const RESET = "\x1b[0m";
      const DIM   = "\x1b[2m";

      if (missing.length > 0 || placeholders.length > 0) {
        process.stderr.write("\n");
        process.stderr.write(`${BOLD}${RED}══════════════════════════════════════════════════${RESET}\n`);
        process.stderr.write(`${BOLD}${RED}  ✖  Environment Variable Error — Frontend${RESET}\n`);
        process.stderr.write(`${BOLD}${RED}══════════════════════════════════════════════════${RESET}\n\n`);

        if (missing.length > 0) {
          process.stderr.write(`${BOLD}Missing variable${missing.length > 1 ? "s" : ""}:${RESET}\n`);
          for (const { key, hint } of missing) {
            process.stderr.write(`  ${RED}✖ ${BOLD}${key}${RESET}\n`);
            process.stderr.write(`    ${DIM}→ ${hint}${RESET}\n`);
          }
          process.stderr.write("\n");
        }

        if (placeholders.length > 0) {
          process.stderr.write(`${BOLD}${YELLOW}Placeholder value${placeholders.length > 1 ? "s" : ""} detected:${RESET}\n`);
          for (const { key, hint } of placeholders) {
            process.stderr.write(`  ${YELLOW}⚠ ${BOLD}${key}${RESET}${YELLOW} still has a placeholder value${RESET}\n`);
            process.stderr.write(`    ${DIM}→ Replace it with your real ${hint}${RESET}\n`);
          }
          process.stderr.write("\n");
        }

        process.stderr.write(`${DIM}How to fix:${RESET}\n`);
        process.stderr.write(`  ${DIM}1. Copy .env.example to .env  →  cp .env.example .env${RESET}\n`);
        process.stderr.write(`  ${DIM}2. Open .env and fill in every value listed above${RESET}\n`);
        process.stderr.write(`  ${DIM}3. Restart the dev server${RESET}\n\n`);

        process.stderr.write(`${BOLD}${RED}Aborting startup. Fix the variables above and try again.${RESET}\n\n`);

        process.exit(1); // ← stops Vite; nothing reaches the browser
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      envValidatorPlugin(REQUIRED_ENV_VARS), // must be first
      tailwindcss(),
      react(),
    ],
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
        },
      },
    },
  };
});