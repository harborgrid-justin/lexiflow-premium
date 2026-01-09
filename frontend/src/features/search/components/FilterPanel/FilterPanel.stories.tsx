import type { Meta, StoryObj } from '@storybook/react';
import { FilterPanel } from './FilterPanel';

const meta: Meta<typeof FilterPanel> = {
  title: 'Components/Organisms/FilterPanel/FilterPanel',
  component: FilterPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof FilterPanel>;

export const Default: Story = {
  args: {
  "isOpen": true,
  onClose: () => {},
  onClear: () => {},
  children: undefined,
  "title": "Sample Text",
  "className": "Sample Text"
},
};
