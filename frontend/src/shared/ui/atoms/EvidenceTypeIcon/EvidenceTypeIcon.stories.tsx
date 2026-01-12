import type { Meta, StoryObj } from '@storybook/react-vite';
import { EvidenceTypeIcon } from './EvidenceTypeIcon';

const meta: Meta<typeof EvidenceTypeIcon> = {
  title: 'Components/Atoms/EvidenceTypeIcon/EvidenceTypeIcon',
  component: EvidenceTypeIcon,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof EvidenceTypeIcon>;

export const Default: Story = {
  args: {
  type: undefined,
  "className": "Sample Text"
},
};
