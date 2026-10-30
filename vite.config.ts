import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "知识库",
        short_name: "知识库",
        description: "机器学习广度地图，以及液态与固态电芯材料参数如何互相影响。进度只存在本机。",
        lang: "zh-CN",
        display: "standalone",
        background_color: "#0f1210",
        theme_color: "#0f1210",
        start_url: "/",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webmanifest}"],
        navigateFallback: "index.html",
      },
    }),
  ],
  server: {
    port: 5173,
    open: true,
    allowedHosts: true,
  },
  preview: {
    allowedHosts: true,
  },
});
