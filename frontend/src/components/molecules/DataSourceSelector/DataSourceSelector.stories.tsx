import type { Meta, StoryObj } from '@storybook/react';
import { DataSourceSelector } from './DataSourceSelector';

const meta: Meta<typeof DataSourceSelector> = {
  title: 'Molecules/DataSourceSelector',
  component: DataSourceSelector,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataSourceSelector>;

export const Default: Story = {
  args: {},
};
