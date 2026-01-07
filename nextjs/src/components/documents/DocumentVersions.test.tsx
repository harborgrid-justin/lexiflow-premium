/**
 * DocumentVersions Component Tests
 * Enterprise-grade tests for document version history modal.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentVersions } from './DocumentVersions';
import type { LegalDocument, DocumentVersion, UserRole } from '@/types/documents';

// Mock @/lib/utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('DocumentVersions', () => {
  const mockVersion: DocumentVersion = {
    id: 'ver-001',
    versionNumber: 1,
    uploadDate: '2024-01-10',
    uploadedBy: 'John Doe',
  };

  const mockDocument: LegalDocument = {
    id: 'doc-001',
    title: 'Contract Agreement v2',
    type: 'Contract',
    lastModified: '2024-01-15',
    caseId: 'CASE-001',
    sourceModule: 'Contracts',
    fileSize: '1.2 MB',
    status: 'Final',
    tags: ['Important'],
    versions: [mockVersion],
    content: '',
    uploadDate: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    userId: 'user-1',
  };

  const mockOnRestore = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders Version History heading', () => {
      render(
        <DocumentVersions
          document={mockDocument}
          userRole="Administrator"
          onRestore={mockOnRestore}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Version History')).toBeInTheDocument();
    });

    it('renders document title', () => {
      render(
        <DocumentVersions
          document={mockDocument}
          userRole="Administrator"
          onRestore={mockOnRestore}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Contract Agreement v2')).toBeInTheDocument();
    });

    it('renders close button', () => {
      const { container } = render(
        <DocumentVersions
          document={mockDocument}
          userRole="Administrator"
          onRestore={mockOnRestore}
          onClose={mockOnClose}
        />
      );

      const closeButton = container.querySelector('button[class*="rounded-full"]');
      expect(closeButton).toBeInTheDocument();
    });

    it('renders current version section', () => {
      render(
        <DocumentVersions
          document={mockDocument}
          userRole="Administrator"
          onRestore={mockOnRestore}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('CURRENT')).toBeInTheDocument();
      expect(screen.getByText('Current Version')).toBeInTheDocument();
    });

    it('renders last modified date', () => {
      render(
        <DocumentVersions
          document={mockDocument}
          userRole="Administrator"
          onRestore={mockOnRestore}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/last modified:/i)).toBeInTheDocument();
    });
  });

  describe('Version List', () => {
    it('renders version items', () => {
      render(
        <DocumentVersions
          document={mockDocument}
          userRole="Administrator"
          onRestore={mockOnRestore}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Version 1')).toBeInTheDocument();
    });

    it('shows upload date for each version', () => {
      render(
        <DocumentVersions
          document={mockDocument}
          userRole="Administrator"
          onRestore={mockOnRestore}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('2024-01-10')).toBeInTheDocument();
    });

    it('shows uploader for each version', () => {
      render(
        <DocumentVersions
          document={mockDocument}
          userRole="Administrator"
          onRestore={mockOnRestore}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/by john doe/i)).toBeInTheDocument();
    });

    it('shows empty state when no versions', () => {
      const docWithoutVersions = { ...mockDocument, versions: [] };
      render(
        <DocumentVersions
          document={docWithoutVersions}
          userRole="Administrator"
          onRestore={mockOnRestore}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('No previous versions available.')).toBeInTheDocument();
    });

    it('renders multiple versions', () => {
      const multiVersionDoc = {
        ...mockDocument,
        versions: [
          { ...mockVersion, id: 'ver-001', versionNumber: 1 },
          { ...mockVersion, id: 'ver-002', versionNumber: 2, uploadDate: '2024-01-12' },
          { ...mockVersion, id: 'ver-003', versionNumber: 3, uploadDate: '2024-01-14' },
        ],
      };

      render(
        <DocumentVersions
          document={multiVersionDoc}
          userRole="Administrator"
          onRestore={mockOnRestore}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Version 1')).toBeInTheDocument();
      expect(screen.getByText('Version 2')).toBeInTheDocument();
      expect(screen.getByText('Version 3')).toBeInTheDocument();
    });
  });

  describe('Restore Functionality', () => {
    describe('Administrator Role', () => {
      it('shows Restore button for Administrator', () => {
        render(
          <DocumentVersions
            document={mockDocument}
            userRole="Administrator"
            onRestore={mockOnRestore}
            onClose={mockOnClose}
          />
        );

        expect(screen.getByRole('button', { name: /restore/i })).toBeInTheDocument();
      });

      it('calls onRestore when Restore button clicked', async () => {
        const user = userEvent.setup();
        render(
          <DocumentVersions
            document={mockDocument}
            userRole="Administrator"
            onRestore={mockOnRestore}
            onClose={mockOnClose}
          />
        );

        await user.click(screen.getByRole('button', { name: /restore/i }));

        expect(mockOnRestore).toHaveBeenCalledWith(mockVersion);
      });

      it('does not show permission warning', () => {
        render(
          <DocumentVersions
            document={mockDocument}
            userRole="Administrator"
            onRestore={mockOnRestore}
            onClose={mockOnClose}
          />
        );

        expect(screen.queryByText(/only partners and admins/i)).not.toBeInTheDocument();
      });
    });

    describe('Senior Partner Role', () => {
      it('shows Restore button for Senior Partner', () => {
        render(
          <DocumentVersions
            document={mockDocument}
            userRole="Senior Partner"
            onRestore={mockOnRestore}
            onClose={mockOnClose}
          />
        );

        expect(screen.getByRole('button', { name: /restore/i })).toBeInTheDocument();
      });

      it('does not show permission warning', () => {
        render(
          <DocumentVersions
            document={mockDocument}
            userRole="Senior Partner"
            onRestore={mockOnRestore}
            onClose={mockOnClose}
          />
        );

        expect(screen.queryByText(/only partners and admins/i)).not.toBeInTheDocument();
      });
    });

    describe('Associate Role', () => {
      it('does not show Restore button for Associate', () => {
        render(
          <DocumentVersions
            document={mockDocument}
            userRole="Associate"
            onRestore={mockOnRestore}
            onClose={mockOnClose}
          />
        );

        expect(screen.queryByRole('button', { name: /restore/i })).not.toBeInTheDocument();
      });

      it('shows permission warning for Associate', () => {
        render(
          <DocumentVersions
            document={mockDocument}
            userRole="Associate"
            onRestore={mockOnRestore}
            onClose={mockOnClose}
          />
        );

        expect(screen.getByText(/only partners and admins can restore versions/i)).toBeInTheDocument();
      });
    });

    describe('Other Roles', () => {
      it('does not show Restore button for Paralegal', () => {
        render(
          <DocumentVersions
            document={mockDocument}
            userRole="Paralegal" as UserRole}
            onRestore={mockOnRestore}
            onClose={mockOnClose}
          />
        );

        expect(screen.queryByRole('button', { name: /restore/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Close Modal', () => {
    it('calls onClose when close button clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <DocumentVersions
          document={mockDocument}
          userRole="Administrator"
          onRestore={mockOnRestore}
          onClose={mockOnClose}
        />
      );

      const closeButton = container.querySelector('button[class*="rounded-full"]');
      await user.click(closeButton!);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Modal Styling', () => {
    it('has backdrop blur', () => {
      const { container } = render(
        <DocumentVersions
          document={mockDocument}
          userRole="Administrator"
          onRestore={mockOnRestore}
          onClose={mockOnClose}
        />
      );

      expect(container.firstChild).toHaveClass('backdrop-blur-sm');
    });

    it('modal is fixed positioned', () => {
      const { container } = render(
        <DocumentVersions
          document={mockDocument}
          userRole="Administrator"
          onRestore={mockOnRestore}
          onClose={mockOnClose}
        />
      );

      expect(container.firstChild).toHaveClass('fixed', 'inset-0');
    });

    it('modal has z-index', () => {
      const { container } = render(
        <DocumentVersions
          document={mockDocument}
          userRole="Administrator"
          onRestore={mockOnRestore}
          onClose={mockOnClose}
        />
      );

      expect(container.firstChild).toHaveClass('z-50');
    });

    it('modal content has max width', () => {
      const { container } = render(
        <DocumentVersions
          document={mockDocument}
          userRole="Administrator"
          onRestore={mockOnRestore}
          onClose={mockOnClose}
        />
      );

      const modalContent = container.querySelector('.max-w-2xl');
      expect(modalContent).toBeInTheDocument();
    });

    it('version list is scrollable', () => {
      const { container } = render(
        <DocumentVersions
          document={mockDocument}
          userRole="Administrator"
          onRestore={mockOnRestore}
          onClose={mockOnClose}
        />
      );

      const scrollableArea = container.querySelector('.max-h-\\[60vh\\].overflow-y-auto');
      expect(scrollableArea).toBeInTheDocument();
    });
  });

  describe('Current Version Styling', () => {
    it('current version has emerald border', () => {
      const { container } = render(
        <DocumentVersions
          document={mockDocument}
          userRole="Administrator"
          onRestore={mockOnRestore}
          onClose={mockOnClose}
        />
      );

      const currentVersion = container.querySelector('.border-emerald-200');
      expect(currentVersion).toBeInTheDocument();
    });

    it('CURRENT badge has correct styling', () => {
      render(
        <DocumentVersions
          document={mockDocument}
          userRole="Administrator"
          onRestore={mockOnRestore}
          onClose={mockOnClose}
        />
      );

      const currentBadge = screen.getByText('CURRENT');
      expect(currentBadge).toHaveClass('text-emerald-700');
    });
  });

  describe('Dark Mode', () => {
    it('modal has dark mode background', () => {
      const { container } = render(
        <DocumentVersions
          document={mockDocument}
          userRole="Administrator"
          onRestore={mockOnRestore}
          onClose={mockOnClose}
        />
      );

      const modal = container.querySelector('.dark\\:bg-slate-900');
      expect(modal).toBeInTheDocument();
    });

    it('header has dark mode styling', () => {
      const { container } = render(
        <DocumentVersions
          document={mockDocument}
          userRole="Administrator"
          onRestore={mockOnRestore}
          onClose={mockOnClose}
        />
      );

      const header = container.querySelector('.dark\\:bg-slate-800\\/50');
      expect(header).toBeInTheDocument();
    });

    it('text has dark mode colors', () => {
      render(
        <DocumentVersions
          document={mockDocument}
          userRole="Administrator"
          onRestore={mockOnRestore}
          onClose={mockOnClose}
        />
      );

      const title = screen.getByText('Version History');
      expect(title).toHaveClass('text-slate-900', 'dark:text-slate-100');
    });
  });

  describe('Accessibility', () => {
    it('close button is accessible', () => {
      const { container } = render(
        <DocumentVersions
          document={mockDocument}
          userRole="Administrator"
          onRestore={mockOnRestore}
          onClose={mockOnClose}
        />
      );

      const closeButton = container.querySelector('button');
      expect(closeButton).toBeInTheDocument();
    });

    it('restore buttons are accessible', () => {
      render(
        <DocumentVersions
          document={mockDocument}
          userRole="Administrator"
          onRestore={mockOnRestore}
          onClose={mockOnClose}
        />
      );

      const restoreButton = screen.getByRole('button', { name: /restore/i });
      expect(restoreButton).toBeEnabled();
    });

    it('warning message has alert icon', () => {
      const { container } = render(
        <DocumentVersions
          document={mockDocument}
          userRole="Associate"
          onRestore={mockOnRestore}
          onClose={mockOnClose}
        />
      );

      const warningIcon = container.querySelector('.text-amber-800 svg, .h-4.w-4.mr-2');
      expect(warningIcon).toBeInTheDocument();
    });
  });
});
