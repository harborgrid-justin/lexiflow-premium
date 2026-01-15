import type { Meta, StoryObj } from '@storybook/react-vite';
import { LazyImage } from './LazyImage';

const meta: Meta<typeof LazyImage> = {
  title: 'Components/Atoms/LazyImage/LazyImage',
  component: LazyImage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof LazyImage>;

export const Default: Story = {
  args: {},
};
