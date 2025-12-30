import type { Meta, StoryObj } from '@storybook/react';
import type { UserId } from '@/types';
import { DashboardPage } from './DashboardPage';

const meta: Meta<typeof DashboardPage> = {
  title: 'Components/Pages/dashboard/DashboardPage',
  component: DashboardPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DashboardPage>;

export const Default: Story = {
  args: {
  "onSelectCase": () => {},
  "currentUser": {
    id: '1' as UserId,
    email: 'user@example.com',
    name: 'John Doe',
    role: 'Associate',
  },
  "initialTab": "Sample Text"
},
};
