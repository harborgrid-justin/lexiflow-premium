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
  sidebar: undefined,
  headerContent: undefined,
  children: undefined,
  "activeView": "Sample Text",
  "onNavigate": () => {},
  "selectedCaseId": "Sample Text"
},
};
