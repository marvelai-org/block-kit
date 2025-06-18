import { BlockProps } from '../../types';
import React, { useRef, useEffect } from 'react';
import { Textarea } from '@heroui/react';
import { Button } from '@vibing-ai/block-kit';
import { Icon } from '@iconify/react';
import { Paperclip, Mic } from 'lucide-react';

export interface PromptContainerFullLineBottomActionsBlockProps extends BlockProps {
  /** Callback when message is submitted (click/send or keyboard shortcut) */
  onSubmit: (message: string) => void;
  /** Controlled value of the textarea */
  value?: string;
  /** Called when textarea value changes */
  onChange?: (value: string) => void;
  /** Custom action buttons (e.g. upload, mic, send) */
  actionButtons?: React.ReactNode;
  /** Placeholder text (default: "Type your message...") */
  placeholder?: string;
  /** Class for the main container */
  className?: string;
  /** Class for the textarea */
  textareaClassName?: string;
  /** Class for the actions container */
  actionsContainerClassName?: string;
  /** Disable input and send functionality */
  disabled?: boolean;
}

export const PromptContainerFullLineBottomActionsBlock: React.FC<
  PromptContainerFullLineBottomActionsBlockProps
> = ({
  onSubmit,
  value = '',
  onChange,
  actionButtons,
  placeholder = 'Enter a prompt here',
  className,
  textareaClassName,
  actionsContainerClassName,
  disabled = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = `${(Math.min(textareaRef.current.scrollHeight), 100)}px`; // Set to scrollHeight
    }
  }, [value]);

  const handleSubmit = () => {
    if (value.trim()) onSubmit(value.trim()); // Call the onSubmit callback with the trimmed value
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = 'Message sent';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="w-full relative border rounded-md bg-white"
      data-block-id="prompt-container-full-line-bottom-actions"
    >
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full p-3 pr-20 resize-none border rounded-md ${textareaClassName}`}
        disabled={disabled}
        aria-label="Prompt input"
        rows={1}
      />
      <div className={` left-0 w-full ${actionsContainerClassName}`}>
        {actionButtons || (
          <div className={className}>
            <Button
              type="button"
              aria-label="Use Microphone"
              className="absolute top-2 right-2 flex items-center justify-center text-gray-500"
            >
              <Mic />
            </Button>

            <Button
              type="button"
              aria-label="Attach file"
              className="absolute bottom-2 left-2 flex items-center justify-center text-gray-500"
            >
              <Paperclip />
            </Button>

            <Button
              type="button"
              aria-label="Send message"
              className="absolute bottom-2 w-12 h-12 right-2 mr-1 flex items-center justify-center bg-gray-200"
              style={{ borderRadius: '50%' }}
              onPress={handleSubmit}
              disabled={disabled || !value.trim()}
            >
              <Icon icon="heroicons:arrow-up" width={16} height={16} className="text-gray-800" />
            </Button>
          </div>
        )}
      </div>
      <div ref={liveRegionRef} className="sr-only" aria-live="polite" />
    </div>
  );
};
