import type { Meta, StoryObj } from '@storybook/react';
import { TabbedView } from './TabbedView';

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
  "header": "<div>Sample Content</div>",
  "tabs": "<div>Sample Content</div>",
  "children": "<div>Sample Content</div>"
},
};
