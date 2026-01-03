import { Button } from '@/components/ui/atoms/Button/Button';
import { ConfirmDialog } from '@/components/ui/molecules/ConfirmDialog/ConfirmDialog';
import { ThemeProvider } from '@/providers';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';

/**
 * ConfirmDialog component for confirmation prompts.
 */

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Common/ConfirmDialog',
  component: ConfirmDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Confirmation dialog for destructive or important actions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the dialog is open',
    },
    title: {
      control: 'text',
      description: 'Dialog title',
    },
    message: {
      control: 'text',
      description: 'Dialog message',
    },
    confirmText: {
      control: 'text',
      description: 'Text for the confirm button',
    },
    cancelText: {
      control: 'text',
      description: 'Text for the cancel button',
    },
    variant: {
      control: 'select',
      options: ['danger', 'warning', 'info'],
      description: 'Variant for the dialog',
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <div className="p-8">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const DeleteConfirmation: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div>
        <Button variant="danger" onClick={() => setIsOpen(true)}>Delete Case</Button>
        <ConfirmDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={() => {
            console.log('Confirmed');
            setIsOpen(false);
          }}
          title="Delete Case"
          message="Are you sure you want to delete this case? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
        />
      </div>
    );
  },
};

export const BasicConfirmation: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div>
        <Button onClick={() => setIsOpen(true)}>Submit Form</Button>
        <ConfirmDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={() => {
            console.log('Confirmed');
            setIsOpen(false);
          }}
          title="Confirm Submission"
          message="Are you ready to submit this form?"
          confirmText="Submit"
        />
      </div>
    );
  },
};
