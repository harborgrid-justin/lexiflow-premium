import { SplitView } from './SplitView';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof SplitView> = {
  title: 'Components/Organisms/SplitView/SplitView',
  component: SplitView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SplitView>;

export const Default: Story = {
  args: {
  sidebar: undefined,
  content: undefined,
  "showSidebarOnMobile": true,
  "className": "Sample Text"
},
};
