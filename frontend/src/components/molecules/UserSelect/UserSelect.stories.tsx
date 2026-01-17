import { UserSelect } from './UserSelect';

import type { Meta, StoryObj } from '@storybook/react-vite';

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
  "onChange": () => {},
  "options": [],
  "className": "Sample Text"
},
};
