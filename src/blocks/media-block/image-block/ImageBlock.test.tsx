import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import ImageBlock from './ImageBlock';

// Simple mock for IntersectionObserver
const mockIntersectionObserver = vi.fn();
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

mockIntersectionObserver.mockReturnValue({
  observe: mockObserve,
  unobserve: mockUnobserve,
  disconnect: mockDisconnect,
});

// Mock the global IntersectionObserver
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: mockIntersectionObserver,
});

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  value: mockIntersectionObserver,
});

describe('ImageBlock', () => {
  // Basic props for testing
  const defaultProps = {
    id: 'test-image',
    src: 'test.jpg',
    alt: 'Test image',
    width: 300,
    height: 200,
    loading: 'eager' as const,
    zoomable: false,
  };

  beforeAll(() => {
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
    cleanup();
  });
  
  afterAll(() => {
    vi.useRealTimers();
  });

  it('renders with default props', () => {
    render(<ImageBlock {...defaultProps} />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', 'Test image');
    expect(img).toHaveAttribute('loading', 'eager');
  });

  it('renders with custom width and height', () => {
    const { container } = render(<ImageBlock {...defaultProps} width={300} height={200} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toBeInTheDocument();
  });

  it('handles image load', () => {
    const mockOnLoad = vi.fn();
    render(<ImageBlock {...defaultProps} onLoad={mockOnLoad} loading="eager" />);
    
    // The image should be in the document with correct attributes
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', defaultProps.src);
    expect(img).toHaveAttribute('alt', defaultProps.alt);
    
    // Simulate image load
    fireEvent.load(img);
    
    // Verify onLoad was called
    expect(mockOnLoad).toHaveBeenCalled();
  });

  it('shows caption when provided', () => {
    const caption = 'Test caption';
    const { container } = render(<ImageBlock {...defaultProps} caption={caption} />);
    
    // The caption should be visible
    const captionElement = screen.getByText(caption);
    expect(captionElement).toBeInTheDocument();
    
    // The caption should be in a div with the correct class
    const captionDiv = container.querySelector('.mt-2.text-sm.text-gray-600');
    expect(captionDiv).toBeInTheDocument();
  });

  describe('Zoom functionality', () => {
    it('applies zoomable styles when zoomable prop is true', () => {
      const { container } = render(<ImageBlock {...defaultProps} zoomable />);
      
      // The component uses Framer Motion for zooming, which adds a div wrapper
      const wrapper = container.firstChild as HTMLElement;
      // Check if the wrapper has the motion component class or style
      expect(wrapper).toHaveAttribute('style');
    });

    it('applies custom class names', () => {
      const customClass = 'custom-class';
      const { container } = render(<ImageBlock {...defaultProps} className={customClass} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass(customClass);
    });
  });

  describe('Accessibility', () => {
    it('has proper alt text', () => {
      render(<ImageBlock {...defaultProps} alt="Test alt text" />);
      const img = screen.getByAltText('Test alt text');
      expect(img).toBeInTheDocument();
    });
  });
});
