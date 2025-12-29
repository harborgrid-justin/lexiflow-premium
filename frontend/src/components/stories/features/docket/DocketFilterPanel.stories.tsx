import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DocketFilterPanel } from '@/features/cases/components/docket/DocketFilterPanel';
import { Case, CaseStatus } from '@/types';
import { ThemeProvider } from '@/providers/ThemeContext';

/**
 * DocketFilterPanel provides a sidebar filter panel for docket entries
 * with search capabilities and case selection.
 * 
 * ## Features
 * - Full-text search across docket entries
 * - Filter by entry type (all, filings, orders)
 * - Case selection for multi-case views
 * - Real-time filtering
 * - Responsive design
 */
const meta = {
  title: 'Docket/DocketFilterPanel',
  component: DocketFilterPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Sidebar filter panel for docket entries with search and case selection capabilities.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="max-w-md">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    searchTerm: {
      description: 'Current search term',
      control: 'text',
    },
    activeTab: {
      description: 'Active filter tab',
      control: 'select',
      options: ['all', 'filings', 'orders'],
    },
    selectedCaseId: {
      description: 'Currently selected case ID',
      control: 'text',
    },
    cases: {
      description: 'Array of cases for selection',
      control: 'object',
    },
  },
  args: {
    setSearchTerm: fn(),
    setActiveTab: fn(),
    setSelectedCaseId: fn(),
  },
} satisfies Meta<typeof DocketFilterPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock case data
const mockCases: Case[] = [
  {
    id: 'case-1' as Record<string, unknown>,
    title: 'Smith v. Acme Corporation',
    caseNumber: '2024-CV-12345',
    status: CaseStatus.Active,
    matterType: 'Civil' as Record<string, unknown>,
    isArchived: false,
    court: 'US District Court, Southern District of New York',
    judge: 'Hon. Sarah Martinez',
    filingDate: '2024-01-15',
    client: 'John Smith',
    parties: [
      { id: 'party-1' as Record<string, unknown>, name: 'John Smith', type: 'Plaintiff', role: 'Primary', caseId: 'case-1' as Record<string, unknown>, createdAt: '', updatedAt: '' },
      { id: 'party-2' as Record<string, unknown>, name: 'Acme Corporation', type: 'Defendant', role: 'Primary', caseId: 'case-1' as Record<string, unknown>, createdAt: '', updatedAt: '' },
    ],
    citations: [],
    arguments: [],
    defenses: [],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-12-20T15:30:00Z',
  },
  {
    id: 'case-2' as Record<string, unknown>,
    title: 'Johnson Industries v. XYZ Corp',
    caseNumber: '2024-CV-67890',
    status: CaseStatus.Active,
    matterType: 'Civil' as Record<string, unknown>,
    isArchived: false,
    court: 'US District Court, Southern District of New York',
    judge: 'Hon. Michael Chen',
    filingDate: '2024-03-20',
    client: 'Johnson Industries',
    parties: [
      { id: 'party-3' as Record<string, unknown>, name: 'Johnson Industries', type: 'Plaintiff', role: 'Primary', caseId: 'case-2' as Record<string, unknown>, createdAt: '', updatedAt: '' },
      { id: 'party-4' as Record<string, unknown>, name: 'XYZ Corp', type: 'Defendant', role: 'Primary', caseId: 'case-2' as Record<string, unknown>, createdAt: '', updatedAt: '' },
    ],
    citations: [],
    arguments: [],
    defenses: [],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-12-22T11:15:00Z',
  },
  {
    id: 'case-3' as Record<string, unknown>,
    title: 'United States v. Anderson',
    caseNumber: '2024-CR-11111',
    status: CaseStatus.Active,
    matterType: 'Criminal' as Record<string, unknown>,
    isArchived: false,
    court: 'US District Court, Eastern District of California',
    judge: 'Hon. Robert Williams',
    filingDate: '2024-06-10',
    client: 'United States of America',
    parties: [
      { id: 'party-5' as Record<string, unknown>, name: 'United States of America', type: 'Plaintiff', role: 'Primary', caseId: 'case-3' as Record<string, unknown>, createdAt: '', updatedAt: '' },
      { id: 'party-6' as Record<string, unknown>, name: 'David Anderson', type: 'Defendant', role: 'Primary', caseId: 'case-3' as Record<string, unknown>, createdAt: '', updatedAt: '' },
    ],
    citations: [],
    arguments: [],
    defenses: [],
    createdAt: '2024-06-10T14:00:00Z',
    updatedAt: '2024-12-23T09:45:00Z',
  },
];

/**
 * Default filter panel with no active filters
 */
export const Default: Story = {
  args: {
    searchTerm: '',
    activeTab: 'all',
    selectedCaseId: null,
    cases: mockCases,
  },
};

/**
 * Panel with active search query
 */
export const WithSearchTerm: Story = {
  args: {
    searchTerm: 'motion to dismiss',
    activeTab: 'all',
    selectedCaseId: null,
    cases: mockCases,
  },
};

/**
 * Filtered to show only filings
 */
export const FilingsOnly: Story = {
  args: {
    searchTerm: '',
    activeTab: 'filings',
    selectedCaseId: null,
    cases: mockCases,
  },
};

/**
 * Filtered to show only orders
 */
export const OrdersOnly: Story = {
  args: {
    searchTerm: '',
    activeTab: 'orders',
    selectedCaseId: null,
    cases: mockCases,
  },
};

/**
 * With a specific case selected
 */
export const CaseSelected: Story = {
  args: {
    searchTerm: '',
    activeTab: 'all',
    selectedCaseId: 'case-1',
    cases: mockCases,
  },
};

/**
 * Combined filters: search + type + case
 */
export const CombinedFilters: Story = {
  args: {
    searchTerm: 'summary judgment',
    activeTab: 'filings',
    selectedCaseId: 'case-2',
    cases: mockCases,
  },
};

/**
 * No cases available
 */
export const NoCases: Story = {
  args: {
    searchTerm: '',
    activeTab: 'all',
    selectedCaseId: null,
    cases: [],
  },
};

/**
 * Single case available
 */
export const SingleCase: Story = {
  args: {
    searchTerm: '',
    activeTab: 'all',
    selectedCaseId: null,
    cases: [mockCases[0]],
  },
};
