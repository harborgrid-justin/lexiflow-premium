import { Button } from '@/components/atoms/Button/Button';
import { Stepper } from '@/components/molecules/Stepper/Stepper';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

/**
 * Stepper component for multi-step processes.
 */

const meta: Meta<typeof Stepper> = {
  title: 'Common/Stepper',
  component: Stepper,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Step indicator for multi-step workflows.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    currentStep: {
      control: 'number',
      description: 'Index of the current active step',
    },
    steps: {
      control: 'object',
      description: 'Array of step objects',
    },
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

const steps = [
  'Case Information',
  'Parties',
  'Documents',
  'Review',
];

export const FirstStep: Story = {
  args: {
    steps: steps,
    currentStep: 0,
  },
};

export const MiddleStep: Story = {
  args: {
    steps: steps,
    currentStep: 2,
  },
};

const StepperInteractiveStory = () => {
  const [currentStep, setCurrentStep] = useState(0);
  return (
    <div className="space-y-6">
      <Stepper steps={steps} currentStep={currentStep} />
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        <Button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <StepperInteractiveStory />,
};
