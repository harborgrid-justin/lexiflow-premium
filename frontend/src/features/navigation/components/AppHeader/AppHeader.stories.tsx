import type { Meta, StoryObj } from '@storybook/react';
import type { UserId } from '@/types';
import { AppHeader } from './AppHeader';

const meta: Meta<typeof AppHeader> = {
  title: 'Components/Organisms/AppHeader/AppHeader',
  component: AppHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof AppHeader>;

export const Default: Story = {
  args: {
  onToggleSidebar: () => {},
  "globalSearch": "Sample Text",
  "setGlobalSearch": () => {},
  onGlobalSearch: () => {},
  "currentUser": {
    id: '1' as UserId,
    email: 'user@example.com',
    name: 'John Doe',
    role: 'Associate',
  },
  onSwitchUser: () => {},
  onSearchResultClick: () => {},
  onNeuralCommand: () => {}
},
};
