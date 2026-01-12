import type { Meta, StoryObj } from '@storybook/react-vite';
import { AutocompleteSelect } from './AutocompleteSelect';

const meta: Meta<typeof AutocompleteSelect> = {
  title: 'Components/Molecules/AutocompleteSelect/AutocompleteSelect',
  component: AutocompleteSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof AutocompleteSelect>;

export const Default: Story = {
  args: {},
};
