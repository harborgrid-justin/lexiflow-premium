import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExhibitManager } from '../../../../features/litigation/exhibits/ExhibitManager';
import { ThemeProvider } from '@/providers/ThemeContext';
import { ToastProvider } from '@/providers/ToastContext';

/**
 * Exhibit components provide tools for managing trial exhibits including
 * organization, labeling, sticker design, and presentation.
 * 
 * ## Features
 * - Exhibit catalog and organization
 * - Custom sticker/label design
 * - Exhibit table generation
 * - Numbering and lettering systems
 * - Pre-trial exhibit exchange
 * - Presentation mode
 */

// ============================================================================
// EXHIBIT MANAGER (Main)
// ============================================================================

const metaManager = {
  title: 'Litigation/Exhibits/Manager',
  component: ExhibitManager,
  tags: ['autodocs'],
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
    docs: {
      description: {
        component: 'Comprehensive exhibit management system for trial preparation.',
      },
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <ToastProvider>
          <div className="min-h-screen bg-slate-50">
            <Story />
          </div>
        </ToastProvider>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof ExhibitManager>;

export default metaManager;

type Story = StoryObj<typeof metaManager>;

export const Default: Story = {
  args: {
    caseId: 'case-123',
  },
};
