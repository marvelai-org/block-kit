// Type declarations for @vibing-ai/block-kit
declare module '@vibing-ai/block-kit' {
  import { ReactNode, ComponentProps, HTMLAttributes, FormEvent } from 'react';

  // Theme types
  export type ThemeType = 'light' | 'dark' | CustomTheme;
  interface CustomTheme {
    type: 'light' | 'dark';
    primary?: string;
    secondary?: string;
    // Add other theme properties as needed
  }

  // Props types
  interface BlockKitProviderProps {
    children: ReactNode;
    theme?: ThemeType;
    useSystemTheme?: boolean;
  }

  interface TextBlockProps {
    id: string;
    heading?: string;
    content?: string;
    headingClassName?: string;
    contentClassName?: string;
    variant?: 'paragraph' | 'heading' | 'subheading' | 'caption';
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  }

  interface BlockContainerProps extends HTMLAttributes<HTMLDivElement> {
    id: string;
    children?: ReactNode;
    className?: string;
    spacing?: 'sm' | 'md' | 'lg' | 'xl';
    as?: keyof JSX.IntrinsicElements | React.ComponentType<unknown>;
    onSubmit?: (e: FormEvent) => void;
  }

  interface ButtonProps {
    children?: ReactNode;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'primary';
    size?: 'default' | 'sm' | 'lg';
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
  }

  interface SurfaceProps {
    children?: ReactNode;
    className?: string;
  }

  interface VisualBlockProps {
    id: string;
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
  }

  interface InputBlockProps {
    id: string;
    label?: string;
    description?: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'checkbox';
    placeholder?: string;
    value?: string;
    checked?: boolean;
    onChange?: (value: unknown) => void;
    required?: boolean;
    className?: string;
  }

  interface ActionBlockProps {
    id: string;
    children?: ReactNode;
    className?: string;
  }

  interface ImageBlockProps {
    id: string;
    src: string;
    alt: string;
    caption?: string;
    width?: string | number;
    height?: string | number;
    rounded?: boolean;
    loading?: 'eager' | 'lazy';
  }

  interface CodeBlockProps {
    id: string;
    code: string;
    language?: string;
    showLineNumbers?: boolean;
    highlight?: string;
    className?: string;
  }

  interface IframeBlockProps {
    id: string;
    src: string;
    title: string;
    width?: string | number;
    height?: string | number;
    allowFullScreen?: boolean;
    sandbox?: string;
  }

  interface FormBlockProps {
    id: string;
    children?: ReactNode;
    onSubmit?: (data: unknown) => void;
    className?: string;
  }

  interface AIChatBlockProps {
    id: string;
    messages?: Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
    }>;
    onSend?: (message: string) => void;
    isLoading?: boolean;
    placeholder?: string;
  }

  interface TableBlockProps {
    id: string;
    data: Array<Record<string, unknown>>;
    columns: Array<{
      header: string;
      accessor: string;
    }>;
    striped?: boolean;
    bordered?: boolean;
    compact?: boolean;
  }

  interface FlowBlockProps {
    id: string;
    nodes: Array<{
      id: string;
      type: string;
      position: { x: number; y: number };
      data: unknown;
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      type?: string;
    }>;
  }

  interface WidgetProps {
    id: string;
    title: string;
    children: ReactNode;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    actions?: Array<{
      id: string;
      icon: string;
      tooltip: string;
      onClick: () => void;
    }>;
    statusIndicator?: {
      status: 'success' | 'warning' | 'error' | 'info';
      label: string;
    };
  }

  interface BlockModalProps {
    id: string;
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children?: ReactNode;
    footer?: ReactNode;
  }

  interface ContextPanelProps {
    id: string;
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children?: ReactNode;
    position?: 'left' | 'right';
    width?: string | number;
  }

  interface CommandBarProps {
    id: string;
    isOpen: boolean;
    onClose: () => void;
    onSearch?: (value: string) => void;
    commands?: Array<{
      id: string;
      name: string;
      description?: string;
      icon?: string;
      shortcut?: string;
      action: () => void;
    }>;
  }

  interface NotificationToastProps {
    id: string;
    title: string;
    description?: string;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    duration?: number;
    onClose?: () => void;
  }

  interface ToolPaletteProps {
    id: string;
    tools: Array<{
      id: string;
      name: string;
      icon: string;
      action: () => void;
    }>;
    position?: 'top' | 'bottom' | 'left' | 'right';
    orientation?: 'horizontal' | 'vertical';
  }

  interface CanvasBlockProps {
    id: string;
    children?: ReactNode;
    width?: string | number;
    height?: string | number;
    interactive?: boolean;
  }

  interface FormBuilderProps {
    id: string;
    fields: Array<{
      id: string;
      type: string;
      label: string;
      name: string;
      required?: boolean;
      options?: Array<{ label: string; value: string }>;
    }>;
    onSubmit?: (data: unknown) => void;
  }

  interface ConversationCardProps {
    id: string;
    title: string;
    description?: string;
    messages?: Array<{
      id: string;
      role: 'user' | 'assistant' | 'system';
      content: string;
      timestamp?: Date;
    }>;
    isActive?: boolean;
    onClick?: () => void;
  }

  // Component exports
  export function BlockKitProvider(props: BlockKitProviderProps): JSX.Element;
  export function TextBlock(props: TextBlockProps): JSX.Element;
  export function BlockContainer(props: BlockContainerProps): JSX.Element;
  export function Button(props: ButtonProps): JSX.Element;
  export function Surface(props: SurfaceProps): JSX.Element;
  export function VisualBlock(props: VisualBlockProps): JSX.Element;
  export function InputBlock(props: InputBlockProps): JSX.Element;
  export function ActionBlock(props: ActionBlockProps): JSX.Element;
  export function CodeBlock(props: CodeBlockProps): JSX.Element;
  export function ImageBlock(props: ImageBlockProps): JSX.Element;
  export function IframeBlock(props: IframeBlockProps): JSX.Element;
  export function FormBlock(props: FormBlockProps): JSX.Element;
  export function AIChatBlock(props: AIChatBlockProps): JSX.Element;
  export function TableBlock(props: TableBlockProps): JSX.Element;
  export function FlowBlock(props: FlowBlockProps): JSX.Element;
  export function Widget(props: WidgetProps): JSX.Element;
  export function BlockModal(props: BlockModalProps): JSX.Element;
  export function ContextPanel(props: ContextPanelProps): JSX.Element;
  export function CommandBar(props: CommandBarProps): JSX.Element;
  export function NotificationToast(props: NotificationToastProps): JSX.Element;
  export function ToolPalette(props: ToolPaletteProps): JSX.Element;
  export function CanvasBlock(props: CanvasBlockProps): JSX.Element;
  export function FormBuilder(props: FormBuilderProps): JSX.Element;
  export function ConversationCard(props: ConversationCardProps): JSX.Element;
  export function PromptContainerFullLineBottomActionsBlock(
    props: PromptContainerFullLineBottomActionsBlockProps
  ): JSX.Element;

  // Theme utilities
  export function createCustomTheme(options: CustomTheme): CustomTheme;
}
