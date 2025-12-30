import type { Meta, StoryObj } from '@storybook/react';
import { useChartTheme } from './ChartHelpers';

// This module exports hooks, not components. Story disabled.
const DemoComponent = () => {
  const chartTheme = useChartTheme();
  return <div>Chart theme loaded: {JSON.stringify(chartTheme, null, 2)}</div>;
};

const meta: Meta<typeof DemoComponent> = {
  title: 'Components/Organisms/ChartHelpers/ChartHelpers',
  component: DemoComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DemoComponent>;

export const Default: Story = {
  args: {},
};
