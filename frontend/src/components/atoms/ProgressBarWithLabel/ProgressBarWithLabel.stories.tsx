import { ProgressBarWithLabel } from './ProgressBarWithLabel';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof ProgressBarWithLabel> = {
  title: 'Components/Atoms/ProgressBarWithLabel/ProgressBarWithLabel',
  component: ProgressBarWithLabel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBarWithLabel>;

export const Default: Story = {
  args: {
  "value": 42,
  "label": "Sample Text",
  variant: undefined,
  "showPercentage": true,
  "className": "Sample Text",
  "height": undefined,
  "animated": true
},
};
