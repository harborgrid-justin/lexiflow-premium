import type { Meta, StoryObj } from '@storybook/react-vite';
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
  sidebar: undefined,
  headerContent: undefined,
  children: undefined,
  "activeView": "Sample Text",
  "onNavigate": () => {},
  "selectedCaseId": "Sample Text"
},
};
