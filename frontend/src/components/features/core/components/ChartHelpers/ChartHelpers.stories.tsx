import type { Meta, StoryObj } from '@storybook/react';
import { useChartTheme } from './ChartHelpers';

// Wrapper component for stories since useChartTheme is a hook
const ChartHelpersDemo = () => {
  const chartTheme = useChartTheme();
  return <div><pre>{JSON.stringify(chartTheme, null, 2)}</pre></div>;
};

const meta: Meta<typeof ChartHelpersDemo> = {
  title: 'Components/Organisms/ChartHelpers/ChartHelpers',
  component: ChartHelpersDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ChartHelpers>;

export const Default: Story = {
  args: {},
};
