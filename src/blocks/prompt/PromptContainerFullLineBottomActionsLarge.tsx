import * as React from 'react';
import { PromptContainerFullLineBottomActions } from './PromptContainerFullLineBottomActions';
import { PromptSize } from './types';
import { cn } from '../../utils/cn';

/**
 * A large variant of the PromptContainerFullLineBottomActions component with increased typography,
 * padding, and larger touch targets for better visibility and usability.
 */
interface PromptContainerFullLineBottomActionsLargeProps
  extends React.ComponentProps<typeof PromptContainerFullLineBottomActions> {
  /**
   * Size variant of the prompt
   * @default 'lg'
   */
  size?: PromptSize;
}

export const PromptContainerFullLineBottomActionsLarge = React.forwardRef<
  HTMLDivElement,
  PromptContainerFullLineBottomActionsLargeProps
>(({ size = 'lg', className, ...props }, ref) => {
  return (
    <PromptContainerFullLineBottomActions
      ref={ref}
      size={size}
      className={cn(
        'border-2', // Thicker border for large variant
        className || ''
      )}
      {...props}
    />
  );
});

PromptContainerFullLineBottomActionsLarge.displayName = 'PromptContainerFullLineBottomActionsLarge';

// Re-export the types for convenience
export type { PromptActionButton } from './types';
