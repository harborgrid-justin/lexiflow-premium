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
  "onChange": () => {},
  "placeholder": "Sample Text",
  actions: undefined,
  "className": "Sample Text"
},
};
