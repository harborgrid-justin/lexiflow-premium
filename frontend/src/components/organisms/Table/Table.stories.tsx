import type { Meta, StoryObj } from '@storybook/react-vite';
import { TableContainer } from './Table';

const meta: Meta<typeof TableContainer> = {
  title: 'Components/Organisms/Table/Table',
  component: TableContainer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TableContainer>;

export const Default: Story = {
  args: {},
};
