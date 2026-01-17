import { SearchInput } from './SearchInput';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof SearchInput> = {
  title: 'Components/Molecules/SearchInput/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  args: {},
};
