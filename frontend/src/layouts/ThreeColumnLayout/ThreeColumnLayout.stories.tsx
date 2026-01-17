import { ThreeColumnLayout } from './ThreeColumnLayout';

import type { Meta, StoryObj } from '@storybook/react-vite';

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
  leftColumn: undefined,
  centerColumn: undefined,
  rightColumn: undefined,
  "leftWidth": undefined,
  "rightWidth": undefined,
  gap: undefined,
  "showOnMobile": undefined,
  "className": "Sample Text"
},
};
