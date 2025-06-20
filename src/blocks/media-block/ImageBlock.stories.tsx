import type { Meta, StoryObj } from '@storybook/react';
import { ImageBlock } from './ImageBlock';

const meta = {
  title: 'Blocks/Media/ImageBlock',
  component: ImageBlock,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A responsive image component with zoom functionality. Click on the image to zoom in/out.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    src: { 
      control: 'text',
      description: 'Image source URL. If not provided, a random image from picsum.photos will be used.'
    },
    alt: { 
      control: 'text',
      description: 'Alt text for accessibility'
    },
    caption: { 
      control: 'text',
      description: 'Optional caption text displayed below the image'
    },
    width: { 
      control: 'number',
      description: 'Width of the image in pixels'
    },
    height: { 
      control: 'number',
      description: 'Height of the image in pixels'
    },
    rounded: { 
      control: 'boolean',
      description: 'Whether to apply border radius to the image'
    },
    zoomable: { 
      control: 'boolean',
      description: 'Whether the image can be zoomed on click'
    },
  },
  args: {
    alt: 'Random image from picsum.photos',
    width: 800,
    height: 450,
    rounded: true,
    zoomable: true
  },
} satisfies Meta<typeof ImageBlock>;

export default meta;

type Story = StoryObj<typeof ImageBlock>;

export const Default: Story = {
  args: {
    alt: 'Random image from picsum.photos',
    caption: 'Click to zoom',
    width: 800,
    height: 450,
    rounded: true,
    zoomable: true,
  },
};

/**
 * A dynamic story that allows configuring various image properties.
 * You can customize the image source, dimensions, and appearance.
 */
export const WithCustomImage: Story = {
  args: {
    src: 'https://picsum.photos/800/450',
    alt: 'Custom image',
    caption: 'Customize me in the Controls panel',
    width: 600,
    height: 400,
    rounded: true,
    zoomable: true,
  },
  argTypes: {
    src: {
      control: 'text',
      description: 'Image source URL. Try: https://picsum.photos/800/450?random=1',
    },
    alt: {
      control: 'text',
      description: 'Alt text for accessibility',
    },
    caption: {
      control: 'text',
      description: 'Optional caption text displayed below the image',
    },
    width: {
      control: { type: 'range', min: 100, max: 1200, step: 50 },
      description: 'Image width in pixels',
    },
    height: {
      control: { type: 'range', min: 100, max: 1200, step: 50 },
      description: 'Image height in pixels',
    },
    rounded: {
      control: 'boolean',
      description: 'Apply rounded corners to the image',
    },
    zoomable: {
      control: 'boolean',
      description: 'Enable zoom on click',
    },
  },
  parameters: {
    controls: { 
      expanded: true,
      sort: 'requiredFirst',
    },
  },
};

export const WithoutZoom: Story = {
  args: {
    alt: 'Non-zoomable image',
    caption: 'This image cannot be zoomed',
    width: 600,
    height: 400,
    zoomable: false,
  },
};
