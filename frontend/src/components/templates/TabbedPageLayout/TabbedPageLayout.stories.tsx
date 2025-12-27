import type { Meta, StoryObj } from '@storybook/react';
import { TabbedPageLayout } from '@/components';

const meta: Meta<typeof TabbedPageLayout> = {
  title: 'Templates/TabbedPageLayout',
  component: TabbedPageLayout,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TabbedPageLayout>;

export const Default: Story = {
  args: {},
};
