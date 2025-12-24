/**
 * Document Versions Component Story
 * 
 * Modal for viewing and restoring document version history.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DocumentVersions } from '../../../../features/operations/documents/DocumentVersions';
import { ThemeProvider } from '../../../../frontend/providers/ThemeContext';
import { LegalDocument, DocumentId, CaseId } from '../../../../frontend/types';

const meta: Meta<typeof DocumentVersions> = {
  title: 'Documents/Document Versions',
  component: DocumentVersions,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'neutral',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'neutral', value: '#f5f5f5' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
    docs: {
      description: {
        component: 'Version history modal showing document revisions with restore capability for authorized users.'
      }
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    )
  ],
  argTypes: {
    userRole: {
      control: 'select',
      options: ['Senior Partner', 'Partner', 'Associate', 'Paralegal', 'Administrator'],
      description: 'User role for restore permissions'
    }
  }
};

export default meta;
type Story = StoryObj<typeof DocumentVersions>;

const mockDocument: LegalDocument = {
  id: '1' as any,
  title: 'Motion to Dismiss - Updated.pdf',
  type: 'Pleading',
  status: 'Active',
  lastModified: '2024-12-20 3:45 PM',
  uploadDate: '2024-12-01',
  createdAt: '2024-12-01',
  updatedAt: '2024-12-20',
  creatorId: 'user1' as any,
  caseId: 'case1' as any,
  content: '',
  tags: ['motion', 'dismiss', 'pleading'],
  versions: [
    {
      id: 'v3' as any,
      versionNumber: 3,
      uploadDate: '2024-12-15 2:30 PM',
      uploadedBy: 'Sarah Johnson',
      createdAt: '2024-12-15',
      updatedAt: '2024-12-15'
    },
    {
      id: 'v2' as any,
      versionNumber: 2,
      uploadDate: '2024-12-10 10:15 AM',
      uploadedBy: 'Michael Chen',
      createdAt: '2024-12-10',
      updatedAt: '2024-12-10'
    },
    {
      id: 'v1' as any,
      versionNumber: 1,
      uploadDate: '2024-12-01 9:00 AM',
      uploadedBy: 'Sarah Johnson',
      createdAt: '2024-12-01',
      updatedAt: '2024-12-01'
    }
  ]
};

/**
 * Partner view with restore permissions.
 */
export const PartnerView: Story = {
  args: {
    document: mockDocument,
    userRole: 'Senior Partner',
    onRestore: fn(),
    onClose: fn()
  }
};

/**
 * Associate view without restore permissions.
 */
export const AssociateView: Story = {
  args: {
    document: mockDocument,
    userRole: 'Associate',
    onRestore: fn(),
    onClose: fn()
  }
};

/**
 * Administrator with permissions.
 */
export const AdminView: Story = {
  args: {
    document: mockDocument,
    userRole: 'Administrator',
    onRestore: fn(),
    onClose: fn()
  }
};

/**
 * Document with no versions.
 */
export const NoVersions: Story = {
  args: {
    document: {
      ...mockDocument,
      versions: []
    },
    userRole: 'Senior Partner',
    onRestore: fn(),
    onClose: fn()
  }
};

/**
 * Document with many versions.
 */
export const ManyVersions: Story = {
  args: {
    document: {
      ...mockDocument,
      versions: [
        ...mockDocument.versions,
        {
          id: 'v4' as any,
          versionNumber: 4,
          uploadDate: '2024-12-18 4:20 PM',
          uploadedBy: 'David Rodriguez',
          createdAt: '2024-12-18',
          updatedAt: '2024-12-18'
        },
        {
          id: 'v5' as any,
          versionNumber: 5,
          uploadDate: '2024-12-19 11:30 AM',
          uploadedBy: 'Sarah Johnson',
          createdAt: '2024-12-19',
          updatedAt: '2024-12-19'
        },
        {
          id: 'v6' as any,
          versionNumber: 6,
          uploadDate: '2024-12-19 5:15 PM',
          uploadedBy: 'Michael Chen',
          createdAt: '2024-12-19',
          updatedAt: '2024-12-19'
        }
      ]
    },
    userRole: 'Senior Partner',
    onRestore: fn(),
    onClose: fn()
  }
};

/**
 * Dark theme variant.
 */
export const DarkTheme: Story = {
  args: {
    document: mockDocument,
    userRole: 'Senior Partner',
    onRestore: fn(),
    onClose: fn()
  },
  parameters: {
    backgrounds: { default: 'dark' }
  }
};

/**
 * Paralegal view without permissions.
 */
export const ParalegalView: Story = {
  args: {
    document: mockDocument,
    userRole: 'Paralegal',
    onRestore: fn(),
    onClose: fn()
  }
};
