// Import types from parent module
import { BorderRadiusScale, ShadowScale } from '../types';

// Base properties for all blocks
export interface BlockProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export type ImageSource = {
  /** URL of the image */
  src: string;
  /** Image sources for different viewport sizes */
  srcSet?: string;
  /** Media query for the source */
  media?: string;
  /** MIME type of the image */
  type?: string;
  /** Image sizes attribute for responsive images */
  sizes?: string;
  /** Width of the image (used for srcset generation) */
  width?: number | string;
  /** Height of the image (for aspect ratio) */
  height?: number | string;
}

export interface ImageBlockProps extends Omit<BlockProps, 'onChange'> {
  /**
   * Single image source or array of sources for responsive images
   */
  src: string | ImageSource[];
  
  /**
   * Required alt text for accessibility
   */
  alt: string;
  
  /**
   * Image width (can be number or string with units)
   */
  width?: number | string;
  
  /**
   * Image height (can be number or string with units)
   */
  height?: number | string;
  
  /**
   * Loading behavior ('lazy' or 'eager')
   * @default 'lazy'
   */
  loading?: 'lazy' | 'eager';

  /**
   * Image decoding hint
   * @default 'async'
   */
  decoding?: 'sync' | 'async' | 'auto';

  /**
   * Fetch priority hint for the browser
   * @default 'auto'
   */
  fetchPriority?: 'high' | 'low' | 'auto';
  
  /**
   * Optional caption displayed below the image
   */
  caption?: string;
  
  /**
   * Border radius scale or custom value
   * @default 'none'
   */
  borderRadius?: BorderRadiusScale;
  
  /**
   * Low Quality Image Placeholder (LQIP) for blur-up effect
   * A base64-encoded thumbnail or small version of the image
   */
  lqip?: string;
  
  /**
   * Enable click-to-zoom functionality
   * @default false
   */
  zoomable?: boolean;
  
  /**
   * Shadow scale
   * @default 'none'
   */
  shadow?: ShadowScale;
  
  /**
   * Show border around the image
   * @default false
   */
  hasBorder?: boolean;
  
  /**
   * How the image should be resized to fit its container
   * @default 'cover'
   */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

  /**
   * Image sources for responsive images
   */
  srcSet?: string;

  /**
   * Image sizes attribute for responsive images
   * @default '100vw'
   */
  sizes?: string;
  
  /**
   * Callback when image loads successfully
   */
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  
  /**
   * Callback when image fails to load
   */
  onError?: (error: Error) => void;
}
