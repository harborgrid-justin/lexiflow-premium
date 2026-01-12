import type { Meta, StoryObj } from '@storybook/react-vite';
import { DraftingPage } from './DraftingPage';

const meta: Meta<typeof DraftingPage> = {
  title: 'Components/Pages/documents/DraftingPage',
  component: DraftingPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DraftingPage>;

export const Default: Story = {
  args: {},
};
