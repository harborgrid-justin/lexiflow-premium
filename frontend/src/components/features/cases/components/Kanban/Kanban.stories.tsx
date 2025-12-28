import type { Meta, StoryObj } from '@storybook/react';
import { Kanban } from './Kanban';

const meta: Meta<typeof Kanban> = {
  title: 'Components/Organisms/Kanban/Kanban',
  component: Kanban,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Kanban>;

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
