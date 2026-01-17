import { LayoutComposer } from './LayoutComposer';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof LayoutComposer> = {
  title: 'Components/Layouts/LayoutComposer/LayoutComposer',
  component: LayoutComposer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof LayoutComposer>;

export const Default: Story = {
  args: {
  "sections": [],
  direction: undefined,
  gap: undefined,
  "enableSkipLinks": true,
  "className": "Sample Text"
},
};
