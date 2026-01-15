import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchInputBar } from './SearchInputBar';

const meta: Meta<typeof SearchInputBar> = {
  title: 'Components/Molecules/SearchInputBar/SearchInputBar',
  component: SearchInputBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SearchInputBar>;

export const Default: Story = {
  args: {},
};
