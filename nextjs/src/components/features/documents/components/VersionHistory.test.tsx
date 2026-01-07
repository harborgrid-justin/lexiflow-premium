/**
 * VersionHistory Component Tests
 * Enterprise-grade test suite for document version history display
 *
 * @module components/features/documents/VersionHistory.test
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VersionHistory } from './VersionHistory';
import type { DocumentVersion } from '@/types/documents';

// Mock formatDate utility
jest.mock('@/utils/formatters', () => ({
  formatDate: jest.fn((date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }),
}));

describe('VersionHistory', () => {
  const mockVersions: DocumentVersion[] = [
    {
      id: 'v1',
      versionNumber: 1,
      uploadDate: '2024-01-10',
      uploadedBy: 'John Doe',
      author: 'John Doe',
      checksum: 'abc123def456ghi789jkl',
    },
    {
      id: 'v2',
      versionNumber: 2,
      uploadDate: '2024-01-15',
      uploadedBy: 'Jane Smith',
      author: 'Jane Smith',
      checksum: 'xyz987wvu654tsr321qpo',
    },
    {
      id: 'v3',
      versionNumber: 3,
      uploadDate: '2024-01-20',
      uploadedBy: 'Bob Wilson',
      author: 'Bob Wilson',
      checksum: 'mno456pqr789stu012vwx',
    },
  ];

  const defaultProps = {
    versions: mockVersions,
    currentVersion: 3,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render Version History heading', () => {
      render(<VersionHistory {...defaultProps} />);

      expect(screen.getByText('Version History')).toBeInTheDocument();
    });

    it('should render version count', () => {
      render(<VersionHistory {...defaultProps} />);

      expect(screen.getByText('3 versions')).toBeInTheDocument();
    });

    it('should render singular "version" for single version', () => {
      render(<VersionHistory versions={[mockVersions[0]]} currentVersion={1} />);

      expect(screen.getByText('1 version')).toBeInTheDocument();
    });

    it('should render all versions', () => {
      render(<VersionHistory {...defaultProps} />);

      expect(screen.getByText('Version 1')).toBeInTheDocument();
      expect(screen.getByText('Version 2')).toBeInTheDocument();
      expect(screen.getByText('Version 3')).toBeInTheDocument();
    });

    it('should render version badges', () => {
      render(<VersionHistory {...defaultProps} />);

      expect(screen.getByText('v1')).toBeInTheDocument();
      expect(screen.getByText('v2')).toBeInTheDocument();
      expect(screen.getByText('v3')).toBeInTheDocument();
    });
  });

  describe('Version Sorting', () => {
    it('should sort versions in descending order (newest first)', () => {
      render(<VersionHistory {...defaultProps} />);

      const versionElements = screen.getAllByText(/Version \d/);
      expect(versionElements[0]).toHaveTextContent('Version 3');
      expect(versionElements[1]).toHaveTextContent('Version 2');
      expect(versionElements[2]).toHaveTextContent('Version 1');
    });
  });

  describe('Current Version Indicator', () => {
    it('should show Current badge for current version', () => {
      render(<VersionHistory {...defaultProps} />);

      expect(screen.getByText('Current')).toBeInTheDocument();
    });

    it('should highlight current version with different styling', () => {
      const { container } = render(<VersionHistory {...defaultProps} />);

      // Current version should have blue border/background
      const currentVersionCard = container.querySelector('.border-blue-200');
      expect(currentVersionCard).toBeInTheDocument();
    });

    it('should not show Current badge for non-current versions', () => {
      render(<VersionHistory {...defaultProps} />);

      // Only one Current badge
      const currentBadges = screen.getAllByText('Current');
      expect(currentBadges.length).toBe(1);
    });
  });

  describe('Version Details', () => {
    it('should display upload date for each version', () => {
      render(<VersionHistory {...defaultProps} />);

      expect(screen.getByText('Jan 10, 2024')).toBeInTheDocument();
      expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
      expect(screen.getByText('Jan 20, 2024')).toBeInTheDocument();
    });

    it('should display uploader name', () => {
      render(<VersionHistory {...defaultProps} />);

      expect(screen.getByText(/Uploaded by John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/Uploaded by Jane Smith/)).toBeInTheDocument();
      expect(screen.getByText(/Uploaded by Bob Wilson/)).toBeInTheDocument();
    });

    it('should display truncated checksum', () => {
      render(<VersionHistory {...defaultProps} />);

      expect(screen.getByText(/Checksum: abc123def456gi.../)).toBeInTheDocument();
    });

    it('should handle missing uploader name', () => {
      const versionsWithoutUploader: DocumentVersion[] = [
        {
          id: 'v1',
          versionNumber: 1,
          uploadDate: '2024-01-10',
          checksum: 'abc123',
        },
      ];
      render(<VersionHistory versions={versionsWithoutUploader} currentVersion={1} />);

      expect(screen.getByText(/Uploaded by Unknown/)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no versions', () => {
      render(<VersionHistory versions={[]} />);

      expect(screen.getByText('No version history available')).toBeInTheDocument();
    });

    it('should show empty state icon', () => {
      const { container } = render(<VersionHistory versions={[]} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Restore Action', () => {
    it('should show Restore button for non-current versions', () => {
      const mockOnRestore = jest.fn();
      render(<VersionHistory {...defaultProps} onRestore={mockOnRestore} />);

      const restoreButtons = screen.getAllByText('Restore');
      expect(restoreButtons.length).toBe(2); // For version 1 and 2
    });

    it('should not show Restore button for current version', () => {
      const mockOnRestore = jest.fn();
      render(<VersionHistory {...defaultProps} onRestore={mockOnRestore} />);

      // Version 3 (current) should not have restore button
      const restoreButtons = screen.getAllByText('Restore');
      expect(restoreButtons.length).toBe(2);
    });

    it('should call onRestore with version number when clicked', async () => {
      const user = userEvent.setup();
      const mockOnRestore = jest.fn();
      render(<VersionHistory {...defaultProps} onRestore={mockOnRestore} />);

      const restoreButtons = screen.getAllByText('Restore');
      await user.click(restoreButtons[0]); // Click restore for version 2

      expect(mockOnRestore).toHaveBeenCalledWith(2);
    });

    it('should not show Restore button when onRestore is not provided', () => {
      render(<VersionHistory {...defaultProps} />);

      expect(screen.queryByText('Restore')).not.toBeInTheDocument();
    });
  });

  describe('Compare Action', () => {
    it('should show Compare button for non-current versions', () => {
      const mockOnCompare = jest.fn();
      render(<VersionHistory {...defaultProps} onCompare={mockOnCompare} />);

      const compareButtons = screen.getAllByText('Compare');
      expect(compareButtons.length).toBe(2); // For version 1 and 2
    });

    it('should not show Compare button for current version', () => {
      const mockOnCompare = jest.fn();
      render(<VersionHistory {...defaultProps} onCompare={mockOnCompare} />);

      const compareButtons = screen.getAllByText('Compare');
      expect(compareButtons.length).toBe(2);
    });

    it('should call onCompare with current and selected version numbers', async () => {
      const user = userEvent.setup();
      const mockOnCompare = jest.fn();
      render(<VersionHistory {...defaultProps} onCompare={mockOnCompare} />);

      const compareButtons = screen.getAllByText('Compare');
      await user.click(compareButtons[0]); // Click compare for version 2

      expect(mockOnCompare).toHaveBeenCalledWith(3, 2); // current (3) vs selected (2)
    });

    it('should not show Compare button when onCompare is not provided', () => {
      render(<VersionHistory {...defaultProps} />);

      expect(screen.queryByText('Compare')).not.toBeInTheDocument();
    });

    it('should not show Compare button when currentVersion is not provided', () => {
      const mockOnCompare = jest.fn();
      render(<VersionHistory versions={mockVersions} onCompare={mockOnCompare} />);

      expect(screen.queryByText('Compare')).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have proper styling for current version', () => {
      const { container } = render(<VersionHistory {...defaultProps} />);

      const currentVersionCard = container.querySelector('.bg-blue-50');
      expect(currentVersionCard).toBeInTheDocument();
    });

    it('should have proper styling for non-current versions', () => {
      const { container } = render(<VersionHistory {...defaultProps} />);

      const nonCurrentCards = container.querySelectorAll('.bg-white');
      expect(nonCurrentCards.length).toBeGreaterThan(0);
    });

    it('should have dark mode support', () => {
      const { container } = render(<VersionHistory {...defaultProps} />);

      const darkModeElement = container.querySelector('.dark\\:bg-gray-800');
      expect(darkModeElement).toBeInTheDocument();
    });

    it('should render timeline line between versions', () => {
      const { container } = render(<VersionHistory {...defaultProps} />);

      const timelineLines = container.querySelectorAll('.bg-gray-200');
      expect(timelineLines.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle versions without checksum', () => {
      const versionsWithoutChecksum: DocumentVersion[] = [
        {
          id: 'v1',
          versionNumber: 1,
          uploadDate: '2024-01-10',
          uploadedBy: 'John Doe',
        },
      ];
      render(<VersionHistory versions={versionsWithoutChecksum} currentVersion={1} />);

      expect(screen.queryByText(/Checksum:/)).not.toBeInTheDocument();
    });

    it('should handle versions without id', () => {
      const versionsWithoutId: DocumentVersion[] = [
        {
          versionNumber: 1,
          uploadDate: '2024-01-10',
          uploadedBy: 'John Doe',
        },
      ];
      render(<VersionHistory versions={versionsWithoutId} currentVersion={1} />);

      expect(screen.getByText('Version 1')).toBeInTheDocument();
    });

    it('should use author as fallback for uploadedBy', () => {
      const versionsWithAuthor: DocumentVersion[] = [
        {
          id: 'v1',
          versionNumber: 1,
          uploadDate: '2024-01-10',
          author: 'Author Name',
        },
      ];
      render(<VersionHistory versions={versionsWithAuthor} currentVersion={1} />);

      expect(screen.getByText(/Uploaded by Author Name/)).toBeInTheDocument();
    });

    it('should handle single version that is current', () => {
      render(<VersionHistory versions={[mockVersions[0]]} currentVersion={1} />);

      expect(screen.getByText('Current')).toBeInTheDocument();
      expect(screen.queryByText('Restore')).not.toBeInTheDocument();
    });
  });
});
