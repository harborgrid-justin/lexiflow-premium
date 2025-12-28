import type { Meta, StoryObj } from '@storybook/react';
import { GlobalHotkeys } from './GlobalHotkeys';

const meta: Meta<typeof GlobalHotkeys> = {
  title: 'Components/Organisms/GlobalHotkeys/GlobalHotkeys',
  component: GlobalHotkeys,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof GlobalHotkeys>;

export const Default: Story = {
  args: {
  "onToggleCommand": {},
  "onNavigate": "Sample Text"
},
};
