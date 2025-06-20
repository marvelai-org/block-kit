export type BorderRadiusScale = 'none' | 'sm' | 'md' | 'lg' | 'full' | number;
export type ShadowScale = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ImageBlockBaseProps {
  /** The source URL of the image (required) */
  src: string;
  /** Alternative text for the image (required for accessibility) */
  alt: string;
  /** Optional caption displayed below the image */
  caption?: React.ReactNode;
  /** Width of the image (can be any valid CSS width value) */
  width?: string | number;
  /** Height of the image (can be any valid CSS height value) */
  height?: string | number;
  /** Loading behavior of the image */
  loading?: 'eager' | 'lazy';
  /** Image decoding hint */
  decoding?: 'sync' | 'async' | 'auto';
  /** Fetch priority hint */
  fetchPriority?: 'high' | 'low' | 'auto';
  /** Border radius size */
  borderRadius?: BorderRadiusScale;
  /** Shadow size */
  shadow?: ShadowScale;
  /** Border color (any valid CSS color) */
  borderColor?: string;
  /** Border width (any valid CSS border width) */
  borderWidth?: string | number;
  /** Whether to show a border around the image */
  hasBorder?: boolean;
  /** How the image should be resized to fit its container */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  /** Position of the image within its container */
  objectPosition?: string;
  /** Enable lightbox/zoom functionality on click */
  zoomable?: boolean;
  /** Low Quality Image Placeholder (LQIP) for blur-up effect */
  lqip?: string;
  /** Custom class name for the container */
  className?: string;
  /** Inline styles for the container */
  style?: React.CSSProperties;
  /** Custom class name for the image */
  imgClassName?: string;
  /** Inline styles for the image */
  imgStyle?: React.CSSProperties;
  /** Custom loader component */
  loader?: React.ReactNode;
  /** Custom error component */
  errorComponent?: React.ReactNode | ((error: Error) => React.ReactNode);
  /** Callback when image loads successfully */
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  /** Callback when image fails to load */
  onError?: (error: Error) => void;
  /** Callback when image is clicked */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  /** Enable/disable image transition on load */
  fadeInOnLoad?: boolean;
  /** Duration of the fade-in animation in milliseconds */
  fadeInDuration?: number;
  /** Custom background color for the image container */
  backgroundColor?: string;
  /** Custom background color for the image while loading */
  loadingBackgroundColor?: string;
  /** Custom background color for the image when zoomed */
  zoomedBackgroundColor?: string;
  /** Custom overlay when image is zoomed */
  zoomedOverlay?: React.ReactNode;
  /** Custom close button for zoomed image */
  closeButton?: React.ReactNode;
  /** Enable/disable zoom on double click */
  zoomOnDoubleClick?: boolean;
  /** Enable/disable zoom on scroll */
  zoomOnScroll?: boolean;
  /** Zoom scale factor */
  zoomScale?: number;
  /** Disable zoom on mobile devices */
  disableZoomOnMobile?: boolean;
  /** Custom mobile breakpoint in pixels */
  mobileBreakpoint?: number;
  /** Custom styles for the zoomed image container */
  zoomedContainerStyle?: React.CSSProperties;
  /** Custom styles for the zoomed image */
  zoomedImageStyle?: React.CSSProperties;
  /** Enable/disable keyboard navigation */
  keyboardNavigation?: boolean;
  /** Enable/disable touch gestures for zooming */
  touchGestures?: boolean;
  /** Custom styles for the loading skeleton */
  skeletonStyle?: React.CSSProperties;
  /** Custom styles for the error state */
  errorStyle?: React.CSSProperties;
}
