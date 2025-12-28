import type { Meta, StoryObj } from '@storybook/react';
import { SplitViewLayout } from './SplitViewLayout';

const meta: Meta<typeof SplitViewLayout> = {
  title: 'Components/Layouts/SplitViewLayout/SplitViewLayout',
  component: SplitViewLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SplitViewLayout>;

export const Default: Story = {
  args: {
  "sidebar": "<div>Sample Content</div>",
  "content": "<div>Sample Content</div>",
  "showSidebarOnMobile": true,
  "sidebarPosition": {},
  "sidebarWidth": {},
  "className": "Sample Text"
},
};
