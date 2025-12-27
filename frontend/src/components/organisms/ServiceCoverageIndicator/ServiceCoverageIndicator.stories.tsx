import type { Meta, StoryObj } from '@storybook/react';
import { ServiceCoverageIndicator } from './ServiceCoverageIndicator';

const meta: Meta<typeof ServiceCoverageIndicator> = {
  title: 'Components/Organisms/ServiceCoverageIndicator/ServiceCoverageIndicator',
  component: ServiceCoverageIndicator,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ServiceCoverageIndicator>;

export const Default: Story = {
  args: {
  "className": "Sample Text",
  "compact": true
},
};
