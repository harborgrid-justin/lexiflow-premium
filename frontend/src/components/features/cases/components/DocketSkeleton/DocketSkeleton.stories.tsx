import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocketTableSkeleton } from './DocketSkeleton';

const meta: Meta<typeof DocketTableSkeleton> = {
  title: 'Components/Organisms/DocketSkeleton/DocketTableSkeleton',
  component: DocketTableSkeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DocketTableSkeleton>;

export const Default: Story = {
  args: {},
};
