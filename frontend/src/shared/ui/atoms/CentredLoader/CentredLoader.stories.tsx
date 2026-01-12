import type { Meta, StoryObj } from '@storybook/react-vite';
import { CentredLoader } from './CentredLoader';

const meta: Meta<typeof CentredLoader> = {
  title: 'Components/Atoms/CentredLoader/CentredLoader',
  component: CentredLoader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CentredLoader>;

export const Default: Story = {
  args: {
  "className": "Sample Text",
  "message": "Sample Text"
},
};
