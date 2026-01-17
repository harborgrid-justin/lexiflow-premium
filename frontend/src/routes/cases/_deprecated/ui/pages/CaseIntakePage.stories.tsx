import { CaseIntakePage } from './CaseIntakePage';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof CaseIntakePage> = {
  title: 'Components/Pages/cases/CaseIntakePage',
  component: CaseIntakePage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CaseIntakePage>;

export const Default: Story = {
  args: {
  "onComplete": (caseId: string) => { console.log('Case completed:', caseId); },
  "onCancel": () => { console.log('Case cancelled'); }
},
};
