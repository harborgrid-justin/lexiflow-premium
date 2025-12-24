import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CaseId, Witness, Expert, Advisor, CaseStrategy, TrialExhibit } from '../../../../frontend/types';
import { WarRoom } from '../../../../frontend/components/litigation/war-room/WarRoom';
import { CommandCenter } from '../../../../frontend/components/litigation/war-room/CommandCenter';
import { EvidenceWall } from '../../../../frontend/components/litigation/war-room/EvidenceWall';
import { AdvisoryBoard } from '../../../../frontend/components/litigation/war-room/AdvisoryBoard';
import { OppositionManager } from '../../../../frontend/components/litigation/war-room/OppositionManager';
import { WitnessPrep } from '../../../../frontend/components/litigation/war-room/WitnessPrep';
import { TrialBinder } from '../../../../frontend/components/litigation/war-room/TrialBinder';
import { ThemeProvider } from '../../../../frontend/context/ThemeContext';
import { ToastProvider } from '../../../../frontend/context/ToastContext';
import React from 'react';

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
  },
  tags: ['autodocs'],
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <ToastProvider>
          <div className="min-h-screen bg-slate-900">
            <Story />
          </div>
        </ToastProvider>
      </ThemeProvider>
    ),
  ],
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
          <CommandCenter caseId="case-123" />
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
          <EvidenceWall caseId="case-123" />
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
          <WitnessPrep caseId="case-123" />
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
          <TrialBinder caseId="case-123" />
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
