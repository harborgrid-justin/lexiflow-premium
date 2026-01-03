import type { Meta, StoryObj } from '@storybook/react-vite';
import { EvidenceDashboard } from '@features/litigation/evidence';
import { ThemeProvider } from '@/providers';
import { ToastProvider } from '@/providers';

/**
 * EvidenceDashboard provides comprehensive evidence management including document
 * tracking, exhibit management, chain of custody, and trial preparation.
 * 
 * ## Features
 * - Evidence catalog
 * - Exhibit management
 * - Chain of custody tracking
 * - Document tagging
 * - Evidence timeline
 * - Authentication tracking
 * - Trial presentation prep
 * - Evidence analysis
 * - Search and filtering
 * - Export capabilities
 */
const meta = {
  title: 'Pages/Evidence Dashboard',
  component: EvidenceDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Evidence management dashboard with exhibit tracking and chain of custody.',
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
} satisfies Meta<typeof EvidenceDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default evidence dashboard view
 */
export const Default: Story = {
  args: {
    onNavigate: (view) => {
      console.log('Navigate to view:', view);
    },
  },
};

/**
 * Mobile responsive view
 */
export const Mobile: Story = {
  args: {
    onNavigate: (view) => {
      console.log('Navigate to view:', view);
    },
  },
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
  args: {
    onNavigate: (view) => {
      console.log('Navigate to view:', view);
    },
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
