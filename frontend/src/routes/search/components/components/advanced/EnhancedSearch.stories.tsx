import type { Meta, StoryObj } from '@storybook/react-vite';
import { EnhancedSearch } from './EnhancedSearch';

const meta: Meta<typeof EnhancedSearch> = {
  title: 'Components/Organisms/search/EnhancedSearch',
  component: EnhancedSearch,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof EnhancedSearch>;

export const Default: Story = {
  args: {},
};
