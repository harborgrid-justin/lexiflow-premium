import type { Meta, StoryObj } from '@storybook/react';
import { CenteredLayout } from './CenteredLayout';

const meta: Meta<typeof CenteredLayout> = {
  title: 'Components/Layouts/CenteredLayout/CenteredLayout',
  component: CenteredLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CenteredLayout>;

export const Default: Story = {
  args: {
  "children": "<div>Sample Content</div>",
  "maxWidth": {},
  "verticalCenter": true,
  "className": "Sample Text"
},
};
