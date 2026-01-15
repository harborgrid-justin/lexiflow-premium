import type { Meta, StoryObj } from '@storybook/react-vite';
import { InfoGrid } from './InfoGrid';

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
