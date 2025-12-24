import type { Meta, StoryObj } from '@storybook/react';
import { DocketSkeleton } from './DocketSkeleton';

const meta: Meta<typeof DocketSkeleton> = {
  title: 'Organisms/DocketSkeleton',
  component: DocketSkeleton,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DocketSkeleton>;

export const Default: Story = {
  args: {},
};
