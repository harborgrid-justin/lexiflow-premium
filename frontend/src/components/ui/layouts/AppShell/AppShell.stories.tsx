import type { Meta, StoryObj } from '@storybook/react';
import { AppShell } from './AppShell';

const meta: Meta<typeof AppShell> = {
  title: 'Components/Templates/AppShell/AppShell',
  component: AppShell,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof AppShell>;

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
