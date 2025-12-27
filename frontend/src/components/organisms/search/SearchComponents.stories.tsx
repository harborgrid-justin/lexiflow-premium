import type { Meta, StoryObj } from '@storybook/react';
import { SearchComponents } from './SearchComponents';

const meta: Meta<typeof SearchComponents> = {
  title: 'Components/Organisms/search/SearchComponents',
  component: SearchComponents,
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
