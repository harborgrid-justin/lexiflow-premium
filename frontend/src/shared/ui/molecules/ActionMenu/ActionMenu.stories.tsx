import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActionMenu } from './ActionMenu';

const meta: Meta<typeof ActionMenu> = {
  title: 'Components/Molecules/ActionMenu/ActionMenu',
  component: ActionMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ActionMenu>;

export const Default: Story = {
  args: {
  "actions": []
},
};
