import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileUploadZone } from '@/components/molecules/FileUploadZone';
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
    file: {
      control: 'object',
      description: 'Selected file object',
    },
    processing: {
      control: 'boolean',
      description: 'Whether file is being processed',
    },
    processStage: {
      control: 'text',
      description: 'Current processing stage message',
    },
    multiple: {
      control: 'boolean',
      description: 'Allow multiple file selection',
    },
    generatedHash: {
      control: 'text',
      description: 'Generated hash for uploaded file',
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
  render: () => {
    const [file, setFile] = React.useState<File | null>(null);
    const [processing, setProcessing] = React.useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setProcessing(true);
        setTimeout(() => {
          setFile(selectedFile);
          setProcessing(false);
        }, 2000);
      }
    };

    return (
      <FileUploadZone
        file={file}
        processing={processing}
        onFileSelect={handleFileSelect}
      />
    );
  },
};

export const Processing: Story = {
  render: () => {
    const [file, setFile] = React.useState<File | null>(null);
    const [processing, setProcessing] = React.useState(true);
    const [processStage, setProcessStage] = React.useState('Uploading file...');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setProcessing(true);
        setProcessStage('Uploading file...');
        setTimeout(() => {
          setProcessStage('Generating hash...');
          setTimeout(() => {
            setFile(selectedFile);
            setProcessing(false);
          }, 1500);
        }, 1500);
      }
    };

    return (
      <FileUploadZone
        file={file}
        processing={processing}
        processStage={processStage}
        onFileSelect={handleFileSelect}
      />
    );
  },
};

export const WithHash: Story = {
  render: () => {
    const mockFile = new File(['test'], 'document.pdf', { type: 'application/pdf' });
    return (
      <FileUploadZone
        file={mockFile}
        processing={false}
        onFileSelect={() => {}}
        generatedHash="a1b2c3d4e5f6"
      />
    );
  },
};
