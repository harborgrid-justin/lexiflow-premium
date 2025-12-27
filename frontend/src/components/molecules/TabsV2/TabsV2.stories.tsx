import type { Meta, StoryObj } from '@storybook/react';
import { TabsV2 } from './TabsV2';

const meta: Meta<typeof TabsV2> = {
  title: 'Components/Molecules/TabsV2/TabsV2',
  component: TabsV2,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TabsV2>;

export const Default: Story = {
  args: {
  "tabs": [],
  "activeTabId": "Sample Text",
  "onChange": "Sample Text",
  "className": "Sample Text",
  "size": {},
  "compactSubTabs": true
},
};
