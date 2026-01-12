import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocumentsPage } from './DocumentsPage';

const meta: Meta<typeof DocumentsPage> = {
  title: 'Components/Pages/operations/DocumentsPage',
  component: DocumentsPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DocumentsPage>;

export const Default: Story = {
  args: {
  "caseId": "Sample Text"
},
};
