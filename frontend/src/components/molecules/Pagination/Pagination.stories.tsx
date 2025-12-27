import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Components/Molecules/Pagination/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  args: {
  "currentPage": 42,
  "totalPages": 42,
  "onPageChange": 42,
  "className": "Sample Text"
},
};
