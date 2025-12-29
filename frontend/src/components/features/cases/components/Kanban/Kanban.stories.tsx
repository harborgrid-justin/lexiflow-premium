import type { Meta, StoryObj } from '@storybook/react';
import { KanbanBoard } from './Kanban';

const meta: Meta<typeof KanbanBoard> = {
  title: 'Components/Organisms/Kanban/KanbanBoard',
  component: KanbanBoard,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof KanbanBoard>;

export const Default: Story = {
  args: {
  "title": "Sample Text",
  "count": 42,
  "children": "<div>Sample Content</div>",
  "onDrop": {},
  "isDragOver": true,
  "action": "<div>Sample Content</div>"
},
};
