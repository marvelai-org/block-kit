import type { Meta, StoryObj } from '@storybook/react';
import { PromptContainerFullLineBottomActionsBlock } from '@vibing-ai/block-kit';
import { createElement, useState } from 'react';

const meta: Meta<typeof PromptContainerFullLineBottomActionsBlock> = {
  title: 'Blocks/Prompt/PromptContainerFullLineBottomActionsBlock',
  component: PromptContainerFullLineBottomActionsBlock,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof PromptContainerFullLineBottomActionsBlock>;

export const Default: Story = {
  args: {
    value: 'This is a prompt block',
    placeholder: 'Enter a prompt here',
    onSubmit: msg => alert(`Submitted: ${msg}`),
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    value: 'This is disabled prompt block',
    disabled: true,
  },
};

export const customActionButton: Story = {
  args: {
    value: 'This is custom action prompt block',
    onSubmit: msg => alert(`Submitted: ${msg}`),
    disabled: false,
    actionButtons: createElement(
      'div',
      { className: 'flex gap-2 items-center' },
      createElement('button', { 'aria-label': 'Send', type: 'button' }, '📤'),
      createElement('button', { 'aria-label': 'Attach', type: 'button' }, '📎'),
      createElement('button', { 'aria-label': 'Mic', type: 'button' }, '🎤')
    ),
  },
};

export const AutoResizing = {
  render: args => {
    const [value, setValue] = useState('');

    return createElement(PromptContainerFullLineBottomActionsBlock, {
      ...args,
      value,
      onChange: setValue,
      onSubmit: msg => {
        console.log('Message sent:', msg);
      },
    });
  },
};
