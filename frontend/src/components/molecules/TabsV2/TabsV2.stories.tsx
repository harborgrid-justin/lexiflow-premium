import { TabsV2 } from './TabsV2';

import type { Meta, StoryObj } from '@storybook/react-vite';

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
  "onChange": () => {},
  "className": "Sample Text",
  size: undefined,
  "compactSubTabs": true
},
};
