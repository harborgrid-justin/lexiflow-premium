import { CaseOverviewPage } from './CaseOverviewPage';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof CaseOverviewPage> = {
  title: 'Components/Pages/cases/CaseOverviewPage',
  component: CaseOverviewPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CaseOverviewPage>;

export const Default: Story = {
  args: {
  "caseId": "Sample Text"
},
};
