import { Accordion } from './Accordion';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Molecules/Accordion/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  args: {
  children: undefined,
  "className": "Sample Text"
},
};
