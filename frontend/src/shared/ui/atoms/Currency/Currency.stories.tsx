import type { Meta, StoryObj } from '@storybook/react-vite';
import { Currency } from './Currency';

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
