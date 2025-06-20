import * as React from 'react';
import { useState, useRef, useEffect, useCallback, useMemo, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ImageBlockProps } from './types';

// Define local type aliases for better type safety
type BorderRadiusScale = 'none' | 'sm' | 'md' | 'lg' | 'full';
type ShadowScale = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Utility function to join class names
const cn = (...classes: Array<string | boolean | undefined>): string => 
  classes.filter(Boolean).join(' ');

// Define constants for radius and shadow values with proper typing
const radiusMap: Record<BorderRadiusScale, string> = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '1rem',
  full: '9999px',
} as const;

const shadowMap: Record<ShadowScale, string> = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
} as const;

/**
 * A responsive image component with support for modern image formats,
 * lazy loading, and various styling options.
 */
const ImageBlock = forwardRef<HTMLDivElement, ImageBlockProps>(({
  src: srcProp,
  alt = '',
  width = '100%',
  height = 'auto',
  loading = 'lazy',
  decoding = 'async',
  fetchPriority = 'auto',
  caption,
  borderRadius = 'none',
  shadow = 'none',
  hasBorder = false,
  objectFit = 'cover',
  onLoad,
  onError: onErrorProp,
  className = '',
  lqip,
  zoomable = false,
  sizes = '100vw',
  ...props
}, forwardedRef) => {
  // Component state
  const [isLoaded, setIsLoaded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');

  // Refs
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Combine forwarded ref with local ref
  React.useImperativeHandle(forwardedRef, () => containerRef.current ?? document.createElement('div'), []);

  // Process image source with proper type safety
  const mainSrc = useMemo((): string => {
    if (!srcProp) return '';
    
    // Handle string case
    if (typeof srcProp === 'string') return srcProp;
    
    // Handle array case
    if (Array.isArray(srcProp)) {
      if (srcProp.length === 0) return '';
      const firstItem = srcProp[0];
      if (!firstItem) return '';
      
      // Handle array of strings or ImageSource objects
      if (typeof firstItem === 'string') return firstItem;
      if (firstItem && typeof firstItem === 'object' && 'src' in firstItem) {
        return String((firstItem as { src: string }).src);
      }
      return '';
    }
    
    // Handle object case
    if (typeof srcProp === 'object' && srcProp !== null && 'src' in srcProp) {
      return String((srcProp as { src: string }).src);
    }
    
    return '';
  }, [srcProp]);

  // Event handlers
  const handleError = useCallback(() => {
    const error = new Error(`Failed to load image: ${mainSrc}`);
    onErrorProp?.(error);
  }, [onErrorProp, mainSrc]);

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(e);
    if (lqip) setCurrentSrc(mainSrc);
  }, [onLoad, lqip, mainSrc]);

  const handleImageClick = useCallback(() => {
    if (zoomable) setIsZoomed(true);
  }, [zoomable]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (e.target === e.currentTarget) setIsZoomed(false);
  }, []);

  // Handle zoom state and body overflow

  // Set initial source (LQIP if available, otherwise main source)
  useEffect(() => {
    setCurrentSrc(lqip || mainSrc);
  }, [lqip, mainSrc]);

  // Handle zoom state and body overflow
  useEffect(() => {
    if (isZoomed) {
      // Set overflow hidden on both body and html elements for maximum compatibility
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      // Add event listener for Escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsZoomed(false);
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      };
    }
  }, [isZoomed]);

  // Styles
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: radiusMap[borderRadius as BorderRadiusScale],
    boxShadow: shadowMap[shadow as ShadowScale],
    border: hasBorder ? '1px solid #e2e8f0' : 'none',
    overflow: 'hidden',
  };

  const lqipStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    filter: 'blur(20px)',
    opacity: isLoaded ? 0 : 1,
    transition: 'opacity 0.3s ease-out',
    objectFit,
  };

  const zoomStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    cursor: zoomable ? 'zoom-out' : 'default',
  };

  if (!srcProp) return null;

  return (
    <>
      <div
        ref={containerRef}
        data-testid="image-block-container"
        className={cn('image-block-container', className, zoomable ? 'cursor-zoom-in' : '')}
        style={containerStyle}
        role={zoomable ? 'button' : 'presentation'}
        aria-label={zoomable ? alt || 'Zoomable image' : undefined}
        aria-hidden={!zoomable ? false : undefined}
        tabIndex={zoomable ? 0 : undefined}
        onClick={zoomable ? handleImageClick : undefined}
        onKeyDown={zoomable ? (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleImageClick();
          }
        } : undefined}
        {...props}
      >
      {lqip && (
        <img
          src={lqip}
          alt=""
          aria-hidden="true"
          style={lqipStyle}
        />
      )}

      <img
        ref={imgRef}
        src={currentSrc}
        alt={zoomable ? '' : alt} // Empty alt when zoomable to avoid duplicate announcements
        aria-hidden={zoomable ? 'true' : 'false'}
        width={typeof width === 'number' ? width : undefined}
        height={typeof height === 'number' ? height : undefined}
        loading={loading}
        decoding={decoding}
        // @ts-expect-error - fetchpriority is a valid HTML attribute but not in React's types yet
        fetchpriority={fetchPriority}
        sizes={sizes}
        className={cn(
          'block w-full h-full',
          isLoaded ? 'opacity-100' : 'opacity-0',
          'transition-opacity duration-300 ease-in-out'
        )}
        style={{
          objectFit,
        }}
        onLoad={handleLoad}
        onError={handleError}
      />

      <AnimatePresence>
        {isZoomed && (
          <motion.div
            data-testid="zoom-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={zoomStyle}
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-label={`Zoomed image: ${alt}`}
          >
            <motion.img
              src={mainSrc}
              alt={alt}
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {caption && (
        <figcaption 
          className="mt-2 text-sm text-gray-600 text-center"
          data-testid="image-caption"
        >
          {caption}
        </figcaption>
      )}
      </div>
    </>
  );
});

// Set display name for better debugging
ImageBlock.displayName = 'ImageBlock';

export default ImageBlock;
