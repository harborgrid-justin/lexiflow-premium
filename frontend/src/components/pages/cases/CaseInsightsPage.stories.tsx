import type { Meta, StoryObj } from '@storybook/react';
import { CaseInsightsPage } from './CaseInsightsPage';

const meta: Meta<typeof CaseInsightsPage> = {
  title: 'Components/Pages/cases/CaseInsightsPage',
  component: CaseInsightsPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CaseInsightsPage>;

export const Default: Story = {
  args: {
  "caseId": "Sample Text"
},
};
