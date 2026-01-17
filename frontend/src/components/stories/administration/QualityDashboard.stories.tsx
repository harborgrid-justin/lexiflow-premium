import { QualityDashboard } from '@/routes/admin/components/data/quality/QualityDashboard';

import type { DataAnomaly, QualityMetricHistory } from '@/types';
import type { Meta, StoryObj } from '@storybook/react-vite';

// Mock data
const mockAnomalies: DataAnomaly[] = [];
const mockHistory: QualityMetricHistory[] = [];

/**
 * QualityDashboard provides data quality monitoring and management with
 * automated validation, cleansing rules, and quality metrics.
 * 
 * ## Features
 * - Data quality metrics
 * - Validation rules
 * - Data cleansing
 * - Quality scoring
 * - Issue tracking
 * - Automated remediation
 * - Quality trends
 * - Source analysis
 * - Exception reporting
 * - Quality alerts
 */
const meta = {
  title: 'Pages/Quality Dashboard',
  component: QualityDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Data quality monitoring with validation rules and automated remediation.',
      },
    },
  },
  tags: ['autodocs', 'page']
} satisfies Meta<typeof QualityDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default quality dashboard view
 */
export const Default: Story = {
  args: {
    anomalies: mockAnomalies,
    history: mockHistory,
  },
};

/**
 * Mobile responsive view
 */
export const Mobile: Story = {
  args: {
    anomalies: mockAnomalies,
    history: mockHistory,
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
    anomalies: mockAnomalies,
    history: mockHistory,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
