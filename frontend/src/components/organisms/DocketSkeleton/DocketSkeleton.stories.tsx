import type { Meta, StoryObj } from '@storybook/react';
import { DocketSkeleton } from './DocketSkeleton';

const meta: Meta<typeof DocketSkeleton> = {
  title: 'Components/Organisms/DocketSkeleton/DocketSkeleton',
  component: DocketSkeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DocketSkeleton>;

export const Default: Story = {
  args: {},
};
