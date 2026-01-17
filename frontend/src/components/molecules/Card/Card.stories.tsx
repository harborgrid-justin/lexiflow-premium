import { Card } from './Card';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Card> = {
  title: 'Components/Molecules/Card/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
  children: undefined,
  "className": "Sample Text",
  "noPadding": true,
  title: undefined,
  "subtitle": "Sample Text",
  action: undefined,
  footer: undefined
},
};
