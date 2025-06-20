import type { ImageBlockProps } from '@/blocks/media-block/image-block/types';
import type { BorderRadiusScale, ShadowScale } from '@/blocks/media-block/types';

// Extend the base props and add our custom ones
export interface ImageBlockStoryProps extends Omit<ImageBlockProps, 'onLoad' | 'onError'> {
  onLoad?: () => void;
  onError?: (error: Error) => void;
  borderRadius?: BorderRadiusScale;
  shadow?: ShadowScale;
  lightbox?: boolean;
}
