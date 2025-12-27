import type { Meta, StoryObj } from '@storybook/react';
import { Stepper } from './Stepper';

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
  "steps": "Sample Text",
  "currentStep": 42,
  "onStepClick": 42,
  "className": "Sample Text"
},
};
