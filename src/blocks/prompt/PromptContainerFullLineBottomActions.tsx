import * as React from 'react';
import { useRef, useEffect, useCallback } from 'react';
import { Icons } from '../icons/Icons';
import type { PromptContainerFullLineBottomActionsProps, PromptActionButton } from './types';

const sizeClasses = {
  sm: {
    container: 'p-2 rounded-lg',
    textarea: 'text-sm min-h-[40px] max-h-[200px] py-2 px-3',
    button: 'h-8 w-8',
    icon: 'h-4 w-4',
  },
  md: {
    container: 'p-3 rounded-lg',
    textarea: 'text-base min-h-[44px] max-h-[240px] py-2.5 px-4',
    button: 'h-9 w-9',
    icon: 'h-4 w-4',
  },
  lg: {
    container: 'p-4 rounded-xl',
    textarea: 'text-lg min-h-[48px] max-h-[280px] py-3 px-5',
    button: 'h-10 w-10',
    icon: 'h-5 w-5',
  },
};

export const PromptContainerFullLineBottomActions = React.forwardRef<
  HTMLDivElement,
  PromptContainerFullLineBottomActionsProps
>(({
  value,
  onChange,
  onSubmit,
  placeholder = 'Type a message...',
  disabled = false,
  isLoading = false,
  actionButtons = [],
  size = 'md',
  className,
  textareaClassName,
  actionsContainerClassName,
  showSubmitButton = true,
  submitButtonLabel = 'Send',
  submitButtonIcon,
  maxHeight = 'none',
  onFocus,
  onBlur,
  renderActions,
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isComposing = useRef(false);
  const currentSize = size || 'md';
  const sizeClass = sizeClasses[currentSize];

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const newHeight = Math.min(
      textarea.scrollHeight,
      typeof maxHeight === 'number' ? maxHeight : Number.POSITIVE_INFINITY
    );
    textarea.style.height = `${newHeight}px`;
  }, [maxHeight]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [value, adjustTextareaHeight]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (isComposing.current || disabled || isLoading) return;
    onSubmit();
  }, [disabled, isLoading, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Cmd+Enter or Ctrl+Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = () => {
    isComposing.current = false;
  };

  // Default action buttons
  const defaultActionButtons: PromptActionButton[] = [
    ...actionButtons,
    ...(showSubmitButton ? [{
      label: submitButtonLabel,
      icon: submitButtonIcon || <Icons.Send className={sizeClass.icon} />,
      onClick: handleSubmit,
      disabled: disabled || isLoading,
      className: 'bg-primary text-white hover:bg-primary/90',
    }] : []),
  ];

  // Filter out undefined class names
  const containerClasses = [
    'flex w-full flex-col overflow-hidden border border-border bg-background transition-colors focus-within:border-primary',
    sizeClass.container,
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={ref}
      className={containerClasses}
    >
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              className={[
                'w-full resize-none bg-transparent outline-none placeholder:text-muted-foreground',
                'disabled:cursor-not-allowed disabled:opacity-50',
                sizeClass.textarea,
                textareaClassName
              ].filter(Boolean).join(' ')}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              // autoFocus is intentionally disabled for better accessibility
              // Users should be able to navigate to the field when they're ready
              // autoFocus={autoFocus}
              aria-label={placeholder}
              style={{
                maxHeight: maxHeight === 'none' ? undefined : `${maxHeight}px`,
              }}
            />
          </div>

          <div
            className={[
              'mt-2 flex items-center justify-between',
              actionsContainerClassName
            ].filter(Boolean).join(' ')}
          >
            {renderActions ? (
              renderActions({
                disabled,
                isLoading,
                submit: handleSubmit,
              })
            ) : (
              <div className="flex items-center space-x-2">
                {defaultActionButtons.map((button, index) => (
                  <button
                    key={index}
                    type={button.onClick === handleSubmit ? 'submit' : 'button'}
                    disabled={button.disabled}
                    onClick={button.onClick}
                    className={[
                      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      'disabled:pointer-events-none disabled:opacity-50',
                      sizeClass.button,
                      button.className
                    ].filter(Boolean).join(' ')}
                    aria-label={button.label}
                  >
                    {button.icon}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
});

PromptContainerFullLineBottomActions.displayName = 'PromptContainerFullLineBottomActions';
