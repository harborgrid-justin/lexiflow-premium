import type { Meta, StoryObj } from '@storybook/react';
import { TimeEntryModal } from './TimeEntryModal';

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
    onClose: () => {},
    caseId: "case-1",
    onSubmit: (entry: unknown) => { console.log(entry); },
  },
};
