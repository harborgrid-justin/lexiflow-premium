import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CaseId, WarRoomData } from '@/types';
import { CaseStatus, MatterType } from '@/types';
import { WarRoom } from '../../../../features/litigation/war-room/WarRoom';
import { CommandCenter } from '../../../../features/litigation/war-room/CommandCenter';
import { EvidenceWall } from '../../../../features/litigation/war-room/EvidenceWall';
import { AdvisoryBoard } from '../../../../features/litigation/war-room/AdvisoryBoard';
import { OppositionManager } from '../../../../features/litigation/war-room/OppositionManager';
import { WitnessPrep } from '../../../../features/litigation/war-room/WitnessPrep';
import { TrialBinder } from '../../../../features/litigation/war-room/TrialBinder';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/providers';

// ============================================================================
// MOCK DATA
// ============================================================================
const mockWarRoomData: WarRoomData = {
  case: {
    id: 'case-123' as CaseId,
    caseNumber: 'CV-2024-001',
    title: 'Smith v. Johnson Corp.',
    status: CaseStatus.Active,
    jurisdiction: 'Federal',
    court: 'US District Court',
    filingDate: '2024-01-15',
    client: 'Smith',
    parties: [],
    citations: [],
    arguments: [],
    defenses: [],
    matterType: MatterType.LITIGATION,
    isArchived: false,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  witnesses: [],
  documents: [],
  motions: [],
  docket: [],
  evidence: [],
  tasks: [],
};

const mockOnNavigate = (view: string, context?: Record<string, unknown>) => {
  console.log('Navigate to:', view, context);
};

/**
 * War Room components provide trial preparation and command center functionality
 * for managing complex litigation with team collaboration.
 * 
 * ## Features
 * - Strategic command center
 * - Evidence wall and organization
 * - Advisory board and team coordination
 * - Opposition research and tracking
 * - Witness preparation tools
 * - Trial binder generation
 * - Real-time collaboration
 * - Timeline and strategy visualization
 */

// ============================================================================
// WAR ROOM (Main)
// ============================================================================

const metaWarRoom = {
  title: 'Litigation/War Room/Main',
  component: WarRoom,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'neutral', value: '#f5f5f5' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
    docs: {
      description: {
        component: 'Comprehensive war room interface for trial preparation and team coordination.',
      },
    },
  }
} satisfies Meta<typeof WarRoom>;

export default metaWarRoom;

type Story = StoryObj<typeof metaWarRoom>;

export const Default: Story = {
  args: {
    caseId: 'case-123',
  },
};

export const HighStakesCase: Story = {
  render: () => (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-900">
          <CommandCenter caseId="case-123" warRoomData={mockWarRoomData} onNavigate={mockOnNavigate} />
        </div>
      </ToastProvider>
    </ThemeProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Strategic command center with real-time case overview and critical updates.',
      },
    },
  },
};

// ============================================================================
// EVIDENCE WALL
// ============================================================================

export const Wall: StoryObj<Meta<typeof EvidenceWall>> = {
  render: () => (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-900">
          <EvidenceWall caseId="case-123" warRoomData={mockWarRoomData} />
        </div>
      </ToastProvider>
    </ThemeProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Visual evidence wall for organizing and connecting case materials.',
      },
    },
  },
};

// ============================================================================
// ADVISORY BOARD
// ============================================================================

export const Advisory: StoryObj<Meta<typeof AdvisoryBoard>> = {
  render: () => (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50 p-6">
          <AdvisoryBoard caseId="case-123" />
        </div>
      </ToastProvider>
    </ThemeProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Coordinate with experts, consultants, and advisory team members.',
      },
    },
  },
};

// ============================================================================
// OPPOSITION MANAGER
// ============================================================================

export const Opposition: StoryObj<Meta<typeof OppositionManager>> = {
  render: () => (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50 p-6">
          <OppositionManager caseId="case-123" />
        </div>
      </ToastProvider>
    </ThemeProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Track opposing counsel, their strategies, and case arguments.',
      },
    },
  },
};

// ============================================================================
// WITNESS PREP
// ============================================================================

export const WitnessPreparation: StoryObj<Meta<typeof WitnessPrep>> = {
  render: () => (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50 p-6">
          <WitnessPrep caseId="case-123" warRoomData={mockWarRoomData} />
        </div>
      </ToastProvider>
    </ThemeProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Prepare witnesses with question banks, practice sessions, and coaching.',
      },
    },
  },
};

// ============================================================================
// TRIAL BINDER
// ============================================================================

export const Binder: StoryObj<Meta<typeof TrialBinder>> = {
  render: () => (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50 p-6">
          <TrialBinder caseId="case-123" warRoomData={mockWarRoomData} />
        </div>
      </ToastProvider>
    </ThemeProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Generate comprehensive trial binders with organized case materials.',
      },
    },
  },
};
