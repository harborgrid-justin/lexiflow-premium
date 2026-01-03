import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CaseId, EvidenceId, UserId, UUID } from '@/types';
import { EvidenceDashboard } from '../../../../features/litigation/evidence/EvidenceDashboard';
import { EvidenceVault } from '../../../../features/litigation/evidence/EvidenceVault';
import { EvidenceInventory } from '../../../../features/litigation/evidence/EvidenceInventory';
import { EvidenceIntake } from '../../../../features/litigation/evidence/EvidenceIntake';
import { EvidenceChainOfCustody } from '../../../../features/litigation/evidence/EvidenceChainOfCustody';
import { EvidenceAdmissibility } from '../../../../features/litigation/evidence/EvidenceAdmissibility';
import { EvidenceForensics } from '../../../../features/litigation/evidence/EvidenceForensics';
import { EvidenceDetail } from '../../../../features/litigation/evidence/EvidenceDetail';
import { ThemeProvider } from '@/providers';
import { ToastProvider } from '@/providers';

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
        component: 'Secure evidence vault with comprehensive tracking and management capabilities.',
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
            items={[]}
            filteredItems={[]}
            filters={{ search: '', type: '', admissibility: '', caseId: '', custodian: '', dateFrom: '', dateTo: '', location: '', tags: '', collectedBy: '', hasBlockchain: false }}
            setFilters={() => {}}
            onItemClick={(item) => console.log('View evidence:', item.id)}
            onIntakeClick={() => console.log('Open intake')}
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
            handleBack={() => console.log('Back clicked')}
            onComplete={() => console.log('Intake complete')}
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
  render: () => {
    const mockEvidence = {
      id: 'evidence-123' as EvidenceId,
      trackingUuid: 'uuid-123' as UUID,
      caseId: 'case-123' as CaseId,
      title: 'Sample Evidence',
      type: 'Document' as const,
      description: 'Sample evidence item',
      collectionDate: '2024-01-15',
      collectedBy: 'John Doe',
      custodian: 'Evidence Locker',
      location: 'Building A',
      admissibility: 'Pending' as const,
      tags: [],
      chainOfCustody: [],
      createdAt: '',
      updatedAt: '',
      userId: 'user-1' as UserId,
    };

    return (
      <ThemeProvider>
        <ToastProvider>
          <div className="min-h-screen bg-slate-50 p-6">
            <EvidenceChainOfCustody
              selectedItem={mockEvidence}
              onCustodyUpdate={() => console.log('Custody updated')}
            />
          </div>
        </ToastProvider>
      </ThemeProvider>
    );
  },
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
  render: () => {
    const mockEvidence = {
      id: 'evidence-123' as EvidenceId,
      trackingUuid: 'uuid-123' as UUID,
      caseId: 'case-123' as CaseId,
      title: 'Sample Evidence',
      type: 'Document' as const,
      description: 'Sample evidence item',
      collectionDate: '2024-01-15',
      collectedBy: 'John Doe',
      custodian: 'Evidence Locker',
      location: 'Building A',
      admissibility: 'Challenged' as const,
      tags: [],
      chainOfCustody: [],
      linkedRules: ['FRE 401', 'FRE 901'],
      createdAt: '',
      updatedAt: '',
      userId: 'user-1' as UserId,
    };

    return (
      <ThemeProvider>
        <ToastProvider>
          <div className="min-h-screen bg-slate-50 p-6">
            <EvidenceAdmissibility
              selectedItem={mockEvidence}
            />
          </div>
        </ToastProvider>
      </ThemeProvider>
    );
  },
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
  render: () => {
    const mockEvidence = {
      id: 'evidence-123' as EvidenceId,
      trackingUuid: 'uuid-123' as UUID,
      caseId: 'case-123' as CaseId,
      title: 'Sample Digital Evidence.pdf',
      type: 'Digital' as const,
      description: 'Sample evidence item for forensics',
      collectionDate: '2024-01-15',
      collectedBy: 'John Doe',
      custodian: 'Evidence Locker',
      location: 'Digital Storage',
      admissibility: 'Pending' as const,
      tags: [],
      chainOfCustody: [],
      blockchainHash: 'abc123def456789abc123def456789abc123def456789abc123def456789',
      fileSize: '2,405 KB',
      fileType: 'application/pdf',
      createdAt: '',
      updatedAt: '',
      userId: 'user-1' as UserId,
    };

    return (
      <ThemeProvider>
        <ToastProvider>
          <div className="min-h-screen bg-slate-50 p-6">
            <EvidenceForensics
              selectedItem={mockEvidence}
            />
          </div>
        </ToastProvider>
      </ThemeProvider>
    );
  },
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
  render: () => {
    const mockEvidence = {
      id: 'evidence-123' as EvidenceId,
      trackingUuid: 'uuid-123' as UUID,
      caseId: 'case-123' as CaseId,
      title: 'Sample Evidence',
      type: 'Document' as const,
      description: 'Sample evidence item',
      collectionDate: '2024-01-15',
      collectedBy: 'John Doe',
      custodian: 'Evidence Locker',
      location: 'Building A',
      admissibility: 'Pending' as const,
      tags: [],
      chainOfCustody: [],
      createdAt: '',
      updatedAt: '',
      userId: 'user-1' as UserId,
    };

    return (
      <ThemeProvider>
        <ToastProvider>
          <div className="min-h-screen bg-slate-50 p-6">
            <EvidenceDetail
              selectedItem={mockEvidence}
              handleBack={() => console.log('Back clicked')}
              activeTab="overview"
              setActiveTab={(tab) => console.log('Tab changed:', tab)}
              onNavigateToCase={(caseId) => console.log('Navigate to case:', caseId)}
            />
          </div>
        </ToastProvider>
      </ThemeProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Detailed view of individual evidence item with all metadata and history.',
      },
    },
  },
};
