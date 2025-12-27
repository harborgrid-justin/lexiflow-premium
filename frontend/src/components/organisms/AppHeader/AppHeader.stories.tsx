import type { Meta, StoryObj } from '@storybook/react';
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
  "onToggleSidebar": {},
  "globalSearch": "Sample Text",
  "setGlobalSearch": "Sample Text",
  "onGlobalSearch": {},
  "currentUser": {},
  "onSwitchUser": {},
  "onSearchResultClick": {},
  "onNeuralCommand": {}
},
};
