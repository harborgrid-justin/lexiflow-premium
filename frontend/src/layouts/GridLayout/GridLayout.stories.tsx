import { GridLayout } from './GridLayout';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof GridLayout> = {
  title: 'Components/Layouts/GridLayout/GridLayout',
  component: GridLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof GridLayout>;

export const Default: Story = {
  args: {
  children: undefined,
  columns: undefined,
  gap: undefined,
  "autoFit": true,
  "minItemWidth": "Sample Text",
  "className": "Sample Text"
},
};
