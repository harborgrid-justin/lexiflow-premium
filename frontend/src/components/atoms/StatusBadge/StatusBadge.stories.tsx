import { StatusBadge } from './StatusBadge';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof StatusBadge> = {
  title: 'Components/Atoms/StatusBadge/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Default: Story = {
  args: {
  "status": "Sample Text",
  "className": "Sample Text",
  "variantOverride": undefined
},
};
