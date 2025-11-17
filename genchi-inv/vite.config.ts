import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/genchi-inv/", // <-- IMPORTANTE: apunta a la carpeta de GitHub Pages
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000", // URL de tu backend en local
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
