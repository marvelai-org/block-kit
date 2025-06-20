import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PromptContainerFullLineBottomActionsLarge } from '../PromptContainerFullLineBottomActionsLarge';

describe('PromptContainerFullLineBottomActionsLarge', () => {
  it('renders with default props', () => {
    render(
      <PromptContainerFullLineBottomActionsLarge
        value=""
        onChange={() => {}}
        onSubmit={() => {}}
      />
    );
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveClass('text-lg');
  });

  it('calls onChange when typing in the textarea', () => {
    const handleChange = vi.fn();
    render(
      <PromptContainerFullLineBottomActionsLarge
        value=""
        onChange={handleChange}
        onSubmit={() => {}}
      />
    );
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    expect(handleChange).toHaveBeenCalledWith('Hello');
  });

  it('calls onSubmit when form is submitted', () => {
    const handleSubmit = vi.fn();
    const { container } = render(
      <PromptContainerFullLineBottomActionsLarge
        value="Test"
        onChange={() => {}}
        onSubmit={handleSubmit}
      />
    );
    
    const form = container.querySelector('form');
    fireEvent.submit(form!);
    expect(handleSubmit).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(
      <PromptContainerFullLineBottomActionsLarge
        value=""
        onChange={() => {}}
        onSubmit={() => {}}
        className="custom-class"
      />
    );
    
    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass('custom-class');
  });

  it('renders with different size variants', () => {
    const { rerender } = render(
      <PromptContainerFullLineBottomActionsLarge
        value=""
        onChange={() => {}}
        onSubmit={() => {}}
        size="sm"
      />
    );
    
    let textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('text-sm');
    
    rerender(
      <PromptContainerFullLineBottomActionsLarge
        value=""
        onChange={() => {}}
        onSubmit={() => {}}
        size="md"
      />
    );
    
    textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('text-base');
    
    rerender(
      <PromptContainerFullLineBottomActionsLarge
        value=""
        onChange={() => {}}
        onSubmit={() => {}}
        size="lg"
      />
    );
    
    textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('text-lg');
  });

  it('renders custom action buttons', () => {
    render(
      <PromptContainerFullLineBottomActionsLarge
        value=""
        onChange={() => {}}
        onSubmit={() => {}}
        actionButtons={[
          {
            label: 'Custom',
            icon: <span>+</span>,
            onClick: () => {},
          },
        ]}
      />
    );
    
    const button = screen.getByRole('button', { name: 'Custom' });
    expect(button).toBeInTheDocument();
  });

  it('disables the input when disabled prop is true', () => {
    render(
      <PromptContainerFullLineBottomActionsLarge
        value=""
        onChange={() => {}}
        onSubmit={() => {}}
        disabled={true}
      />
    );
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });

  it('disables the submit button when loading', () => {
    render(
      <PromptContainerFullLineBottomActionsLarge
        value=""
        onChange={() => {}}
        onSubmit={() => {}}
        isLoading={true}
      />
    );
    
    // Find the submit button and check if it's disabled
    const submitButton = screen.getByRole('button', { name: /send/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
});
