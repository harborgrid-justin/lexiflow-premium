import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: env.VITE_API_BASE_URL || 'http://localhost:3000',
            changeOrigin: true,
            secure: false,
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@components': path.resolve(__dirname, './components'),
          '@context': path.resolve(__dirname, './context'),
          '@services': path.resolve(__dirname, './services'),
          '@types': path.resolve(__dirname, './types'),
          '@hooks': path.resolve(__dirname, './hooks'),
          '@utils': path.resolve(__dirname, './utils'),
          '@config': path.resolve(__dirname, './config'),
        }
      },
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom'],
      },
      build: {
        sourcemap: true,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom', 'react-router-dom'],
              ui: ['lucide-react', 'framer-motion'],
              charts: ['recharts'],
            },
          },
        },
      },
    };
});
