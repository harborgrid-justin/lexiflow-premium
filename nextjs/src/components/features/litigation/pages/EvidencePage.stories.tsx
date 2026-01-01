import type { Meta, StoryObj } from '@storybook/react';
import { EvidencePage } from './EvidencePage';

const meta: Meta<typeof EvidencePage> = {
  title: 'Components/Pages/litigation/EvidencePage',
  component: EvidencePage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof EvidencePage>;

export const Default: Story = {
  args: {
  onNavigate: () => {}
},
};
