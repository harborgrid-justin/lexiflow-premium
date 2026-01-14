import type { Meta, StoryObj } from '@storybook/react-vite';
import { DiffViewer } from './DiffViewer';

const meta: Meta<typeof DiffViewer> = {
  title: 'Components/Organisms/DiffViewer/DiffViewer',
  component: DiffViewer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DiffViewer>;

export const Default: Story = {
  args: {
  "oldText": "Sample Text",
  "newText": "Sample Text",
  "oldLabel": "Sample Text",
  "newLabel": "Sample Text"
},
};
