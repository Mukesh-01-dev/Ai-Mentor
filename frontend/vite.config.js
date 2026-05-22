import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dns from "dns";

// Forces IPv4
dns.setDefaultResultOrder("verbatim");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [tailwindcss(), react()],
    server: {
      port: 5173,
      host: "127.0.0.1",
      strictPort: true,
      proxy: {
        "/api": {
          target: "http://127.0.0.1:5000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});