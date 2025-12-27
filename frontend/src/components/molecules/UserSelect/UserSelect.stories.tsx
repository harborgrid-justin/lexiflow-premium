import type { Meta, StoryObj } from '@storybook/react';
import { UserSelect } from './UserSelect';

const meta: Meta<typeof UserSelect> = {
  title: 'Components/Molecules/UserSelect/UserSelect',
  component: UserSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof UserSelect>;

export const Default: Story = {
  args: {
  "label": "Sample Text",
  "value": "Sample Text",
  "onChange": "Sample Text",
  "options": [],
  "className": "Sample Text"
},
};
