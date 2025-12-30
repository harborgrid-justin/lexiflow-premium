import type { Meta, StoryObj } from '@storybook/react';
import { DiscoveryPage } from './DiscoveryPage';

const meta: Meta<typeof DiscoveryPage> = {
  title: 'Components/Pages/litigation/DiscoveryPage',
  component: DiscoveryPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DiscoveryPage>;

export const Default: Story = {
  args: {
  "onNavigate": () => {}
},
};
