import { Stats } from './Stats';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Stats> = {
  title: 'Components/Molecules/Stats/Stats',
  component: Stats,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Stats>;

export const Default: Story = {
  args: {
  "items": []
},
};
