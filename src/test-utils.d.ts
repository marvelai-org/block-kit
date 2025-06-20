// Type definitions for custom test matchers
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import type { Assertion } from 'vitest';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Vi {
    interface Assertion<T = unknown>
      extends Assertion<T>,
        TestingLibraryMatchers<T, void> {}
  }
}
