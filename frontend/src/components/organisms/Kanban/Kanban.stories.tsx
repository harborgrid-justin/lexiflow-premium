import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { KanbanBoard, KanbanColumn, KanbanCard } from './Kanban';

const KanbanDemo = () => {
  return (
    <KanbanBoard>
      <KanbanColumn title="To Do" count={3}>
        <KanbanCard>Task 1</KanbanCard>
        <KanbanCard>Task 2</KanbanCard>
        <KanbanCard>Task 3</KanbanCard>
      </KanbanColumn>
      <KanbanColumn title="In Progress" count={1}>
        <KanbanCard>Task 4</KanbanCard>
      </KanbanColumn>
      <KanbanColumn title="Done" count={2}>
        <KanbanCard>Task 5</KanbanCard>
        <KanbanCard>Task 6</KanbanCard>
      </KanbanColumn>
    </KanbanBoard>
  );
};

const meta: Meta<typeof KanbanDemo> = {
  title: 'Organisms/Kanban',
  component: KanbanDemo,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof KanbanDemo>;

export const Default: Story = {
  args: {},
};
