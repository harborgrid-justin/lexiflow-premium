import type { Meta, StoryObj } from '@storybook/react';
import { DocketTableSkeleton } from './DocketSkeleton';

const meta: Meta<typeof DocketTableSkeleton> = {
  title: 'Organisms/DocketSkeleton',
  component: DocketTableSkeleton,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DocketTableSkeleton>;

export const Default: Story = {
  args: {
    rows: 10,
  },
};
