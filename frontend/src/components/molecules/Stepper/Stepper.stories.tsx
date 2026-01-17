import { Stepper } from './Stepper';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Stepper> = {
  title: 'Components/Molecules/Stepper/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Stepper>;

export const Default: Story = {
  args: {
  "steps": [],
  "currentStep": 42,
  "onStepClick": () => {},
  "className": "Sample Text"
},
};
