import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DocketFilterPanel } from '@/features/matters/components/docket/DocketFilterPanel';
import { Case, CaseStatus } from '@/types';
import { ThemeProvider } from '@/providers/ThemeContext';
import React from 'react';

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
    id: 'case-1' as any,
    title: 'Smith v. Acme Corporation',
    caseNumber: '2024-CV-12345',
    status: CaseStatus.ACTIVE,
    court: 'US District Court, Southern District of New York',
    judge: 'Hon. Sarah Martinez',
    dateFiled: '2024-01-15',
    parties: [
      { id: 'party-1' as any, name: 'John Smith', role: 'Plaintiff', caseId: 'case-1' as any, createdAt: '', updatedAt: '', userId: 'user-1' as any },
      { id: 'party-2' as any, name: 'Acme Corporation', role: 'Defendant', caseId: 'case-1' as any, createdAt: '', updatedAt: '', userId: 'user-1' as any },
    ],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-12-20T15:30:00Z',
    userId: 'user-1' as any,
  },
  {
    id: 'case-2' as any,
    title: 'Johnson Industries v. XYZ Corp',
    caseNumber: '2024-CV-67890',
    status: CaseStatus.ACTIVE,
    court: 'US District Court, Southern District of New York',
    judge: 'Hon. Michael Chen',
    dateFiled: '2024-03-20',
    parties: [
      { id: 'party-3' as any, name: 'Johnson Industries', role: 'Plaintiff', caseId: 'case-2' as any, createdAt: '', updatedAt: '', userId: 'user-1' as any },
      { id: 'party-4' as any, name: 'XYZ Corp', role: 'Defendant', caseId: 'case-2' as any, createdAt: '', updatedAt: '', userId: 'user-1' as any },
    ],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-12-22T11:15:00Z',
    userId: 'user-1' as any,
  },
  {
    id: 'case-3' as any,
    title: 'United States v. Anderson',
    caseNumber: '2024-CR-11111',
    status: CaseStatus.ACTIVE,
    court: 'US District Court, Eastern District of California',
    judge: 'Hon. Robert Williams',
    dateFiled: '2024-06-10',
    parties: [
      { id: 'party-5' as any, name: 'United States of America', role: 'Plaintiff', caseId: 'case-3' as any, createdAt: '', updatedAt: '', userId: 'user-1' as any },
      { id: 'party-6' as any, name: 'David Anderson', role: 'Defendant', caseId: 'case-3' as any, createdAt: '', updatedAt: '', userId: 'user-1' as any },
    ],
    createdAt: '2024-06-10T14:00:00Z',
    updatedAt: '2024-12-23T09:45:00Z',
    userId: 'user-1' as any,
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
