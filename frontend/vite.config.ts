/**
 * Vite Configuration
 *
 * Enterprise-grade Vite configuration for LexiFlow frontend.
 * Optimized for Vite 7+ using Oxc and Lightning CSS.
 */

import { reactRouter } from "@react-router/dev/vite";
import path from "node:path";
import { defineConfig, loadEnv, type ConfigEnv, type UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths"; // 1. Add this to fix alias resolution

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    // Base path for assets - important for proper CSS/asset loading
    base: "/",

    // 1. Server & Preview: Consolidation
    server: {
      port: 3400,
      host: true,
      strictPort: true,
      hmr: process.env.CODESPACES
        ? {
            clientPort: 443,
            protocol: "wss",
          }
        : undefined,
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL || "http://0.0.0.0:3000",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
          // Suppress proxy errors when backend is offline
          configure: (proxy, _options) => {
            proxy.on("error", (err, _req, _res) => {
              // Silently handle connection refused errors (backend offline)
              if (err.code === "ECONNREFUSED") {
                return;
              }
              console.error("[vite] http proxy error:", err);
            });
          },
        },
        "/socket.io": {
          target: env.VITE_API_BASE_URL || "http://0.0.0.0:3000",
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },

    // 2. Plugins & Transformations
    plugins: [
      reactRouter({
        appDirectory: "src",
      }),
      tsconfigPaths(), // Automatically resolves all aliases from tsconfig.json
    ],

    // 3. Modern CSS Handling (Tailwind v3 Compatibility)
    css: {
      // PostCSS for Tailwind processing
      postcss: "./postcss.config.js",
      devSourcemap: mode === "development",
    },

    // 4. Global Constants
    define: {
      __APP_VERSION__: JSON.stringify(
        process.env.npm_package_version || "1.0.0"
      ),
    },

    // 5. Module Resolution (Now automated, but left here for edge cases)
    resolve: {
      alias: {
        // tsconfigPaths handles @/*, but we keep the root @ for safety
        "@": path.resolve(__dirname, "./src"),
      },
    },

    // 6. Production Build (Rolldown & Oxc Optimized)
    build: {
      target: "esnext",
      outDir: "dist",
      sourcemap: mode === "development",
      minify: mode === "production" ? "esbuild" : false,
      cssMinify: mode === "production" ? true : false, // Use esbuild for CSS minification
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react")) return "vendor-core";
              if (id.includes("recharts")) return "vendor-charts";
              if (id.includes("lucide")) return "vendor-ui";
              return "vendor-misc";
            }
          },
        },
      },
    },

    // 7. Dependency Optimization
    optimizeDeps: {
      include: ["react", "react-dom", "lucide-react"],
      // If aliases still fail pre-bundling, you can force exclude them here:
      // exclude: ['@providers']
    },
  };
});
