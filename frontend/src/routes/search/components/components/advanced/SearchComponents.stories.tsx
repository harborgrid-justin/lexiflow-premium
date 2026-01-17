import { CategoryFilter } from './SearchComponents';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof CategoryFilter> = {
  title: 'Components/Organisms/SearchComponents/SearchComponents',
  component: CategoryFilter,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CategoryFilter>;

export const Default: Story = {
  args: {
    onCategoryChange: () => { },
    "theme": { text: { secondary: '', primary: '' }, surface: { highlight: '' } }
  },
};
