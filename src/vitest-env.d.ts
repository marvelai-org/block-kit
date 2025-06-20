import type { Matchers } from 'vitest';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// Define custom matchers that extend the base matchers
type CustomMatchers = {
  // Example custom matcher:
  // toBeWithinRange(floor: number, ceiling: number): void;
  [key: string]: unknown;
};

type VitestMatchers<T = unknown> = 
  & Matchers<void, T>
  & TestingLibraryMatchers<T, void>
  & CustomMatchers;

type VitestAssertion<T = unknown> = VitestMatchers<T>;
type VitestAsymmetricMatchersContaining = Record<string, unknown>;

declare module 'vitest' {
  // Use type aliases instead of empty interfaces
  export type { VitestAssertion as Assertion };
  export type { VitestAsymmetricMatchersContaining as AsymmetricMatchersContaining };
}

declare global {
  namespace Vi {
    // Use type alias instead of empty interface
    type JestAssertion<T = unknown> = VitestMatchers<T>;
  }
}
