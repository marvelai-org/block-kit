import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    global: 'window',
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, '../src'),
      },
      {
        find: '@vibing-ai/block-kit',
        replacement: path.resolve(__dirname, '../src'),
      },
    ],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@storybook/addon-essentials',
      '@storybook/addon-links',
      '@storybook/addon-interactions',
      '@storybook/api',
      'storybook/internal/components',
      'storybook/preview-api',
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  server: {
    fs: {
      allow: [
        path.resolve(__dirname, '../'),
      ],
    },
  },
});
