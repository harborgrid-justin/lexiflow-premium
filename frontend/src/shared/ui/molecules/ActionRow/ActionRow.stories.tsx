import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActionRow } from './ActionRow';

const meta: Meta<typeof ActionRow> = {
  title: 'Components/Molecules/ActionRow/ActionRow',
  component: ActionRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ActionRow>;

export const Default: Story = {
  args: {
  "title": "Sample Text",
  "subtitle": "Sample Text",
  children: undefined,
  "className": "Sample Text"
},
};
