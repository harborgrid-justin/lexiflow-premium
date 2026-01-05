import type { Meta, StoryObj } from '@storybook/react-vite';
import { WebhookManagement } from '@features/admin/components/webhooks/WebhookManagement';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { ToastProvider } from '@providers/ToastContext';

const meta = {
  title: 'Pages/Webhook Management',
  component: WebhookManagement,
  parameters: { 
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
    },
    viewport: {
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        component: 'Enterprise webhook management interface for configuring and monitoring integrations with external systems.',
      },
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
} satisfies Meta<typeof WebhookManagement>;

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
    backgrounds: { default: 'light' },
  },
};

export const Tablet: Story = { 
  parameters: { 
    viewport: { defaultViewport: 'tablet' },
    backgrounds: { default: 'neutral' },
  },
};
