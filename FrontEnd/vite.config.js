import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000", // Użyj 127.0.0.1 zamiast ::1
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""), // Usuwa prefix /api
      },
    },
  },
});
