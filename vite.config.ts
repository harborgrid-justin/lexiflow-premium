import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@types': path.resolve(__dirname, 'types'),
          '@utils': path.resolve(__dirname, 'utils'),
          '@hooks': path.resolve(__dirname, 'hooks'),
          '@components': path.resolve(__dirname, 'components'),
          '@context': path.resolve(__dirname, 'context'),
          '@config': path.resolve(__dirname, 'config'),
          '@data': path.resolve(__dirname, 'data'),
          '@theme': path.resolve(__dirname, 'theme'),
          '@services': path.resolve(__dirname, 'services'),
          '@constants': path.resolve(__dirname, 'constants'),
        }
      }
    };
});
