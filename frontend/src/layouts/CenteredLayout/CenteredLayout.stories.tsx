import { CenteredLayout } from './CenteredLayout';

import type { Meta, StoryObj } from '@storybook/react-vite';

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
  children: undefined,
  maxWidth: undefined,
  "verticalCenter": true,
  "className": "Sample Text"
},
};
