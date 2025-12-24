import type { Meta, StoryObj } from '@storybook/react';
import { AutocompleteSelect } from './AutocompleteSelect';

const meta: Meta<typeof AutocompleteSelect> = {
  title: 'Molecules/AutocompleteSelect',
  component: AutocompleteSelect,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AutocompleteSelect>;

export const Default: Story = {
  args: {},
};
