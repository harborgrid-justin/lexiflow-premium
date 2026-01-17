import { MobileBottomNav } from './MobileBottomNav';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof MobileBottomNav> = {
  title: 'Components/Organisms/MobileBottomNav/MobileBottomNav',
  component: MobileBottomNav,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof MobileBottomNav>;

export const Default: Story = {
  args: {
  "activeView": "dashboard",
  "setActiveView": () => {}
},
};
