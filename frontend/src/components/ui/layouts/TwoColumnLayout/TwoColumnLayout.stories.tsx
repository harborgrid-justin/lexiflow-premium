import type { Meta, StoryObj } from '@storybook/react';
import { TwoColumnLayout } from './TwoColumnLayout';

const meta: Meta<typeof TwoColumnLayout> = {
  title: 'Components/Layouts/TwoColumnLayout/TwoColumnLayout',
  component: TwoColumnLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TwoColumnLayout>;

export const Default: Story = {
  args: {
  "leftColumn": "<div>Sample Content</div>",
  "rightColumn": "<div>Sample Content</div>",
  "leftWidth": {},
  "gap": {},
  "stackOnMobile": true,
  "className": "Sample Text"
},
};
