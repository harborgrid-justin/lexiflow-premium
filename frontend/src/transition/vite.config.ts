import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  root: ".",

  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
      "@/app": resolve(__dirname, "./app"),
      "@/platform": resolve(__dirname, "./platform"),
      "@/services": resolve(__dirname, "./services"),
      "@/features": resolve(__dirname, "./features"),
      "@/ui": resolve(__dirname, "./ui"),
      "@/lib": resolve(__dirname, "./lib"),
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
            "./platform/config/ConfigProvider",
            "./platform/theme/ThemeProvider",
            "./platform/i18n/I18nProvider",
          ],
          services: [
            "./services/identity/AuthProvider",
            "./services/session/SessionProvider",
            "./services/state/StateProvider",
            "./services/data/DataFetchingProvider",
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
