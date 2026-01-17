import { AppHeader } from './AppHeader';

import type { UserId } from '@/types';
import type { Meta, StoryObj } from '@storybook/react-vite';

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
    onToggleSidebar: () => { },
    "globalSearch": "Sample Text",
    "setGlobalSearch": () => { },
    onGlobalSearch: () => { },
    "currentUser": {
      id: '1' as UserId,
      email: 'user@example.com',
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      role: 'Associate',
    },
    onSwitchUser: () => { },
    onSearchResultClick: () => { },
    onNeuralCommand: () => { }
  },
};
