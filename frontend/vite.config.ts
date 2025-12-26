/**
 * Vite Configuration
 *
 * Enterprise-grade Vite configuration for LexiFlow frontend.
 * Includes optimizations for production builds and development experience.
 */

import path from 'path';
import { defineConfig, loadEnv, UserConfig, ConfigEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration factory
 * @param configEnv - Vite configuration environment (mode, command)
 * @returns Fully typed Vite configuration
 */
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  // Load environment variables with VITE_ prefix
  const env = loadEnv(mode, '.', '');

  // Validate critical environment variables
  if (!env.GEMINI_API_KEY && mode === 'production') {
    console.warn('GEMINI_API_KEY is not set - AI features may not work');
  }

  return {
    // Development server configuration
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: false,
      hmr: {
        clientPort: 443,
      },
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          rewrite: (path: string) => path.replace(/^\/api/, ''),
        },
      },
    },

    // Plugin configuration
    plugins: [
      react({
        // Include .tsx files
        include: '**/*.tsx',
      }),
    ],

    // Global constants definition
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    },

    // Module resolution configuration
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@types': path.resolve(__dirname, 'src/types'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@features': path.resolve(__dirname, 'src/features'),
        '@providers': path.resolve(__dirname, 'src/providers'),
        '@config': path.resolve(__dirname, 'src/config'),
        '@data': path.resolve(__dirname, 'src/api/data'),
        '@theme': path.resolve(__dirname, 'src/components/theme'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@api': path.resolve(__dirname, 'src/api'),
      },
    },

    // Production build configuration
    build: {
      target: 'esnext',
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor chunks for better caching
            'vendor-react': ['react', 'react-dom'],
            'vendor-ui': ['lucide-react'],
            // Group recharts separately as it's large
            'vendor-charts': ['recharts'],
          },
        },
      },
    },

    // Dependency optimization
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext',
      },
      include: ['react', 'react-dom', 'lucide-react'],
    },

    // Preview server configuration
    preview: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: false,
    },
  };
});
