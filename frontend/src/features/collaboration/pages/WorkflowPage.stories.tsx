import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkflowPage } from './WorkflowPage';

const meta: Meta<typeof WorkflowPage> = {
  title: 'Components/Pages/collaboration/WorkflowPage',
  component: WorkflowPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof WorkflowPage>;

export const Default: Story = {
  args: {
  "caseId": "Sample Text"
},
};
