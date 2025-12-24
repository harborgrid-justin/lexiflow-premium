import type { Meta, StoryObj } from '@storybook/react';
import { DynamicBreadcrumbs } from './DynamicBreadcrumbs';

const meta: Meta<typeof DynamicBreadcrumbs> = {
  title: 'Molecules/DynamicBreadcrumbs',
  component: DynamicBreadcrumbs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DynamicBreadcrumbs>;

export const Default: Story = {
  args: {},
};
