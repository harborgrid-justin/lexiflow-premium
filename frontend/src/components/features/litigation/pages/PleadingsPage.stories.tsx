import type { Meta, StoryObj } from '@storybook/react';
import { PleadingsPage } from './PleadingsPage';

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
  "onCreate": {},
  "onEdit": "Sample Text",
  "caseId": "Sample Text"
},
};
