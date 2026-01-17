import { StickyHeaderLayout } from './StickyHeaderLayout';

import type { Meta, StoryObj } from '@storybook/react-vite';

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
  header: undefined,
  children: undefined,
  "headerClassName": "Sample Text",
  "contentClassName": "Sample Text",
  "className": "Sample Text"
},
};
