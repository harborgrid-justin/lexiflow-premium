import type { Meta, StoryObj } from '@storybook/react';
import { AppShellLayout } from './AppShellLayout';

const meta: Meta<typeof AppShellLayout> = {
  title: 'Components/Layouts/AppShellLayout/AppShellLayout',
  component: AppShellLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof AppShellLayout>;

export const Default: Story = {
  args: {
  "sidebar": "<div>Sample Content</div>",
  "headerContent": "<div>Sample Content</div>",
  "children": "<div>Sample Content</div>",
  "activeView": "Sample Text",
  "onNavigate": "Sample Text",
  "selectedCaseId": "Sample Text"
},
};
