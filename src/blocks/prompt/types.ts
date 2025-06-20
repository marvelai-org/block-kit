import { ReactNode } from 'react';

export type PromptSize = 'sm' | 'md' | 'lg';

export interface PromptActionButton {
  /**
   * The label for the button (required for accessibility)
   */
  label: string;
  /**
   * The icon to display in the button
   */
  icon?: ReactNode;
  /**
   * Callback when the button is clicked
   */
  onClick: () => void;
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
  /**
   * Additional class name for the button
   */
  className?: string;
}

export interface PromptContainerFullLineBottomActionsProps {
  /**
   * The current value of the prompt input
   */
  value: string;
  /**
   * Callback when the input value changes
   */
  onChange: (value: string) => void;
  /**
   * Callback when the form is submitted
   */
  onSubmit: () => void;
  /**
   * Placeholder text for the input
   */
  placeholder?: string;
  /**
   * Whether the prompt is disabled
   */
  disabled?: boolean;
  /**
   * Whether to show a loading state
   */
  isLoading?: boolean;
  /**
   * Additional action buttons to display
   */
  actionButtons?: PromptActionButton[];
  /**
   * Size variant of the prompt
   */
  size?: PromptSize;
  /**
   * Additional class name for the container
   */
  className?: string;
  /**
   * Additional class name for the textarea
   */
  textareaClassName?: string;
  /**
   * Additional class name for the actions container
   */
  actionsContainerClassName?: string;
  /**
   * Whether to show the submit button
   * @default true
   */
  showSubmitButton?: boolean;
  /**
   * Custom submit button label
   * @default 'Send'
   */
  submitButtonLabel?: string;
  /**
   * Custom submit button icon
   */
  submitButtonIcon?: ReactNode;
  /**
   * Whether to auto-focus the input
   */
  autoFocus?: boolean;
  /**
   * Maximum height of the textarea before it becomes scrollable
   */
  maxHeight?: number | string;
  /**
   * Callback when the input is focused
   */
  onFocus?: () => void;
  /**
   * Callback when the input is blurred
   */
  onBlur?: () => void;
  /**
   * Custom render function for the actions
   */
  renderActions?: (props: {
    disabled?: boolean;
    isLoading?: boolean;
    submit: () => void;
  }) => ReactNode;
}
