import type { Meta, StoryObj } from '@storybook/react-vite';
import { NotificationCenter } from '../../components/notifications/NotificationCenter';
import { ThemeProvider } from '../../context/ThemeContext';
import { ToastProvider } from '../../context/ToastContext';
import React from 'react';

const meta = {
  title: 'Pages/Notification Center',
  component: NotificationCenter,
  parameters: { 
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'neutral', value: '#f5f5f5' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
    viewport: {
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        component: 'Centralized notification management with real-time alerts, filtering, and prioritization.',
      },
    },
    test: {
      clearMocks: true,
    },
  },
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
} satisfies Meta<typeof NotificationCenter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    backgrounds: { default: 'light' },
  },
};

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const Mobile: Story = { 
  parameters: { 
    viewport: { defaultViewport: 'mobile1' },
    backgrounds: { default: 'neutral' },
  },
};

export const Tablet: Story = { 
  parameters: { 
    viewport: { defaultViewport: 'tablet' },
    backgrounds: { default: 'light' },
  },
};
