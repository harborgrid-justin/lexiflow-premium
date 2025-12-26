import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from '@/components/atoms/ProgressBar';
import { ThemeProvider } from '@/providers/ThemeContext';

/**
 * ProgressBar component for displaying progress indicators.
 */

const meta: Meta<typeof ProgressBar> = {
  title: 'Common/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Progress bar for visualizing completion status.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Progress bar label',
    },
    value: {
      control: { type: 'range', min: 0, max: 100 },
      description: 'Current progress value (0-100)',
    },
    colorClass: {
      control: 'text',
      description: 'Custom color class for the progress bar',
    },
    showValue: {
      control: 'boolean',
      description: 'Show percentage value',
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <div className="p-8 bg-white dark:bg-slate-900 w-[400px]">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Low: Story = {
  args: {
    label: 'Upload Progress',
    value: 25,
  },
};

export const Medium: Story = {
  args: {
    label: 'Processing Documents',
    value: 50,
  },
};

export const High: Story = {
  args: {
    label: 'Case Analysis',
    value: 75,
  },
};

export const Complete: Story = {
  args: {
    label: 'Completed',
    value: 100,
  },
};
