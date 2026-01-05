import type { Meta, StoryObj } from '@storybook/react';
import { FileUploadZone } from './FileUploadZone';

const meta: Meta<typeof FileUploadZone> = {
  title: 'Components/Molecules/FileUploadZone/FileUploadZone',
  component: FileUploadZone,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof FileUploadZone>;

export const Default: Story = {
  args: {
  "file": new File([''], 'example.pdf', { type: 'application/pdf' }),
  "processing": true,
  "processStage": "Sample Text",
  onFileSelect: () => {},
  "generatedHash": "Sample Text",
  "multiple": true
},
};
