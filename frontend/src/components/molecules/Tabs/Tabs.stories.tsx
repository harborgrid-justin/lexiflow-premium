import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Molecules/Tabs/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  args: {
  "tabs": "Sample Text",
  "activeTab": "Sample Text",
  "onChange": "Sample Text",
  "className": "Sample Text",
  "variant": {}
},
};
