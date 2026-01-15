import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserAvatar } from './UserAvatar';

const meta: Meta<typeof UserAvatar> = {
  title: 'Components/Atoms/UserAvatar/UserAvatar',
  component: UserAvatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof UserAvatar>;

export const Default: Story = {
  args: {
  "name": "Sample Text",
  size: undefined,
  "className": "Sample Text",
  indicatorStatus: undefined
},
};
