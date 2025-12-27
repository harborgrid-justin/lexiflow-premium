import type { Meta, StoryObj } from '@storybook/react';
import { DescriptionList } from '@/components';

const meta: Meta<typeof DescriptionList> = {
  title: 'Molecules/DescriptionList',
  component: DescriptionList,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DescriptionList>;

export const Default: Story = {
  args: {},
};
