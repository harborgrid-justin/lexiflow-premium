import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileUploadZone } from '../../components/common/FileUploadZone';
import { ThemeProvider } from '@/providers/ThemeContext';
import React from 'react';

/**
 * FileUploadZone component for drag-and-drop file uploads.
 */

const meta: Meta<typeof FileUploadZone> = {
  title: 'Common/FileUploadZone',
  component: FileUploadZone,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Drag-and-drop file upload zone with validation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    accept: {
      control: 'text',
      description: 'Accepted file types (e.g. .pdf,.jpg)',
    },
    multiple: {
      control: 'boolean',
      description: 'Allow multiple file selection',
    },
    description: {
      control: 'text',
      description: 'Helper text displayed in the zone',
    },
    onUpload: {
      action: 'upload',
      description: 'Callback when files are dropped or selected',
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <div className="p-8 bg-slate-50 dark:bg-slate-800 w-[500px]">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onUpload: (files) => console.log('Uploaded files:', files),
  },
};

export const WithAcceptedTypes: Story = {
  args: {
    onUpload: (files) => console.log('Uploaded files:', files),
    accept: '.pdf,.doc,.docx',
    description: 'PDF and Word documents only',
  },
};

export const MultipleFiles: Story = {
  args: {
    onUpload: (files) => console.log('Uploaded files:', files),
    multiple: true,
    description: 'Upload multiple files at once',
  },
};
