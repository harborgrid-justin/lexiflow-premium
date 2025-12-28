import type { Meta, StoryObj } from '@storybook/react';
import { SearchToolbar } from './SearchToolbar';

const meta: Meta<typeof SearchToolbar> = {
  title: 'Components/Organisms/SearchToolbar/SearchToolbar',
  component: SearchToolbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SearchToolbar>;

export const Default: Story = {
  args: {
  "value": "Sample Text",
  "onChange": "Sample Text",
  "placeholder": "Sample Text",
  "actions": "<div>Sample Content</div>",
  "className": "Sample Text"
},
};
