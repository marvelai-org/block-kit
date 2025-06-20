// jest-dom adds custom jest matchers for DOM assertions
// learn more: https://github.com/testing-library/jest-dom
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Extend globalThis type for vi
declare global {
  // eslint-disable-next-line no-var
  var vi: {
    fn: <T extends (...args: any[]) => any>(fn: T) => T;
    clearAllMocks: () => void;
    resetAllMocks: () => void;
    mockImplementation: (fn: any) => any;
    mockReturnValue: (value: any) => any;
    mock: (module: any) => any;
  };
}

// Mock vi globally for Vitest
if (!globalThis.vi) {
  globalThis.vi = {
    fn: (fn: any) => fn,
    clearAllMocks: () => {},
    resetAllMocks: () => {},
    mockImplementation: (fn: any) => fn,
    mockReturnValue: (value: any) => value,
    mock: (fn: any) => fn,
  };
}

// Add type for IS_REACT_ACT_ENVIRONMENT
declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean;
  
  // Extend Window interface to include our mocks
  interface Window {
    ResizeObserver: typeof ResizeObserver;
  }
}

// Set up React testing environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Mock window.matchMedia
const mockMatchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(() => {}),
  removeListener: vi.fn(() => {}),
  addEventListener: vi.fn((_event: string, _listener: EventListenerOrEventListenerObject, _options?: boolean | AddEventListenerOptions) => {}),
  removeEventListener: vi.fn((_event: string, _listener: EventListenerOrEventListenerObject, _options?: boolean | EventListenerOptions) => {}),
  dispatchEvent: vi.fn((_event: Event) => true),
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  
  constructor(private callback: IntersectionObserverCallback) {}
  
  observe(target: Element) {
    // Immediately invoke callback with the target being visible
    this.callback([{
      isIntersecting: true,
      target,
      time: 0,
      intersectionRatio: 1,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
    } as IntersectionObserverEntry], this);
  }
  
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock matchMedia for Framer Motion - removed duplicate implementation

// Mock requestAnimationFrame
const requestAnimationFrame = (callback: FrameRequestCallback) => {
  return window.setTimeout(callback, 0);
};

const cancelAnimationFrame = (id: number) => {
  window.clearTimeout(id);
};

Object.defineProperty(window, 'requestAnimationFrame', {
  value: requestAnimationFrame,
  writable: true,
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  value: cancelAnimationFrame,
  writable: true,
});

// Mock ResizeObserver
type ResizeObserverCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => void;

class ResizeObserverMock {
  constructor(public callback: ResizeObserverCallback) {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverMock,
});

// Mock scrollIntoView
if (typeof window !== 'undefined' && window.HTMLElement) {
  window.HTMLElement.prototype.scrollIntoView = vi.fn((_options?: boolean | ScrollIntoViewOptions) => {});
}

// Define test cleanup function
const cleanupTest = () => {
  cleanup();
  vi.clearAllMocks();
  vi.resetAllMocks();
};

// Export for use in test files
export { cleanupTest };

// Setup global test environment
if (typeof afterEach === 'function') {
  afterEach(cleanupTest);
} else {
  // Fallback for environments where afterEach is not available
  // This will be handled by the test runner
  const afterEach = (fn: () => void) => {
    // This is a no-op in the global scope, will be used by test runners
    return fn;
  };
  afterEach(cleanupTest);
}