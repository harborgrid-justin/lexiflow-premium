import { BackendStatusIndicator } from './BackendStatusIndicator';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof BackendStatusIndicator> = {
  title: 'Components/Organisms/BackendStatusIndicator/BackendStatusIndicator',
  component: BackendStatusIndicator,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof BackendStatusIndicator>;

export const Default: Story = {
  args: {
  "showLabel": true,
  variant: undefined,
  "showPulse": true
},
};
