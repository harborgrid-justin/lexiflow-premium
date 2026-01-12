import type { Meta, StoryObj } from '@storybook/react-vite';
import { ClauseLibraryPage } from './ClauseLibraryPage';

const meta: Meta<typeof ClauseLibraryPage> = {
  title: 'Components/Pages/knowledge/ClauseLibraryPage',
  component: ClauseLibraryPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ClauseLibraryPage>;

export const Default: Story = {
  args: {},
};
