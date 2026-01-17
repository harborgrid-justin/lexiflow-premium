import { PerformanceMonitor } from './PerformanceMonitor';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof PerformanceMonitor> = {
  title: 'Components/Layouts/PerformanceMonitor/PerformanceMonitor',
  component: PerformanceMonitor,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PerformanceMonitor>;

export const Default: Story = {
  args: {
  children: undefined,
  "componentName": "Sample Text",
  "renderBudget": 42,
  "showIndicators": true,
  onBudgetExceeded: () => {}
},
};
