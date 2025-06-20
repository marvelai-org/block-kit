import * as React from 'react';
import { Icon } from '@iconify/react';
import type { BlockProps, ImageSource } from './types';

// Type definitions
type PointerEvents = 'auto' | 'none' | 'visiblePainted' | 'visibleFill' | 'visibleStroke' | 'visible' | 'painted' | 'fill' | 'stroke' | 'all' | 'inherit' | 'initial' | 'revert' | 'unset';

type FallbackComponent = React.ReactNode | ((props: { src?: string; alt: string }) => React.ReactNode);

interface SimpleImageBlockProps extends BlockProps {
  /** The source URL or array of sources for the image */
  src: string | ImageSource[];
  /** Alternative text for the image */
  alt: string;
  /** Width of the image */
  width?: number | string;
  /** Height of the image */
  height?: number | string;
  /** Whether to show a border around the image */
  hasBorder?: boolean;
  /** Border radius for the image */
  borderRadius?: number | string;
  /** Shadow style for the image */
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** How the image should be resized to fit its container */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  /** Whether the image should be zoomable */
  zoomable?: boolean;
  /** Custom component to render while the image is loading */
  placeholder?: React.ReactNode;
  /** Custom component to render if the image fails to load */
  fallback?: FallbackComponent;
  /** Duration of the fade-in animation in milliseconds */
  fadeInDuration?: number;
  /** Callback when the image fails to load */
  onError?: (error: Error) => void;
  /** Callback when the image loads successfully */
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  /** Whether to show a loading skeleton */
  showLoadingSkeleton?: boolean;
  /** Whether to use native lazy loading */
  lazyLoad?: boolean;
  /** Whether to enable blur-up technique */
  enableBlurUp?: boolean;
  /** Low Quality Image Placeholder (LQIP) */
  lqip?: string;
  /** Optional caption for the image */
  caption?: string;
}

export const SimpleImageBlock: React.FC<SimpleImageBlockProps> = ({
  src: srcProp,
  alt,
  width = '100%',
  height = 'auto',
  hasBorder = false,
  borderRadius = 0,
  objectFit = 'cover',
  zoomable = false,
  placeholder,
  fallback,
  fadeInDuration = 300,
  showLoadingSkeleton = true,
  lazyLoad = true,
  enableBlurUp = true,
  lqip,
  className = '',
  onError,
  onLoad,
  caption
}) => {
  // State for tracking loading and error states
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [isZoomed, setIsZoomed] = React.useState(false);
  const [isInView, setIsInView] = React.useState(!lazyLoad);
  const [currentSrc, setCurrentSrc] = React.useState<string>('');
  
  // Refs
  const containerRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const observerRef = React.useRef<IntersectionObserver | null>(null);
  // Ensure src prop is provided
  React.useEffect(() => {
    if (!srcProp) {
      const error = new Error('The "src" prop is required for SimpleImageBlock');
      console.error(error);
      setHasError(true);
      onError?.(error);
    }
  }, [srcProp, onError]);

  // Process image sources
  const { sources, defaultSource, hasMultipleSources } = React.useMemo(() => {
    if (!srcProp) {
      return { sources: [], defaultSource: { src: '' }, hasMultipleSources: false };
    }
    
    const srcArray = Array.isArray(srcProp) ? srcProp : [{ src: srcProp }];
    const defaultSrc = srcArray.find(src => !src.media) || srcArray[0];
    
    return {
      sources: srcArray,
      defaultSource: defaultSrc,
      hasMultipleSources: srcArray.length > 1
    };
  }, [srcProp]);
  
  // Set up intersection observer for lazy loading
  React.useEffect(() => {
    if (!lazyLoad || hasError || isInView || !imgRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px',
        threshold: 0.01
      }
    );
    
    observer.observe(imgRef.current);
    observerRef.current = observer;
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazyLoad, hasError, isInView]);
  
  // Event handlers
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // If we were using LQIP, switch to the actual image
    if (lqip && currentSrc === lqip) {
      setCurrentSrc(defaultSource.src);
      return; // Don't mark as loaded yet, wait for the actual image to load
    }
    
    setIsLoaded(true);
    setHasError(false);
    
    if (onLoad) {
      onLoad(e);
    }
  };
  
  const handleError = React.useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    if (process.env.NODE_ENV === 'development') {
      console.error('Image failed to load:', event);
    }
    onError?.(new Error('Failed to load image'));
  }, [onError]);
  
  // Toggle zoom state
  const toggleZoom = React.useCallback(() => {
    if (zoomable) {
      setIsZoomed((prev: boolean) => !prev);
    }
  }, [zoomable]);
  
  // Handle click on the image
  const handleClick = () => {
    if (zoomable) {
      toggleZoom();
    }
  };
  
  // Handle keyboard events for zooming
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleZoom();
    } else if (event.key === 'Escape' && isZoomed) {
      setIsZoomed(false);
    }
  };
  
  // Styles
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    overflow: 'hidden',
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
    border: hasBorder ? '1px solid #e2e8f0' : 'none',
    backgroundColor: '#f8f8f8',
  };

  const imageStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit,
    transition: `opacity ${fadeInDuration}ms ease-in-out`,
    opacity: isLoaded ? 1 : 0,
  };

  const placeholderStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
    opacity: isLoaded ? 0 : 1,
    transition: `opacity ${fadeInDuration}ms ease-in-out`,
  };

  const blurUpStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(20px)',
    transform: 'scale(1.1)',
    backgroundImage: lqip ? `url(${lqip})` : 'none',
    opacity: isLoaded ? 0 : 1,
    transition: `opacity ${fadeInDuration}ms ease-in-out`,
    pointerEvents: 'none' as PointerEvents,
  };

  const captionStyle: React.CSSProperties = {
    textAlign: 'center',
    marginTop: '8px',
    fontSize: '0.875rem',
    color: '#666',
  };

  // Render error state
  if (hasError || !defaultSource?.src) {
    const fallbackContent = fallback ? (
      typeof fallback === 'function' ? fallback({ src: defaultSource?.src, alt }) : fallback
    ) : (
      <div style={{
        ...placeholderStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        color: '#999'
      }}>
        <Icon icon="mdi:image-broken" style={{ fontSize: '2rem', color: '#ccc', marginRight: '0.5rem' }} />
        <span>Image not available</span>
      </div>
    );

    return (
      <div 
        className={`relative ${zoomable ? 'cursor-zoom-in' : ''} ${className}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={zoomable ? 'button' : undefined}
        tabIndex={zoomable ? 0 : undefined}
        aria-label={zoomable ? (isZoomed ? 'Zoom out' : 'Zoom in') : undefined}
      >
        {fallbackContent}
      </div>
    );
  }

  // Render loading state
  if ((!isInView && lazyLoad) || !defaultSource?.src) {
    return (
      <div style={containerStyle} className={className}>
        {showLoadingSkeleton && (
          <div style={{
            ...placeholderStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            color: '#999',
            fontSize: '0.875rem'
          }}>
            {placeholder || 'Loading image...'}
          </div>
        )}
      </div>
    );
  }

  // Render image with blur-up technique
  return (
    <div 
      className={`image-block ${className} ${zoomable ? 'cursor-pointer' : ''}`} 
      style={containerStyle}
      onClick={zoomable ? toggleZoom : undefined}
      onKeyDown={zoomable ? handleKeyDown : undefined}
      role={zoomable ? 'button' : undefined}
      tabIndex={zoomable ? 0 : undefined}
      aria-label={zoomable ? (isZoomed ? 'Zoom out' : 'Zoom in') : undefined}
      ref={containerRef}
    >
      {enableBlurUp && lqip && <div style={blurUpStyle} />}
      
      {!isLoaded && (
        <div style={placeholderStyle}>
          {placeholder || (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: '0.875rem'
            }}>
              Loading...
            </div>
          )}
        </div>
      )}

      {hasMultipleSources ? (
        <picture>
          {sources
            .filter(source => source.media)
            .map((source, index) => (
              <source
                key={index}
                srcSet={source.srcSet || source.src}
                media={source.media}
                type={source.type}
                sizes={source.sizes}
              />
            ))}
          <img
            ref={imgRef}
            src={defaultSource.src}
            alt={alt}
            style={imageStyle}
            onLoad={handleLoad}
            onError={handleError}
            loading={lazyLoad ? 'lazy' : 'eager'}
            decoding="async"
          />
        </picture>
      ) : (
        <img
          ref={imgRef}
          src={defaultSource.src}
          alt={alt}
          style={imageStyle}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazyLoad ? 'lazy' : 'eager'}
          decoding="async"
        />
      )}

      {caption && <div style={captionStyle}>{caption}</div>}
    </div>
  );
};

export default SimpleImageBlock;
