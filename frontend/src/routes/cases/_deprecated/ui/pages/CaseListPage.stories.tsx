import { CaseListPage } from './CaseListPage';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof CaseListPage> = {
  title: 'Components/Pages/cases/CaseListPage',
  component: CaseListPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CaseListPage>;

export const Default: Story = {
  args: {
  onSelectCase: (caseId: string) => console.log('Selected case:', caseId)
},
};
