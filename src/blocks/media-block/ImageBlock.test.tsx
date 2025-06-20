import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import type { ReactNode, MouseEvent, KeyboardEvent } from 'react';
import ImageBlock from './image-block/ImageBlock';

type MotionProps = {
  children?: ReactNode;
  style?: { zIndex?: number };
  [key: string]: unknown;
};

// Mock for framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: MotionProps) => {
      // Add test ID to the zoom overlay div
      if (props?.style?.zIndex === 9999) {
        return (
          <div 
            data-testid="zoom-overlay"
            role="dialog"
            aria-label="Close zoomed image"
            tabIndex={-1}
            onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
              if (e.key === 'Escape' && typeof props.onKeyDown === 'function') {
                props.onKeyDown(e as unknown as KeyboardEvent<HTMLDivElement>);
              }
            }}
            onClick={(e: MouseEvent<HTMLDivElement>) => {
              if (typeof props.onClick === 'function') {
                props.onClick(e as unknown as MouseEvent<HTMLDivElement>);
              }
            }}
          >
            {children}
          </div>
        );
      }
      return <div {...props}>{children}</div>;
    },
    img: ({ alt = '', ...props }: { alt?: string } & React.ImgHTMLAttributes<HTMLImageElement>) => (
      <img alt={alt} {...props} />
    ),
  },
  AnimatePresence: ({ children }: { children: ReactNode; onExitComplete?: () => void }) => (
    <div data-testid="animate-presence">{children}</div>
  ),
  useAnimation: () => ({
    start: vi.fn().mockResolvedValue(undefined),
    set: vi.fn(),
  }),
  useInView: () => [null, false],
  useReducedMotion: () => false,
}));

describe('ImageBlock', () => {
  const defaultProps = {
    src: 'https://example.com/test.jpg',
    alt: 'Test image',
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<ImageBlock {...defaultProps} loading="eager" />);
    const img = screen.getByAltText(defaultProps.alt);
    expect(img).toBeInTheDocument();
  });

  describe('Zoom functionality', () => {
    it('shows zoom overlay when zoomable is true and image is clicked', async () => {
      render(
        <ImageBlock 
          src="https://example.com/zoom-test.jpg" 
          alt="Zoom test"
          zoomable={true}
          loading="eager"
        />
      );
      
      // Initial state - no zoom overlay
      expect(screen.queryByTestId('zoom-overlay')).not.toBeInTheDocument();
      
      // Click the image to zoom
      const img = screen.getByAltText('Zoom test');
      fireEvent.click(img);
      
      // Verify zoom overlay is shown
      const zoomOverlay = await screen.findByTestId('zoom-overlay');
      expect(zoomOverlay).toBeInTheDocument();
    });

    it('closes zoom when clicking outside the image', async () => {
      render(
        <div data-testid="test-container">
          <ImageBlock 
            src="https://example.com/click-outside.jpg" 
            alt="Click outside test" 
            zoomable={true}
            loading="eager"
          />
        </div>
      );
      
      // Click the image to zoom
      const img = screen.getByAltText('Click outside test');
      fireEvent.click(img);
      
      // Verify zoom is open
      const zoomOverlay = await screen.findByTestId('zoom-overlay');
      expect(zoomOverlay).toBeInTheDocument();
      
      // Click outside the image (on the overlay)
      fireEvent.click(zoomOverlay);
      
      // Verify zoom is closed
      await waitFor(() => {
        expect(screen.queryByTestId('zoom-overlay')).not.toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('closes zoom when pressing Escape key', async () => {
      render(
        <ImageBlock 
          src="https://example.com/escape-zoom.jpg" 
          alt="Escape zoom test" 
          zoomable={true}
          loading="eager"
        />
      );
      
      // Click the image to zoom
      const img = screen.getByAltText('Escape zoom test');
      fireEvent.click(img);
      
      // Verify zoom is open
      const zoomOverlay = await screen.findByTestId('zoom-overlay');
      expect(zoomOverlay).toBeInTheDocument();
      
      // Press Escape key
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      
      // Verify zoom is closed
      await waitFor(() => {
        expect(screen.queryByTestId('zoom-overlay')).not.toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('does not show zoom when zoomable is false', () => {
      render(
        <ImageBlock 
          src="https://example.com/no-zoom.jpg" 
          alt="No zoom test" 
          zoomable={false}
          loading="eager"
        />
      );
      
      const img = screen.getByAltText('No zoom test');
      fireEvent.click(img);
      
      // Verify no zoom overlay is shown
      expect(screen.queryByTestId('zoom-overlay')).not.toBeInTheDocument();
    });
  });
});
