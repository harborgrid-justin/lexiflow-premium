import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocketCalendar } from '@/features/cases/components/docket/DocketCalendar';
import { ThemeProvider } from '@/providers/ThemeContext';


/**
 * DocketCalendar provides a calendar view of docket deadlines with month
 * navigation and daily deadline indicators.
 * 
 * ## Features
 * - Monthly calendar view
 * - Month navigation
 * - Deadline indicators on dates
 * - Color-coded deadline types
 * - Today highlight
 * - Click to view day details
 * - Responsive design
 * - Data integration with backend
 */
const meta = {
  title: 'Docket/DocketCalendar',
  component: DocketCalendar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Calendar view of docket deadlines with month navigation and daily deadline indicators.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="max-w-6xl">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof DocketCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default calendar view for current month
 */
export const Default: Story = {};

/**
 * Calendar in light theme
 */
export const LightTheme: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="max-w-6xl bg-white p-4 rounded">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

/**
 * Calendar in dark theme
 */
export const DarkTheme: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="max-w-6xl bg-slate-900 p-4 rounded">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

/**
 * Mobile responsive view
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="max-w-sm">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
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
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="max-w-3xl">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};
