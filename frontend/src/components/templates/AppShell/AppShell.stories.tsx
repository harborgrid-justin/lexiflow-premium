import type { Meta, StoryObj } from '@storybook/react';
import { AppShell } from './AppShell';

const meta: Meta<typeof AppShell> = {
  title: 'Templates/AppShell',
  component: AppShell,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AppShell>;

export const Default: Story = {
  args: {},
};
