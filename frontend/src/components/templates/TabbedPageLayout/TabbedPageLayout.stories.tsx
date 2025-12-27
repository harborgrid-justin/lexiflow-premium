import type { Meta, StoryObj } from '@storybook/react';
import { TabbedPageLayout } from './TabbedPageLayout';

const meta: Meta<typeof TabbedPageLayout> = {
  title: 'Components/Templates/TabbedPageLayout/TabbedPageLayout',
  component: TabbedPageLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TabbedPageLayout>;

export const Default: Story = {
  args: {
  "pageTitle": "Sample Text",
  "pageSubtitle": "Sample Text",
  "pageActions": "<div>Sample Content</div>",
  "tabConfig": [],
  "children": "<div>Sample Content</div>",
  "activeTabId": "Sample Text",
  "onTabChange": "Sample Text"
},
};
