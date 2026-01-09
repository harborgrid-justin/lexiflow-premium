import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
  },

  root: ".",

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@/app": resolve(__dirname, "./src/app"),
      "@/platform": resolve(__dirname, "./src/platform"),
      "@/services": resolve(__dirname, "./src/services"),
      "@/features": resolve(__dirname, "./src/features"),
      "@/ui": resolve(__dirname, "./src/ui"),
      "@/shared/lib": resolve(__dirname, "./src/lib"),
      "@/tests": resolve(__dirname, "./tests"),
    },
  },

  server: {
    port: 5174,
    host: true,
    strictPort: false,
    open: false,
    cors: true,
  },

  build: {
    outDir: "dist",
    sourcemap: true,
    minify: "esbuild",
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          platform: [
            "./src/platform/config/ConfigProvider",
            "./src/platform/theme/ThemeProvider",
            "./src/platform/i18n/I18nProvider",
          ],
          services: [
            "./src/services/identity/AuthProvider",
            "./src/services/session/SessionProvider",
            "./src/services/state/StateProvider",
            "./src/services/data/DataProvider",
          ],
        },
      },
    },
  },

  optimizeDeps: {
    include: ["react", "react-dom"],
  },

  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development"
    ),
  },
});
