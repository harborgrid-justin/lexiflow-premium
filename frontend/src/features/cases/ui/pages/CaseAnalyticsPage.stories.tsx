import type { Meta, StoryObj } from '@storybook/react-vite';
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
