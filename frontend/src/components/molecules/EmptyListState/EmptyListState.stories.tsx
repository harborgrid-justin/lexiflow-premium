import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyListState } from './EmptyListState';

const meta: Meta<typeof EmptyListState> = {
  title: 'Components/Molecules/EmptyListState/EmptyListState',
  component: EmptyListState,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof EmptyListState>;

export const Default: Story = {
  args: {
  "label": "Sample Text",
  "message": "Sample Text",
  icon: undefined
},
};
