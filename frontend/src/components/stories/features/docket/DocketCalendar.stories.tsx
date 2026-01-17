import { DocketCalendar } from '@/routes/cases/components/docket/DocketCalendar';

import type { Meta, StoryObj } from '@storybook/react-vite';


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
  tags: ['autodocs']
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
};

/**
 * Calendar in dark theme
 */
export const DarkTheme: Story = {
};

/**
 * Mobile responsive view
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  }
};

/**
 * Tablet responsive view
 */
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  }
};
