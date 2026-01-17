import { KanbanBoard } from './Kanban';

import type { Meta, StoryObj } from '@storybook/react-vite';

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
  children: undefined,
  className: ''
},
};
