import type { Meta, StoryObj } from '@storybook/react';
import { ManagerLayout } from './ManagerLayout';

const meta: Meta<typeof ManagerLayout> = {
  title: 'Components/Layouts/ManagerLayout/ManagerLayout',
  component: ManagerLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ManagerLayout>;

export const Default: Story = {
  args: {
  "title": "Sample Text",
  "subtitle": "Sample Text",
  "actions": "<div>Sample Content</div>",
  "filterPanel": "<div>Sample Content</div>",
  "children": "<div>Sample Content</div>",
  "sidebar": "<div>Sample Content</div>",
  "className": "Sample Text",
  "sidebarWidth": {}
},
};
