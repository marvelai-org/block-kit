import React from 'react';
import type { Preview } from '@storybook/react';

// Add global styles or providers here if needed
const withThemeProvider = (Story: React.ComponentType, context: any) => {
  return (
    <React.StrictMode>
      <Story {...context} />
    </React.StrictMode>
  );
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    options: {
      storySort: {
        order: ['Introduction', 'Components', 'Blocks', '*'],
      },
    },
    // React 19 specific configuration
    react: {
      version: 'detect',
    },
  },
  decorators: [withThemeProvider],
  globalTypes: {
    // Add global types here if needed
  },
};

export default preview;
