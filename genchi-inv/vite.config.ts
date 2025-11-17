import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/", // ⚠️ Cambiado a raíz para Netlify
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "https://genchi-bitacora-back.onrender.com", // tu backend en Render
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
