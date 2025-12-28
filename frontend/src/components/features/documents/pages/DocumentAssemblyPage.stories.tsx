import type { Meta, StoryObj } from '@storybook/react';
import { DocumentAssemblyPage } from './DocumentAssemblyPage';

const meta: Meta<typeof DocumentAssemblyPage> = {
  title: 'Components/Pages/documents/DocumentAssemblyPage',
  component: DocumentAssemblyPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DocumentAssemblyPage>;

export const Default: Story = {
  args: {
  "caseId": "Sample Text"
},
};
