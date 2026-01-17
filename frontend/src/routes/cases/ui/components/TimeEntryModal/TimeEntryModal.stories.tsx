import { type CaseId } from '@/types';

import { TimeEntryModal } from './TimeEntryModal';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof TimeEntryModal> = {
  title: 'Components/Organisms/TimeEntryModal/TimeEntryModal',
  component: TimeEntryModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TimeEntryModal>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => { },
    caseId: 'case-1' as CaseId,
    onSave: (entry: unknown) => { console.log(entry); },
  },
};
