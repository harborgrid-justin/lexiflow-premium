import type { Meta, StoryObj } from '@storybook/react-vite';
import { StackLayout } from './StackLayout';

const meta: Meta<typeof StackLayout> = {
  title: 'Components/Layouts/StackLayout/StackLayout',
  component: StackLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof StackLayout>;

export const Default: Story = {
  args: {
  children: undefined,
  direction: undefined,
  spacing: undefined,
  align: undefined,
  justify: undefined,
  "wrap": true,
  "className": "Sample Text"
},
};
