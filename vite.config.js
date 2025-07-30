import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 优化构建性能
    target: "esnext",
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          game: ["kaplay"],
          state: ["jotai"],
        },
      },
    },
  },
  server: {
    // 开发服务器优化
    hmr: {
      overlay: false,
    },
  },
  optimizeDeps: {
    // 预构建优化
    include: ["react", "react-dom", "kaplay", "jotai"],
  },
});
