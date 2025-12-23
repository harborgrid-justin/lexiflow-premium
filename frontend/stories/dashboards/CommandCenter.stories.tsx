import type { Meta, StoryObj } from '@storybook/react-vite';
import { CommandCenter } from '../components/litigation/war-room/CommandCenter';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import React from 'react';

/**
 * CommandCenter is the litigation war room providing real-time case monitoring,
 * strategic planning, and team coordination during active litigation.
 * 
 * ## Features
 * - Real-time case status monitoring
 * - Strategic planning board
 * - Team coordination tools
 * - Document collaboration
 * - Deadline tracking
 * - Evidence organization
 * - Motion tracking
 * - Hearing preparation
 * - Trial readiness checklist
 * - Communication hub
 */
const meta = {
  title: 'Pages/Command Center',
  component: CommandCenter,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Litigation war room for real-time case monitoring and strategic team coordination.',
      },
    },
  },
  tags: ['autodocs', 'page'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <ToastProvider>
          <div className="h-screen w-screen">
            <Story />
          </div>
        </ToastProvider>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof CommandCenter>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for stories
const mockWarRoomData = {
  caseId: 'case-123',
  caseName: 'Smith v. Johnson Corp.',
  status: 'active',
  nextHearing: '2024-03-15',
  teamMembers: [],
  recentActivity: [],
  deadlines: [],
  documents: [],
  motions: [],
  case: {
    id: 'case-123',
    caseNumber: 'CV-2024-001',
    title: 'Smith v. Johnson Corp.',
    status: 'active',
    jurisdiction: 'Federal',
    courtName: 'US District Court',
    filingDate: '2024-01-15',
  },
  witnesses: [],
  docket: [],
  evidence: [],
  tasks: [],
};

const mockOnNavigate = (view: string, context?: Record<string, unknown>) => {
  console.log('Navigate to:', view, context);
};

/**
 * Default command center view
 */
export const Default: Story = {
  args: {
    caseId: 'case-123',
    warRoomData: mockWarRoomData,
    onNavigate: mockOnNavigate,
  },
};

/**
 * Mobile responsive view
 */
export const Mobile: Story = {
  args: {
    caseId: 'case-123',
    warRoomData: mockWarRoomData,
    onNavigate: mockOnNavigate,
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
    caseId: 'case-123',
    warRoomData: mockWarRoomData,
    onNavigate: mockOnNavigate,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
