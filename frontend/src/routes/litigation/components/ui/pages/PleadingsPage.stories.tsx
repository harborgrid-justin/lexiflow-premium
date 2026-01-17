import { PleadingsPage } from './PleadingsPage';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof PleadingsPage> = {
  title: 'Components/Pages/litigation/PleadingsPage',
  component: PleadingsPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PleadingsPage>;

export const Default: Story = {
  args: {
  onCreate: () => {},
  "onEdit": () => {},
  "caseId": "Sample Text"
},
};
