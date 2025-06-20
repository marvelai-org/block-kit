import type { Matchers } from 'vitest';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
  interface Assertion<T = unknown> 
    extends Matchers<void, T>,
      TestingLibraryMatchers<T, void> {}
}
