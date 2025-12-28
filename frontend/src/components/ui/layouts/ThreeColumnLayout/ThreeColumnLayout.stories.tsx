import type { Meta, StoryObj } from '@storybook/react';
import { ThreeColumnLayout } from './ThreeColumnLayout';

const meta: Meta<typeof ThreeColumnLayout> = {
  title: 'Components/Layouts/ThreeColumnLayout/ThreeColumnLayout',
  component: ThreeColumnLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ThreeColumnLayout>;

export const Default: Story = {
  args: {
  "leftColumn": "<div>Sample Content</div>",
  "centerColumn": "<div>Sample Content</div>",
  "rightColumn": "<div>Sample Content</div>",
  "leftWidth": {},
  "rightWidth": {},
  "gap": {},
  "showOnMobile": {},
  "className": "Sample Text"
},
};
