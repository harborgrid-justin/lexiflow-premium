import type { Meta, StoryObj } from '@storybook/react-vite';
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
  actions: undefined,
  filterPanel: undefined,
  children: undefined,
  sidebar: undefined,
  "className": "Sample Text",
  sidebarWidth: undefined
},
};
