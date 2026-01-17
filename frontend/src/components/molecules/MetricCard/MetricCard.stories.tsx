import { MetricCard } from './MetricCard';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof MetricCard> = {
  title: 'Components/Molecules/MetricCard/MetricCard',
  component: MetricCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof MetricCard>;

export const Default: Story = {
  args: {
  "label": "Sample Text",
  "value": "Sample Text",
  icon: undefined,
  "trend": "Sample Text",
  "trendUp": true,
  "className": "Sample Text",
  "isLive": true,
  "sparklineData": []
},
};
