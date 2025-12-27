import type { Meta, StoryObj } from '@storybook/react';
import { EvidenceTypeIcon } from '@/components';

const meta: Meta<typeof EvidenceTypeIcon> = {
  title: 'Atoms/EvidenceTypeIcon',
  component: EvidenceTypeIcon,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EvidenceTypeIcon>;

export const Default: Story = {
  args: {},
};
