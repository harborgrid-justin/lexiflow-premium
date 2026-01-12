import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdminPage } from './AdminPage';

const meta: Meta<typeof AdminPage> = {
  title: 'Components/Pages/operations/AdminPage',
  component: AdminPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof AdminPage>;

export const Default: Story = {
  args: {
  "initialTab": undefined
},
};
