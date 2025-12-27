import type { Meta, StoryObj } from '@storybook/react';
import { CaseOperationsPage } from './CaseOperationsPage';

const meta: Meta<typeof CaseOperationsPage> = {
  title: 'Components/Pages/cases/CaseOperationsPage',
  component: CaseOperationsPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CaseOperationsPage>;

export const Default: Story = {
  args: {
  "caseId": "Sample Text"
},
};
