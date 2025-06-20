/// <reference types="vite/client" />
/// <reference types="@testing-library/jest-dom" />

// Add type definitions for .svg imports
declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

// Add type definitions for CSS modules
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Add type definitions for CSS
declare module '*.css' {
  const content: string;
  export default content;
}

// Add type definitions for image files
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.webp' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

// Add type definitions for Vitest
/// <reference types="vitest/globals" />

// Add type definitions for React
/// <reference types="react" />
/// <reference types="react-dom" />

// Add type definitions for Storybook
/// <reference types="@storybook/react" />

// Add type definitions for testing-library
/// <reference types="@testing-library/react" />
/// <reference types="@testing-library/jest-dom" />
