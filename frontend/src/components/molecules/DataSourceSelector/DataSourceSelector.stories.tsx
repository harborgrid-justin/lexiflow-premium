import { DataSourceSelector } from './DataSourceSelector';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof DataSourceSelector> = {
  title: 'Components/Molecules/DataSourceSelector/DataSourceSelector',
  component: DataSourceSelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DataSourceSelector>;

export const Default: Story = {
  args: {},
};
