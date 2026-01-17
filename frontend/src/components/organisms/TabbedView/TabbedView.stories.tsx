import { TabbedView } from './TabbedView';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof TabbedView> = {
  title: 'Components/Organisms/TabbedView/TabbedView',
  component: TabbedView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TabbedView>;

export const Default: Story = {
  args: {
  header: undefined,
  tabs: undefined,
  children: undefined
},
};
