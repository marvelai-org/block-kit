
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Paperclip, Smile, Send } from '../../../../src/blocks/icons/Icons';
import { PromptContainerFullLineBottomActionsLarge } from '../../../../src/blocks/prompt';

const meta: Meta<typeof PromptContainerFullLineBottomActionsLarge> = {
  title: 'Blocks/Prompt/PromptContainerFullLineBottomActionsLarge',
  component: PromptContainerFullLineBottomActionsLarge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A large variant of the prompt container with bottom actions, featuring increased typography, padding, and touch targets for better visibility and usability.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant of the prompt',
      table: {
        defaultValue: { summary: 'lg' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the prompt is disabled',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the prompt is in a loading state',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
    value: {
      control: { type: 'text' },
      description: 'The current value of the prompt input',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when the input value changes',
    },
    onSubmit: {
      action: 'submitted',
      description: 'Callback when the form is submitted',
    },
  },
  args: {
    placeholder: 'Type your message here...',
    disabled: false,
    isLoading: false,
    showSubmitButton: true,
    submitButtonLabel: 'Send',
  },
};

export default meta;

type Story = StoryObj<typeof PromptContainerFullLineBottomActionsLarge>;

// Default story with all controls
export const Default: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('');
    
    return (
      <div className="w-full max-w-2xl">
        <PromptContainerFullLineBottomActionsLarge
          {...args}
          value={value}
          onChange={(val) => {
            setValue(val);
            args.onChange?.(val);
          }}
          onSubmit={() => {
            alert(`Submitted: ${value}`);
            args.onSubmit?.();
          }}
        />
      </div>
    );
  },
};

// Size variants story
export const SizeVariants: Story = {
  render: function Render() {
    const [value, setValue] = useState('');
    
    return (
      <div className="space-y-8 w-full max-w-2xl">
        <div>
          <h3 className="text-sm font-medium mb-2">Small (sm)</h3>
          <PromptContainerFullLineBottomActionsLarge
            size="sm"
            value={value}
            onChange={setValue}
            onSubmit={() => alert(`Submitted: ${value}`)}
            placeholder="Type a message..."
          />
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Medium (md)</h3>
          <PromptContainerFullLineBottomActionsLarge
            size="md"
            value={value}
            onChange={setValue}
            onSubmit={() => alert(`Submitted: ${value}`)}
            placeholder="Type a message..."
          />
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Large (lg) - Default</h3>
          <PromptContainerFullLineBottomActionsLarge
            size="lg"
            value={value}
            onChange={setValue}
            onSubmit={() => alert(`Submitted: ${value}`)}
            placeholder="Type a message..."
          />
        </div>
      </div>
    );
  },
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

// With custom action buttons
export const WithCustomActions: Story = {
  render: function Render() {
    const [value, setValue] = useState('');
    
    return (
      <div className="w-full max-w-2xl">
        <PromptContainerFullLineBottomActionsLarge
          value={value}
          onChange={setValue}
          onSubmit={() => alert(`Submitted: ${value}`)}
          placeholder="Type a message..."
          actionButtons={[
            {
              label: 'Attach file',
              icon: <Paperclip className="h-5 w-5" />,
              onClick: () => alert('Attach file clicked'),
            },
            {
              label: 'Add emoji',
              icon: <Smile className="h-5 w-5" />,
              onClick: () => alert('Add emoji clicked'),
            },
          ]}
          showSubmitButton={true}
          submitButtonLabel="Send"
          submitButtonIcon={<Send className="h-5 w-5" />}
        />
      </div>
    );
  },
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'This prompt is disabled',
  },
};

// Loading state
export const Loading: Story = {
  args: {
    isLoading: true,
    value: 'Processing your request...',
  },
};
