import type { Meta, StoryObj } from '@storybook/react';
import { StatusDot } from './StatusDot';

const meta: Meta<typeof StatusDot> = {
  title: 'Components/Atoms/StatusDot/StatusDot',
  component: StatusDot,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof StatusDot>;

export const Default: Story = {
  args: {
  "status": "Sample Text",
  "size": "Sample Text",
  "className": "Sample Text"
},
};
