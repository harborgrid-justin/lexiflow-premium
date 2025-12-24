/**
 * Matter Management Page Story
 * 
 * Main matter management interface with centralized case oversight,
 * intake pipeline, and resource coordination.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MatterManagement } from '../../../../features/matters/components/list/MatterManagement';
import { ThemeProvider } from '@/providers/ThemeContext';
import { ToastProvider } from '@/providers/ToastContext';

const meta: Meta<typeof MatterManagement> = {
  title: 'Pages/Matter Management',
  component: MatterManagement,
  tags: ['autodocs', 'page'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Comprehensive matter management hub with tabbed navigation for all cases, calendar view, analytics, and intake pipeline. Provides centralized case oversight and resource coordination.'
      }
    }
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <ToastProvider>
          <Story />
        </ToastProvider>
      </ThemeProvider>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof MatterManagement>;

/**
 * Default matter management view showing all active cases.
 */
export const Default: Story = {
  args: {}
};

/**
 * Matter management with calendar view for deadline tracking.
 */
export const CalendarView: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Calendar view mode showing matter deadlines, hearings, and key dates across all cases.'
      }
    }
  }
};

/**
 * Analytics view with matter metrics and performance insights.
 */
export const AnalyticsView: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Analytics dashboard showing case metrics, resource utilization, and matter performance KPIs.'
      }
    }
  }
};

/**
 * Intake pipeline view for new matter processing.
 */
export const IntakePipeline: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Intake pipeline showing prospective matters moving through qualification and onboarding stages.'
      }
    }
  }
};

/**
 * Matter management focused on active litigation cases.
 */
export const LitigationMatters: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Filter view showing only active litigation matters with trial dates and discovery status.'
      }
    }
  }
};

/**
 * Matter management with archived/closed cases.
 */
export const ArchivedMatters: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'View of archived and closed matters for reference and reporting purposes.'
      }
    }
  }
};
