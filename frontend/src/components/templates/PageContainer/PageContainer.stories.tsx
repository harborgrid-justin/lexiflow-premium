import type { Meta, StoryObj } from '@storybook/react';
import { PageContainer } from './PageContainer';

const meta: Meta<typeof PageContainer> = {
  title: 'Templates/PageContainer',
  component: PageContainer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PageContainer>;

export const Default: Story = {
  args: {},
};
