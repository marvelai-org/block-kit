import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      '@vibing-ai/block-kit': resolve(__dirname, '../src/index.ts'),
    },
  },
  server: {
    port: 6006,
    strictPort: true,
  },
  build: {
    sourcemap: true,
  },
});
