import type { Meta, StoryObj } from '@storybook/react';
import { TabbedView } from './TabbedView';

const meta: Meta<typeof TabbedView> = {
  title: 'Organisms/TabbedView',
  component: TabbedView,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TabbedView>;

export const Default: Story = {
  args: {},
};
