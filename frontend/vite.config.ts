import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// In development every request that starts with /api is forwarded to the ASP.NET backend.
// The browser only talks to Vite, so there is no CORS problem and no certificate problem.
// Backend on another address? Set VITE_PROXY_TARGET in a .env file (see .env.example).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_PROXY_TARGET || "https://localhost:7085";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: target,
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});
