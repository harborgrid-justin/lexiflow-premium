import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatabaseManagement } from '../components/admin/data/DatabaseManagement';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import React from 'react';

const meta = {
  title: 'Pages/Database Management',
  component: DatabaseManagement,
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
} satisfies Meta<typeof DatabaseManagement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
export const Tablet: Story = { parameters: { viewport: { defaultViewport: 'tablet' } } };
