import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import { resolve } from 'path';

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

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  core: {
    disableTelemetry: false,
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [stripUseClientPlugin()],
      resolve: {
        alias: {
          '@vibing-ai/block-kit': resolve(__dirname, '../../src'),
          '@': resolve(__dirname, '../../src'),
        },
      },
      build: {
        chunkSizeWarningLimit: 800, // Increase the chunk size warning limit
        rollupOptions: {
          output: {
            manualChunks: {
              // Split vendor chunks
              'vendor-react': ['react', 'react-dom'],
              'vendor-ui': [
                '@heroui/react',
                '@heroui/system',
                '@heroui/theme',
                'framer-motion'
              ],
              'vendor-charts': ['recharts'],
              'vendor-utils': ['usehooks-ts', '@iconify/react']
            }
          }
        }
      }
    });
  },
};

export default config; 