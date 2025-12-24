import type { Meta, StoryObj } from '@storybook/react';
import { TimeEntryModal } from './TimeEntryModal';

const meta: Meta<typeof TimeEntryModal> = {
  title: 'Organisms/TimeEntryModal',
  component: TimeEntryModal,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TimeEntryModal>;

export const Default: Story = {
  args: {},
};
