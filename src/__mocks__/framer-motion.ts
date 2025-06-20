// Mock implementation of framer-motion for testing
import * as React from 'react';

// Simple mock function implementation
type MockFunction = {
  (): void;
  mockImplementation: (impl: () => void) => void;
  mockResolvedValue: (value: any) => MockFunction;
  mockResolvedValueOnce: (value: any) => MockFunction;
};

const createMockFn = (): MockFunction => {
  const fn = (() => {}) as MockFunction;
  fn.mockImplementation(() => {});
  fn.mockResolvedValue = () => fn;
  fn.mockResolvedValueOnce = () => fn;
  return fn;
};

// Define motion component props interface
interface MotionComponentProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  initial?: Record<string, unknown>;
  animate?: Record<string, unknown>;
  exit?: Record<string, unknown>;
  variants?: Record<string, unknown>;
  transition?: Record<string, unknown>;
  layout?: boolean | 'position' | 'size' | 'preserve-aspect';
  layoutId?: string;
  onViewportEnter?: () => void;
  onViewportLeave?: () => void;
  viewport?: Record<string, unknown>;
  'data-testid'?: string;
  style?: React.CSSProperties;
}

// Create a simple motion component factory
const motion = new Proxy(
  {},
  {
    get(_, key: string) {
      // Create a properly typed motion component
      const MotionComponent = React.forwardRef<HTMLElement, MotionComponentProps>(({
        children,
        initial,
        animate,
        exit,
        variants,
        transition,
        layout,
        layoutId,
        onViewportEnter,
        onViewportLeave,
        ...props
      }, ref) => {
        // Create a ref callback to handle both function and object refs
        const setRef = (node: HTMLElement | null) => {
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLElement | null>).current = node;
          }
        };

        // Handle viewport callbacks
        React.useEffect(() => {
          if (onViewportEnter) {
            onViewportEnter();
          }
          return () => {
            if (onViewportLeave) {
              onViewportLeave();
            }
          };
        }, [onViewportEnter, onViewportLeave]);

        return React.createElement(
          key || 'div',
          {
            ...props,
            ref: setRef,
            'data-testid': props['data-testid'] || 'motion-component',
            'data-initial': JSON.stringify(initial || {}),
            'data-animate': JSON.stringify(animate || {}),
            'data-exit': JSON.stringify(exit || {}),
            'data-layout': layout,
            'data-layout-id': layoutId,
            style: {
              ...(props.style || {}),
              '--motion-transition': JSON.stringify(transition || {}),
              '--motion-variants': JSON.stringify(variants || {}),
            } as React.CSSProperties,
          },
          children
        );
      });

      MotionComponent.displayName = `motion.${key}`;
      return MotionComponent;
    },
  }
);

// Mock AnimatePresence
interface AnimatePresenceProps {
  children: React.ReactNode | ((props: any) => React.ReactNode);
  onExitComplete?: () => void;
  [key: string]: any;
}

const AnimatePresence: React.FC<AnimatePresenceProps> = ({
  children,
  onExitComplete,
  ...props
}) => {
  React.useEffect(() => {
    return () => {
      onExitComplete?.();
    };
  }, [onExitComplete]);

  const childrenToRender = React.useMemo(() => {
    return typeof children === 'function' ? children({}) : children;
  }, [children]);

  return (
    <div 
      data-testid="animate-presence" 
      {...props}
    >
      {childrenToRender}
    </div>
  );
};

// Add display name for better debugging
AnimatePresence.displayName = 'AnimatePresence';

// Mock useAnimation hook
const useAnimation = () => ({
  controls: {
    start: createMockFn(),
    stop: createMockFn(),
  },
  start: createMockFn(),
  stop: createMockFn(),
  set: createMockFn(),
});

// Mock useInView hook
const useInView = () => ({
  ref: { current: null },
  inView: true,
  entry: null,
});

// Mock useReducedMotion hook
const useReducedMotion = () => false;

// Mock useScroll hook
const useScroll = () => ({
  scrollX: { current: 0 },
  scrollY: { current: 0 },
  scrollXProgress: { current: 0 },
  scrollYProgress: { current: 0 },
});

// Mock useTransform
const useTransform = <T,>(
  value: { get: () => number },
  inputRange: number[],
  outputRange: T[]
) => {
  return {
    get: () => outputRange[0],
    getVelocity: () => 0,
    isAnimating: () => false,
    on: () => ({}),
    set: createMockFn(),
    updateAndNotify: createMockFn(),
    clearListeners: createMockFn(),
    getPrevious: () => undefined,
    hasAnimated: { current: false },
    isActive: { current: false },
    key: 'mocked-transform',
    onAnimationComplete: createMockFn(),
    options: {},
    setWithVelocity: createMockFn(),
    start: createMockFn(),
    stop: createMockFn(),
    stopAnimation: createMockFn(),
    sync: createMockFn(),
  };
};

// Import actual framer-motion for type information
import * as ActualFramerMotion from 'framer-motion';

// Create a mock module that combines our mocks with the actual module
export const mockFramerMotion = {
  motion,
  AnimatePresence,
  useAnimation,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} as const;

// Export the mock module as the default export
export default mockFramerMotion as unknown as typeof ActualFramerMotion;
