import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CaseId, DiscoveryRequest, DiscoveryType, DiscoveryStatus } from '@/types';
import { DiscoveryPlatform } from '@features/litigation/discovery/DiscoveryPlatform';
import { ThemeProvider } from '@/providers/ThemeContext';
import { ToastProvider } from '@/providers/ToastContext';

/**
 * Discovery components provide comprehensive tools for managing the discovery process
 * including requests, productions, depositions, ESI, and compliance.
 * 
 * ## Features
 * - Discovery request management
 * - Production tracking and review
 * - ESI (Electronically Stored Information) management
 * - Deposition scheduling and management
 * - Legal holds and preservation
 * - Privilege log management
 * - Vendor coordination
 */

// ============================================================================
// DISCOVERY PLATFORM (Main)
// ============================================================================

const metaPlatform = {
  title: 'Litigation/Discovery/Platform',
  component: DiscoveryPlatform,
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
        component: 'Comprehensive discovery management platform with requests, productions, and ESI tools.',
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
} satisfies Meta<typeof DiscoveryPlatform>;

export default metaPlatform;

type Story = StoryObj<typeof metaPlatform>;

export const Default: Story = {
  args: {
    caseId: 'case-123',
  },
};

export const WithMultipleCases: Story = {
  args: {
    caseId: 'case-456',
  },
};
