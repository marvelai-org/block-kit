import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// Plugin to strip 'use client' directives
function stripUseClientPlugin() {
  return {
    name: 'strip-use-client',
    transform(code) {
      // Remove 'use client' directive from code
      if (code.includes('"use client"') || code.includes("'use client'")) {
        return code.replace(/"use client";?/g, '').replace(/'use client';?/g, '');
      }
      return code;
    }
  };
}

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
        ],
      },
    }),
    tsconfigPaths(),
    stripUseClientPlugin()
  ],
  resolve: {
    alias: {
      '@vibing-ai/block-kit': resolve(__dirname, './src'),
      '@': resolve(__dirname, './src'),
    },
  },
}); 