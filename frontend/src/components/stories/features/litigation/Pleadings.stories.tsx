import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CaseId, DocumentId, Pleading, Clause, PleadingDocument } from '@/types';
import { PleadingBuilder } from '../../../../features/litigation/pleadings/PleadingBuilder';
import { PleadingDashboard } from '../../../../features/litigation/pleadings/PleadingDashboard';
import PleadingDesigner from '../../../../features/litigation/pleadings/PleadingDesigner';
import { PleadingTemplates } from '../../../../features/litigation/pleadings/PleadingTemplates';
import { PleadingDrafts } from '../../../../features/litigation/pleadings/PleadingDrafts';
import { PleadingFilingQueue } from '../../../../features/litigation/pleadings/PleadingFilingQueue';
import { PleadingAnalytics } from '../../../../features/litigation/pleadings/PleadingAnalytics';
import { ThemeProvider } from '@/providers/ThemeContext';
import { ToastProvider } from '@/providers/ToastContext';

/**
 * Pleading components provide comprehensive tools for drafting, managing, and filing
 * court documents including complaints, motions, briefs, and orders.
 * 
 * ## Features
 * - Visual pleading builder and designer
 * - Template library with customization
 * - AI-powered drafting assistance
 * - Citation integration and validation
 * - Court rules compliance
 * - Electronic filing integration
 * - Version control and collaboration
 * - Analytics and performance tracking
 */

// ============================================================================
// PLEADING BUILDER (Main)
// ============================================================================

const metaBuilder = {
  title: 'Litigation/Pleadings/Builder',
  component: PleadingBuilder,
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
        component: 'Advanced pleading builder with AI assistance and visual design tools.',
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
} satisfies Meta<typeof PleadingBuilder>;

export default metaBuilder;

type Story = StoryObj<typeof metaBuilder>;

export const Default: Story = {
  args: {
    caseId: 'case-123',
  },
};

export const WithTemplate: Story = {
  render: () => (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50">
          <PleadingDashboard caseId="case-123" onCreate={function (_newDoc: PleadingDocument): void {
                        throw new Error('Function not implemented.');
                    } } onEdit={function (_id: string): void {
                        throw new Error('Function not implemented.');
                    } } />
        </div>
      </ToastProvider>
    </ThemeProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dashboard overview of all pleadings with status tracking and analytics.',
      },
    },
  },
};

// ============================================================================
// PLEADING DESIGNER
// ============================================================================

export const Designer: StoryObj<Meta<typeof PleadingDesigner>> = {
  render: () => {
    const mockPleading: PleadingDocument = {
      id: 'pleading-123' as any,
      caseId: 'case-123' as any,
      title: 'Motion to Dismiss',
      status: 'Draft',
      filingStatus: 'Pre-Filing',
      sections: [],
      jurisdictionRulesId: 'default-rules',
      version: 1,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    };

    return (
      <ThemeProvider>
        <ToastProvider>
          <div className="min-h-screen bg-slate-50">
            <PleadingDesigner
              pleading={mockPleading}
              onBack={() => console.log('Back clicked')}
            />
          </div>
        </ToastProvider>
      </ThemeProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Visual designer for creating and editing pleadings with drag-and-drop.',
      },
    },
  },
};

// ============================================================================
// PLEADING TEMPLATES
// ============================================================================

export const Templates: StoryObj<Meta<typeof PleadingTemplates>> = {
  render: () => (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50 p-6">
          <PleadingTemplates
            templates={[]}
            onCreateFromTemplate={(template) => console.log('Create from template:', template)}
            isLoading={false}
          />
        </div>
      </ToastProvider>
    </ThemeProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Library of pleading templates organized by type and jurisdiction.',
      },
    },
  },
};

// ============================================================================
// PLEADING DRAFTS
// ============================================================================

export const Drafts: StoryObj<Meta<typeof PleadingDrafts>> = {
  render: () => (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50 p-6">
          <PleadingDrafts
            pleadings={[]}
            onEdit={(doc) => console.log('Edit draft:', doc)}
            isLoading={false}
          />
        </div>
      </ToastProvider>
    </ThemeProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Manage work-in-progress pleading drafts with version history.',
      },
    },
  },
};

// ============================================================================
// FILING QUEUE
// ============================================================================

export const FilingQueue: StoryObj<Meta<typeof PleadingFilingQueue>> = {
  render: () => (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50 p-6">
          <PleadingFilingQueue />
        </div>
      </ToastProvider>
    </ThemeProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Queue and manage electronic court filings with status tracking.',
      },
    },
  },
};

// ============================================================================
// ANALYTICS
// ============================================================================

export const Analytics: StoryObj<Meta<typeof PleadingAnalytics>> = {
  render: () => (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50 p-6">
          <PleadingAnalytics />
        </div>
      </ToastProvider>
    </ThemeProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Analytics dashboard showing pleading performance and metrics.',
      },
    },
  },
};
