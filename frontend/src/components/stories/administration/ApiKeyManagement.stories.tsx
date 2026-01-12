import type { Meta, StoryObj } from '@storybook/react-vite';
import { ApiKeyManagement } from '@/features/admin/components/api-keys/ApiKeyManagement';
import { ThemeProvider } from '@/features/theme';
import { ToastProvider } from '@/providers';

/**
 * ApiKeyManagement provides secure API key administration for external integrations
 * including key generation, rotation, usage monitoring, and access control.
 * 
 * ## Features
 * - API key generation
 * - Key rotation and expiration
 * - Usage analytics
 * - Rate limiting configuration
 * - Scope and permission management
 * - Integration monitoring
 * - Audit logging
 * - Webhook configuration
 * - IP whitelisting
 * - Developer documentation
 */
const meta = {
  title: 'Pages/API Key Management',
  component: ApiKeyManagement,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'neutral', value: '#f5f5f5' },
        { name: 'dark', value: '#1a1a1a' },
        { name: 'slate', value: '#0f172a' },
      ],
    },
    viewport: {
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        component: 'API key administration with secure key management and usage monitoring.',
      },
    },
    test: {
      clearMocks: true,
    },
  },
  tags: ['autodocs', 'page']
} satisfies Meta<typeof ApiKeyManagement>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default API key management view
 */
export const Default: Story = {
  parameters: {
    backgrounds: { default: 'light' },
  },
};

/**
 * Dark mode variant for security console
 */
export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

/**
 * Mobile responsive view
 */
export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    backgrounds: { default: 'neutral' },
  },
};

/**
 * Tablet responsive view
 */
export const Tablet: Story = {
  parameters: {
    viewport: { defaultViewport: 'tablet' },
    backgrounds: { default: 'light' },
  },
};
