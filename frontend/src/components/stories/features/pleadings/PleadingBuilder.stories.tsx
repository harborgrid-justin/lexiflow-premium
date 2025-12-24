import type { Meta, StoryObj } from '@storybook/react-vite';
import { PleadingBuilder } from '../../../../frontend/components/litigation/pleadings/PleadingBuilder';
import { ThemeProvider } from '../../../../frontend/context/ThemeContext';
import { ToastProvider } from '../../../../frontend/context/ToastContext';
import React from 'react';

/**
 * PleadingBuilder is the comprehensive pleading document creation and management
 * page with AI drafting, template management, and court filing integration.
 * 
 * ## Features
 * - AI-powered drafting assistance
 * - Template library management
 * - Document designer with live preview
 * - Bluebook citation formatting
 * - Signature block automation
 * - Court rules compliance checking
 * - Filing center integration
 * - Version control
 * - Collaborative editing
 * - Draft management
 */
const meta = {
  title: 'Pages/Pleading Builder',
  component: PleadingBuilder,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'neutral',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'neutral', value: '#f5f5f5' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
    viewport: {
      defaultViewport: 'desktopLarge',
    },
    docs: {
      description: {
        component: 'Comprehensive pleading builder with AI drafting, templates, and court filing integration.',
      },
    },
    test: {
      clearMocks: true,
      restoreMocks: true,
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
} satisfies Meta<typeof PleadingBuilder>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view with document designer
 */
export const Default: Story = {};

/**
 * Mobile responsive view
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Tablet responsive view
 */
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
