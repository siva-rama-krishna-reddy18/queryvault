import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Proxy all /api calls to FastAPI to avoid CORS issues in development
      "/ingest": "http://localhost:8000",
      "/chat": "http://localhost:8000",
      "/sources": "http://localhost:8000",
    },
  },
});