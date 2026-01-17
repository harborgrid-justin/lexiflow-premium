import { TabbedPageLayout } from './TabbedPageLayout';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof TabbedPageLayout> = {
  title: 'Components/Layouts/TabbedPageLayout/TabbedPageLayout',
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
  pageActions: undefined,
  "tabConfig": [],
  children: undefined,
  "activeTabId": "Sample Text",
  "onTabChange": () => {}
},
};
