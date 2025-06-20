import * as React from 'react';
import { cn } from '../../utils/cn';

/**
 * Calculates the appropriate size and width classes for a button based on its props
 * @param size - The size of the button
 * @param isIconButton - Whether the button is an icon button
 * @param fullWidth - Whether the button should take full width
 * @returns An object containing the size and width classes
 */
const getButtonLayoutClasses = (
  size: ButtonSize,
  isIconButton: boolean,
  fullWidth: boolean
): { sizeClass: string; widthClass: string } => {
  if (isIconButton) {
    return {
      sizeClass: 'p-0',
      widthClass: 'w-10',
    };
  }

  return {
    sizeClass: buttonSizes[size],
    widthClass: fullWidth ? 'w-full' : '',
  };
};

type ButtonVariant = keyof typeof buttonVariants;
type ButtonSize = keyof typeof buttonSizes;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The variant of the button
   * @default 'default'
   */
  variant?: ButtonVariant;
  /**
   * The size of the button
   * @default 'md'
   */
  size?: ButtonSize;
  /**
   * Whether the button is in a loading state
   * @default false
   */
  isLoading?: boolean;
  /**
   * The icon to display before the button text
   */
  leftIcon?: React.ReactNode;
  /**
   * The icon to display after the button text
   */
  rightIcon?: React.ReactNode;
  /**
   * Whether the button should take up the full width of its container
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Additional class name for the button
   */
  className?: string;
  /**
   * The type of the button
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';
  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * The content of the button
   */
  children?: React.ReactNode;
  /**
   * Whether the button should be a square (for icon buttons)
   * @default false
   */
  isIconButton?: boolean;
}

const buttonVariants = {
  default: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  ghost: 'bg-transparent hover:bg-gray-100',
  link: 'bg-transparent text-blue-600 hover:underline',
  outline: 'border border-gray-300 bg-transparent hover:bg-gray-50',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
} as const;

const buttonSizes = {
  sm: 'h-8 text-sm px-3',
  md: 'h-10 px-4 py-2',
  lg: 'h-12 px-6 text-lg',
} as const;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'default',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      children,
      disabled = false,
      type = 'button',
      isIconButton = false,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;
    const { sizeClass: buttonSize, widthClass: buttonWidth } = getButtonLayoutClasses(
      size,
      isIconButton,
      fullWidth
    );
    
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
          'disabled:opacity-50 disabled:pointer-events-none',
          buttonVariants[variant],
          buttonSize,
          buttonWidth,
          isIconButton ? 'aspect-square' : '',
          className
        )}
        disabled={isDisabled}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
