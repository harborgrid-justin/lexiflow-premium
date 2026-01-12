import type { Meta, StoryObj } from '@storybook/react-vite';
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
  "steps": [],
  "currentStep": 42,
  "onStepClick": () => {},
  "className": "Sample Text"
},
};
