import type { Meta, StoryObj } from '@storybook/react-vite';
import { TabStrip } from './TabStrip';

const meta: Meta<typeof TabStrip> = {
  title: 'Components/Molecules/TabStrip/TabStrip',
  component: TabStrip,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TabStrip>;

export const Default: Story = {
  args: {
  children: undefined,
  "className": "Sample Text"
},
};
