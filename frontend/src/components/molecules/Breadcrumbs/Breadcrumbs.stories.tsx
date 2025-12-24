import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumbs } from './Breadcrumbs';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Molecules/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {
  args: {},
};
