import type { Meta, StoryObj } from '@storybook/react';
import { useChartTheme } from './ChartHelpers';

// Story component wrapper for the hook
const ChartHelpersDemo = () => {
  const chartTheme = useChartTheme();
  return (
    <div className="p-4">
      <h3 className="font-bold mb-2">Chart Theme</h3>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(chartTheme, null, 2)}
      </pre>
    </div>
  );
};

const meta: Meta<typeof ChartHelpersDemo> = {
  title: 'Organisms/ChartHelpers',
  component: ChartHelpersDemo,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ChartHelpersDemo>;

export const Default: Story = {
  args: {},
};
