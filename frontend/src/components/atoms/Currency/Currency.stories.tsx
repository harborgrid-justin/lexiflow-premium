import { Currency } from './Currency';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Currency> = {
  title: 'Components/Atoms/Currency/Currency',
  component: Currency,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Currency>;

export const Default: Story = {
  args: {
  "value": 42,
  "className": "Sample Text",
  "hideSymbol": true
},
};
