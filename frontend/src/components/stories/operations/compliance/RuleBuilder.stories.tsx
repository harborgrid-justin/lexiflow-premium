import type { Meta, StoryObj } from '@storybook/react-vite';
import { RuleBuilder } from '../../../components/admin/data/quality/RuleBuilder';
import { ThemeProvider } from '../../../context/ThemeContext';
import { ToastProvider } from '../../../context/ToastContext';
import React from 'react';

const meta = {
  title: 'Pages/Rule Builder',
  component: RuleBuilder,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs', 'page'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <ToastProvider>
          <div className="h-screen w-screen">
            <Story />
          </div>
        </ToastProvider>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof RuleBuilder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSave: (rule) => console.log('Rule saved:', rule),
    onCancel: () => console.log('Rule creation cancelled'),
  },
};

export const Mobile: Story = {
  args: {
    onSave: (rule) => console.log('Rule saved:', rule),
    onCancel: () => console.log('Rule creation cancelled'),
  },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

export const Tablet: Story = {
  args: {
    onSave: (rule) => console.log('Rule saved:', rule),
    onCancel: () => console.log('Rule creation cancelled'),
  },
  parameters: { viewport: { defaultViewport: 'tablet' } },
};
