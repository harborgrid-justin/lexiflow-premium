import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Inputs';

const meta: Meta<typeof Input> = {
  title: 'Components/Organisms/_legacy/Inputs',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {},
};
