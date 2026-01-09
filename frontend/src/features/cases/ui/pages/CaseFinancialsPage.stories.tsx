import type { Meta, StoryObj } from '@storybook/react-vite';
import { CaseFinancialsPage } from './CaseFinancialsPage';

const meta: Meta<typeof CaseFinancialsPage> = {
  title: 'Components/Pages/cases/CaseFinancialsPage',
  component: CaseFinancialsPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CaseFinancialsPage>;

export const Default: Story = {
  args: {
  "caseId": "Sample Text"
},
};
