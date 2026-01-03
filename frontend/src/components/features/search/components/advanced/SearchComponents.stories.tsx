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
type Story = StoryObj<typeof CategoryFilter>;

export const Default: Story = {
  args: {
    "activeCategory": undefined,
    onCategoryChange: () => { },
    "theme": {} as unknown as any
  },
};
