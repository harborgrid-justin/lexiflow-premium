import type { Meta, StoryObj } from '@storybook/react';
import { DashboardPage } from './DashboardPage';

const meta: Meta<typeof DashboardPage> = {
  title: 'Components/Pages/dashboard/DashboardPage',
  component: DashboardPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DashboardPage>;

export const Default: Story = {
  args: {
  "onSelectCase": "Sample Text",
  "currentUser": {},
  "initialTab": "Sample Text"
},
};
