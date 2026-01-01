import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocketManager } from '@/features/cases/components/docket/DocketManager';
import { ThemeProvider } from '@/providers/ThemeContext';

import { WindowProvider } from '@/providers/WindowContext';

/**
 * DocketManager is the top-level docket management page that provides
 * comprehensive docket functionality including sheet view, calendar, analytics,
 * and settings. This is a full-page application component.
 * 
 * ## Features
 * - Multiple view modes (sheet, calendar, analytics)
 * - Tab-based navigation
 * - Docket sheet with filtering
 * - Calendar view of deadlines
 * - Analytics dashboard
 * - Court integration settings
 * - Import capabilities
 * - Real-time updates
 * - Responsive design
 * 
 * ## Usage
 * This component represents a complete page in the application and should be
 * rendered in fullscreen mode with all necessary providers.
 */
const meta = {
  title: 'Pages/Docket Manager',
  component: DocketManager,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'neutral',
    },
    viewport: {
      defaultViewport: 'desktopLarge',
    },
    docs: {
      description: {
        component: 'Full-page docket management application with comprehensive features for managing court dockets, deadlines, and analytics.',
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
        <WindowProvider>
          <div className="h-screen w-screen">
            <Story />
          </div>
        </WindowProvider>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    initialTab: {
      description: 'Initial view/tab to display',
      control: 'select',
      options: ['all', 'filings', 'orders', 'calendar', 'upcoming', 'stats', 'sync'],
    },
  },
} satisfies Meta<typeof DocketManager>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view with all entries
 */
export const Default: Story = {
  args: {
    initialTab: 'all',
  },
};

/**
 * Starting with docket sheet view (all entries)
 */
export const DocketSheetAll: Story = {
  args: {
    initialTab: 'all',
  },
};

/**
 * Starting with filings only view
 */
export const DocketSheetFilings: Story = {
  args: {
    initialTab: 'filings',
  },
};

/**
 * Starting with orders only view
 */
export const DocketSheetOrders: Story = {
  args: {
    initialTab: 'orders',
  },
};

/**
 * Starting with calendar view
 */
export const CalendarView: Story = {
  args: {
    initialTab: 'calendar',
  },
};

/**
 * Starting with upcoming deadlines view
 */
export const UpcomingDeadlines: Story = {
  args: {
    initialTab: 'upcoming',
  },
};

/**
 * Starting with analytics/stats view
 */
export const AnalyticsView: Story = {
  args: {
    initialTab: 'stats',
  },
};

/**
 * Starting with sync settings view
 */
export const SyncSettings: Story = {
  args: {
    initialTab: 'sync',
  },
};

/**
 * Light theme variant
 */
export const LightTheme: Story = {
  args: {
    initialTab: 'all',
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <WindowProvider>
          <div className="h-screen w-screen bg-white">
            <Story />
          </div>
        </WindowProvider>
      </ThemeProvider>
    ),
  ],
};

/**
 * Dark theme variant
 */
export const DarkTheme: Story = {
  args: {
    initialTab: 'all',
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <WindowProvider>
          <div className="h-screen w-screen bg-slate-900">
            <Story />
          </div>
        </WindowProvider>
      </ThemeProvider>
    ),
  ],
};

/**
 * Mobile responsive view
 */
export const Mobile: Story = {
  args: {
    initialTab: 'all',
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
    initialTab: 'all',
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
