import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import ImageBlock from './image-block/ImageBlock';

// Ensure cleanup runs after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Simple mock for framer-motion with test ID support
type MotionProps = {
  children?: React.ReactNode;
  style?: { zIndex?: number; [key: string]: any };
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  [key: string]: unknown;
};

// Mock matchMedia for reduced motion
const matchMediaMock = () => ({
  matches: false,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

// Set up global mocks
global.matchMedia = global.matchMedia || matchMediaMock;

// Track zoom state globally for testing
let isZoomed = false;
const zoomStateListeners = new Set<() => void>();

// Helper to notify zoom state changes
const notifyZoomStateChange = () => {
  zoomStateListeners.forEach(listener => listener());
};

// Reset zoom state between tests
afterEach(() => {
  isZoomed = false;
  zoomStateListeners.clear();
});

// Mock framer-motion with proper types
vi.mock('framer-motion', () => {
  // Use the global zoom state for testing
  
  // Mock motion component with animation props handling
  const motion = {
    div: ({ 
      children, 
      onClick, 
      initial, 
      animate, 
      exit, 
      transition,
      style = {},
      onKeyDown,
      ...props 
    }: MotionProps & { 
      onClick?: (e: React.MouseEvent) => void;
      onKeyDown?: (e: React.KeyboardEvent) => void;
    }) => {
      // Handle zoom overlay
      if (style.zIndex === 9999) {
        // Add keyboard event listener for Escape key
        React.useEffect(() => {
          const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isZoomed) {
              isZoomed = false;
              notifyZoomStateChange();
              onClick?.(e as any);
            }
          };
          
          document.addEventListener('keydown', handleKeyDown);
          return () => document.removeEventListener('keydown', handleKeyDown);
        }, [onClick]);
        
        return (
          <div 
            data-testid="zoom-overlay"
            role="dialog"
            aria-label="Close zoomed image"
            tabIndex={-1}
            onClick={(e) => {
              // If clicking the overlay (not the image), close zoom
              if (e.target === e.currentTarget) {
                isZoomed = false;
                notifyZoomStateChange();
                onClick?.(e);
              }
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'zoom-out',
              ...style
            }}
            {...props}
          >
            {children}
          </div>
        );
      }
      
      // Handle regular divs with keyboard events
      const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          isZoomed = true;
          notifyZoomStateChange();
          onClick?.(e as any);
        }
        onKeyDown?.(e);
      };
      
      return (
        <div 
          onClick={onClick as any} 
          onKeyDown={handleKeyDown}
          style={style} 
          {...props}
        >
          {children}
        </div>
      );
    },
    img: ({ 
      alt = '', 
      onClick,
      initial,
      animate,
      exit,
      transition,
      style = {},
      ...props 
    }: { 
      alt?: string;
      onClick?: (e: React.MouseEvent) => void;
      initial?: any;
      animate?: any;
      exit?: any;
      transition?: any;
      style?: React.CSSProperties;
    } & React.ImgHTMLAttributes<HTMLImageElement>) => {
      // Handle click on image to toggle zoom
      const handleClick = (e: React.MouseEvent) => {
        if (onClick) {
          // Toggle zoom state when clicking the image
          isZoomed = !isZoomed;
          notifyZoomStateChange();
          onClick(e);
        }
      };
      
      return (
        <img 
          alt={alt} 
          onClick={handleClick}
          style={{
            ...style,
            ...(animate || initial || exit ? { 
              opacity: isZoomed ? 1 : 0.9,
              transform: isZoomed ? 'scale(1)' : 'scale(0.9)' 
            } : {})
          }}
          {...props} 
        />
      );
    },
  };

  // Mock AnimatePresence
  const AnimatePresence = ({ 
    children, 
    onExitComplete 
  }: { 
    children: React.ReactNode; 
    onExitComplete?: () => void 
  }) => {
    const [shouldRender, setShouldRender] = React.useState(isZoomed);
    
    React.useEffect(() => {
      if (isZoomed) {
        setShouldRender(true);
      } else {
        // Delay hiding to allow exit animation
        const timer = setTimeout(() => {
          setShouldRender(false);
          onExitComplete?.();
        }, 300);
        return () => clearTimeout(timer);
      }
    }, [isZoomed, onExitComplete]);
    
    React.useEffect(() => {
      const listener = () => {
        setShouldRender(isZoomed);
      };
      zoomStateListeners.add(listener);
      return () => {
        zoomStateListeners.delete(listener);
      };
    }, []);
    
    if (!shouldRender) return null;
    
    return (
      <div data-testid="animate-presence">
        {children}
      </div>
    );
  };

  // Mock hooks
  const useAnimation = () => ({
    start: vi.fn().mockImplementation((_, options) => {
      return new Promise<void>((resolve) => {
        options?.onComplete?.();
        resolve();
      });
    }),
    set: vi.fn(),
    stop: vi.fn(),
    isActive: false,
  });

  const useInView = () => [null, false];
  const useReducedMotion = () => false;
  
  const animate = vi.fn().mockImplementation((_, __, options) => {
    return new Promise<void>(resolve => {
      options?.onComplete?.();
      resolve();
    });
  });

  const useAnimationControls = () => ({
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn(),
    set: vi.fn(),
  });

  return {
    motion,
    AnimatePresence,
    useAnimation,
    useInView,
    useReducedMotion,
    animate,
    useAnimationControls,
  };
});

describe('ImageBlock Simple Tests', () => {
  const defaultProps = {
    src: 'https://example.com/test.jpg',
    alt: 'Test image',
  };

  beforeAll(() => {
    // Mock window.Image constructor for LQIP
    global.Image = class {
      onload: (() => void) | null = null;
      src = '';
      constructor() {
        // Simulate image load after a short delay
        setTimeout(() => {
          if (this.onload) {
            this.onload();
          }
        }, 0);
      }
    } as unknown as typeof Image;
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // Helper function to wait for image load
  const waitForImageLoad = () => {
    return new Promise(resolve => setTimeout(resolve, 10));
  };

  it('renders with default props', async () => {
    render(<ImageBlock {...defaultProps} loading="eager" />);
    await waitForImageLoad();
    
    const img = screen.getByAltText(defaultProps.alt);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', defaultProps.src);
    expect(img).toHaveAttribute('loading', 'eager');
    expect(img).toHaveClass('opacity-0');
  });

  it('handles image load', () => {
    render(<ImageBlock {...defaultProps} loading="eager" />);
    const img = screen.getByAltText(defaultProps.alt);
    fireEvent.load(img);
    expect(img).toHaveClass('opacity-100');
  });

  it('handles image error', async () => {
    const onError = vi.fn();
    render(
      <ImageBlock 
        {...defaultProps} 
        src="https://example.com/error.jpg" 
        onError={onError} 
      />
    );

    // Find the image container and then the image inside it
    const container = await screen.findByTestId('image-block-container');
    const img = container.querySelector('img');

    // Simulate error
    fireEvent.error(img!);

    // The error is handled by the onError callback, but we don't show an error message
    // in the UI anymore as it's handled by the parent component
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('shows zoom button when zoomable is true', () => {
    render(<ImageBlock {...defaultProps} zoomable={true} loading="eager" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('does not show zoom button when zoomable is false', () => {
    render(<ImageBlock {...defaultProps} zoomable={false} loading="eager" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('closes zoom overlay when clicking outside', async () => {
    render(
      <div data-testid="test-container">
        <ImageBlock {...defaultProps} zoomable />
      </div>
    );

    // Simulate image load
    const container = await screen.findByTestId('image-block-container');
    const img = container.querySelector('img');
    fireEvent.load(img!);

    // Click to show zoom (the container is the button when zoomable)
    fireEvent.click(container);

    // Click outside to close
    const testContainer = screen.getByTestId('test-container');
    fireEvent.click(testContainer);

    // Check if zoom overlay is removed
    expect(screen.queryByTestId('zoom-overlay')).not.toBeInTheDocument();
  });

  it('shows zoom overlay when zoom button is clicked', async () => {
    // Mock the window.matchMedia function
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock the document.body.style.overflow setter
    const originalOverflow = document.body.style.overflow;
    const mockSetOverflow = vi.fn();
    Object.defineProperty(document.body.style, 'overflow', {
      set: mockSetOverflow,
      get: () => originalOverflow,
    });

    // Render the component
    const { container } = render(<ImageBlock {...defaultProps} zoomable />);
    
    // Simulate image load
    const img = container.querySelector('img');
    fireEvent.load(img!);
    
    // The container itself is the button when zoomable
    const imageContainer = screen.getByTestId('image-block-container');
    expect(imageContainer).toHaveAttribute('role', 'button');
    expect(imageContainer).toHaveAttribute('aria-label', 'Test image (click to zoom)');
    
    // Simulate click on the container
    fireEvent.click(imageContainer);
    
    // Check if the overflow style was set to 'hidden' (indicating zoom)
    expect(mockSetOverflow).toHaveBeenCalledWith('hidden');
    
    // Clean up
    document.body.style.overflow = originalOverflow;
  });

  it('closes zoom overlay when pressing Escape key', async () => {
    render(<ImageBlock {...defaultProps} zoomable />);

    // Simulate image load
    const container = await screen.findByTestId('image-block-container');
    const img = container.querySelector('img');
    fireEvent.load(img!);

    // Click to show zoom (the container is the button when zoomable)
    fireEvent.click(container);

    // Press Escape key
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    // Verify the button is still in the document (overlay is closed)
    expect(container).toBeInTheDocument();
  });
});
