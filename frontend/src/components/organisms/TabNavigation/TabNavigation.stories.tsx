import type { Meta, StoryObj } from '@storybook/react';
import { TabNavigation } from './TabNavigation';

const meta: Meta<typeof TabNavigation> = {
  title: 'Components/Organisms/TabNavigation/TabNavigation',
  component: TabNavigation,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TabNavigation>;

export const Default: Story = {
  args: {
  "tabs": [],
  "activeTab": "Sample Text",
  "onTabChange": "Sample Text",
  "className": "Sample Text"
},
};
