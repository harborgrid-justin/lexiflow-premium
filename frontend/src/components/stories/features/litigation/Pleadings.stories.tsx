import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CaseId, DocumentId, Pleading, Clause, PleadingDocument } from '../../../../frontend/types';
import { PleadingBuilder } from '../../../../frontend/components/litigation/pleadings/PleadingBuilder';
import { PleadingDashboard } from '../../../../frontend/components/litigation/pleadings/PleadingDashboard';
import PleadingDesigner from '../../../../frontend/components/litigation/pleadings/PleadingDesigner';
import { PleadingTemplates } from '../../../../frontend/components/litigation/pleadings/PleadingTemplates';
import { PleadingDrafts } from '../../../../frontend/components/litigation/pleadings/PleadingDrafts';
import { PleadingFilingQueue } from '../../../../frontend/components/litigation/pleadings/PleadingFilingQueue';
import { PleadingAnalytics } from '../../../../frontend/components/litigation/pleadings/PleadingAnalytics';
import { ThemeProvider } from '../../../../frontend/context/ThemeContext';
import { ToastProvider } from '../../../../frontend/context/ToastContext';
import React from 'react';

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
  tags: ['autodocs'],
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
          <PleadingDashboard caseId="case-123" onCreate={function (newDoc: PleadingDocument): void {
                        throw new Error('Function not implemented.');
                    } } onEdit={function (id: string): void {
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
  render: () => (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50">
          <PleadingDesigner 
            pleadingId="pleading-123"
          />
        </div>
      </ToastProvider>
    </ThemeProvider>
  ),
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
            onSelectTemplate={(template: Pleading) => console.log('Selected:', template)}
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
            onOpenDraft={(id: string) => console.log('Open draft:', id)}
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
