import type { Meta, StoryObj } from '@storybook/react';
import { CaseAnalyticsPage } from './CaseAnalyticsPage';

const meta: Meta<typeof CaseAnalyticsPage> = {
  title: 'Components/Pages/cases/CaseAnalyticsPage',
  component: CaseAnalyticsPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CaseAnalyticsPage>;

export const Default: Story = {
  args: {
  "caseId": "Sample Text"
},
};
