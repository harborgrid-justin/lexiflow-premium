import { InfoGrid } from './InfoGrid';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof InfoGrid> = {
  title: 'Components/Molecules/InfoGrid/InfoGrid',
  component: InfoGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof InfoGrid>;

export const Default: Story = {
  args: {
  "items": [],
  "cols": 42
},
};
