import type { Meta, StoryObj } from '@storybook/react';
import { StickyHeaderLayout } from './StickyHeaderLayout';

const meta: Meta<typeof StickyHeaderLayout> = {
  title: 'Components/Layouts/StickyHeaderLayout/StickyHeaderLayout',
  component: StickyHeaderLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof StickyHeaderLayout>;

export const Default: Story = {
  args: {
  "header": "<div>Sample Content</div>",
  "children": "<div>Sample Content</div>",
  "headerClassName": "Sample Text",
  "contentClassName": "Sample Text",
  "className": "Sample Text"
},
};
