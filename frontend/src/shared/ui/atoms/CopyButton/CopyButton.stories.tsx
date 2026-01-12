import type { Meta, StoryObj } from '@storybook/react-vite';
import { CopyButton } from './CopyButton';

const meta: Meta<typeof CopyButton> = {
  title: 'Components/Atoms/CopyButton/CopyButton',
  component: CopyButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CopyButton>;

export const Default: Story = {
  args: {
  "text": "Sample Text",
  "label": "Sample Text",
  variant: undefined,
  size: undefined
},
};
