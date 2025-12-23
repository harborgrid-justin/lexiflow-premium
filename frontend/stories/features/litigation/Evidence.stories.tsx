import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CaseId, EvidenceId, EvidenceItem, EvidenceType, AdmissibilityStatus } from '../../types';
import { EvidenceDashboard } from '../../components/litigation/evidence/EvidenceDashboard';
import { EvidenceVault } from '../../components/litigation/evidence/EvidenceVault';
import { EvidenceInventory } from '../../components/litigation/evidence/EvidenceInventory';
import { EvidenceIntake } from '../../components/litigation/evidence/EvidenceIntake';
import { EvidenceChainOfCustody } from '../../components/litigation/evidence/EvidenceChainOfCustody';
import { EvidenceAdmissibility } from '../../components/litigation/evidence/EvidenceAdmissibility';
import { EvidenceForensics } from '../../components/litigation/evidence/EvidenceForensics';
import { EvidenceDetail } from '../../components/litigation/evidence/EvidenceDetail';
import { ThemeProvider } from '../../context/ThemeContext';
import { ToastProvider } from '../../context/ToastContext';
import React from 'react';

/**
 * Evidence components provide comprehensive tools for managing physical and digital evidence
 * including intake, chain of custody, admissibility analysis, and forensics.
 * 
 * ## Features
 * - Evidence vault and inventory
 * - Chain of custody tracking
 * - Admissibility analysis
 * - Digital forensics tools
 * - Evidence intake workflow
 * - Metadata management
 * - FRE (Federal Rules of Evidence) compliance
 */

// ============================================================================
// EVIDENCE VAULT (Main)
// ============================================================================

const metaVault = {
  title: 'Litigation/Evidence/Vault',
  component: EvidenceVault,
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
        component: 'Secure evidence vault with comprehensive tracking and management capabilities.',
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
} satisfies Meta<typeof EvidenceVault>;

export default metaVault;

type Story = StoryObj<typeof metaVault>;

export const Default: Story = {
  args: {
    caseId: 'case-123',
  },
};

export const WithMultipleEvidence: Story = {
  render: () => (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50 p-6">
          <EvidenceDashboard 
            onNavigate={(view) => console.log('Navigate to:', view)}
          />
        </div>
      </ToastProvider>
    </ThemeProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dashboard view with evidence metrics, charts, and recent activity.',
      },
    },
  },
};

// ============================================================================
// EVIDENCE INVENTORY
// ============================================================================

export const Inventory: StoryObj<Meta<typeof EvidenceInventory>> = {
  render: () => (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50">
          <EvidenceInventory 
            onViewEvidence={(id) => console.log('View evidence:', id)}
          />
        </div>
      </ToastProvider>
    </ThemeProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive evidence inventory with search, filter, and management tools.',
      },
    },
  },
};

// ============================================================================
// EVIDENCE INTAKE
// ============================================================================

export const Intake: StoryObj<Meta<typeof EvidenceIntake>> = {
  render: () => (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50 p-6">
          <EvidenceIntake 
            caseId="case-123"
            onComplete={() => console.log('Intake complete')}
            onCancel={() => console.log('Intake cancelled')}
          />
        </div>
      </ToastProvider>
    </ThemeProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Workflow for adding new evidence items with metadata and documentation.',
      },
    },
  },
};

// ============================================================================
// CHAIN OF CUSTODY
// ============================================================================

export const ChainOfCustody: StoryObj<Meta<typeof EvidenceChainOfCustody>> = {
  render: () => (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50 p-6">
          <EvidenceChainOfCustody evidenceId="evidence-123" />
        </div>
      </ToastProvider>
    </ThemeProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Track complete chain of custody for evidence with timeline and transfers.',
      },
    },
  },
};

// ============================================================================
// ADMISSIBILITY ANALYSIS
// ============================================================================

export const Admissibility: StoryObj<Meta<typeof EvidenceAdmissibility>> = {
  render: () => (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50 p-6">
          <EvidenceAdmissibility 
            caseId="case-123"
            evidenceId="evidence-123"
          />
        </div>
      </ToastProvider>
    </ThemeProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Analyze evidence admissibility based on Federal Rules of Evidence.',
      },
    },
  },
};

// ============================================================================
// FORENSICS
// ============================================================================

export const Forensics: StoryObj<Meta<typeof EvidenceForensics>> = {
  render: () => (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50 p-6">
          <EvidenceForensics 
            caseId="case-123"
            evidenceId="evidence-123"
          />
        </div>
      </ToastProvider>
    </ThemeProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Digital forensics analysis tools for electronic evidence.',
      },
    },
  },
};

// ============================================================================
// EVIDENCE DETAIL
// ============================================================================

export const Detail: StoryObj<Meta<typeof EvidenceDetail>> = {
  render: () => (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50 p-6">
          <EvidenceDetail 
            evidenceId="evidence-123"
            onClose={() => console.log('Close detail')}
          />
        </div>
      </ToastProvider>
    </ThemeProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Detailed view of individual evidence item with all metadata and history.',
      },
    },
  },
};
