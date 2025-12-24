import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stepper } from '../../components/common/Stepper';
import { ThemeProvider } from '@/providers/ThemeContext';
import React, { useState } from 'react';
import { Button } from '../../components/common/Button';

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
  },
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <div className="p-8 bg-white dark:bg-slate-900 w-[600px]">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

const steps = [
  { id: '1', label: 'Case Information', description: 'Enter basic details' },
  { id: '2', label: 'Parties', description: 'Add involved parties' },
  { id: '3', label: 'Documents', description: 'Upload documents' },
  { id: '4', label: 'Review', description: 'Confirm and submit' },
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

export const Interactive: Story = {
  render: () => {
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
  },
};
