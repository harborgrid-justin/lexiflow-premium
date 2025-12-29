import type { Meta, StoryObj } from '@storybook/react';
import { CategoryFilter } from './SearchComponents';

const meta: Meta<typeof CategoryFilter> = {
  title: 'Components/Organisms/SearchComponents/SearchComponents',
  component: CategoryFilter,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SearchComponents>;

export const Default: Story = {
  args: {
  "activeCategory": {},
  "onCategoryChange": {},
  "theme": "Sample Text"
},
};
