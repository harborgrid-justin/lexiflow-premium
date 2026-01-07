/**
 * @fileoverview Enterprise-grade tests for AnnouncementsList component
 * @module components/announcements/AnnouncementsList.test
 *
 * Tests announcement rendering, priority badges, and empty states.
 */

import { render, screen } from '@testing-library/react';
import { AnnouncementsList } from './AnnouncementsList';

// ============================================================================
// TEST DATA FIXTURES
// ============================================================================

const mockAnnouncements = [
  {
    id: '1',
    title: 'Important System Update',
    author: 'Admin',
    publishDate: '2024-01-15',
    priority: 'urgent' as const,
    targetAudience: 'All Staff',
    content: 'System will be under maintenance.',
  },
  {
    id: '2',
    title: 'New Policy Notice',
    author: 'HR Department',
    publishDate: '2024-01-10',
    priority: 'high' as const,
    targetAudience: 'Legal Team',
    content: 'Please review the updated policy document.',
  },
  {
    id: '3',
    title: 'Training Session',
    author: 'Training Dept',
    publishDate: '2024-01-05',
    priority: 'medium' as const,
    targetAudience: 'New Hires',
    content: 'Mandatory training for all new team members.',
  },
  {
    id: '4',
    title: 'Office Event',
    author: 'Events Team',
    publishDate: '2024-01-01',
    priority: 'low' as const,
    targetAudience: 'All Staff',
  },
];

// ============================================================================
// HEADER TESTS
// ============================================================================

describe('AnnouncementsList', () => {
  describe('Header', () => {
    it('renders the Announcements title', () => {
      render(<AnnouncementsList initialAnnouncements={mockAnnouncements} />);
      expect(screen.getByRole('heading', { name: /announcements/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ANNOUNCEMENT RENDERING TESTS
  // ============================================================================

  describe('Announcement Rendering', () => {
    it('renders all announcements', () => {
      render(<AnnouncementsList initialAnnouncements={mockAnnouncements} />);

      expect(screen.getByText('Important System Update')).toBeInTheDocument();
      expect(screen.getByText('New Policy Notice')).toBeInTheDocument();
      expect(screen.getByText('Training Session')).toBeInTheDocument();
      expect(screen.getByText('Office Event')).toBeInTheDocument();
    });

    it('renders announcement authors', () => {
      render(<AnnouncementsList initialAnnouncements={mockAnnouncements} />);

      expect(screen.getByText(/by admin/i)).toBeInTheDocument();
      expect(screen.getByText(/by hr department/i)).toBeInTheDocument();
      expect(screen.getByText(/by training dept/i)).toBeInTheDocument();
      expect(screen.getByText(/by events team/i)).toBeInTheDocument();
    });

    it('renders announcement content when provided', () => {
      render(<AnnouncementsList initialAnnouncements={mockAnnouncements} />);

      expect(screen.getByText('System will be under maintenance.')).toBeInTheDocument();
      expect(screen.getByText('Please review the updated policy document.')).toBeInTheDocument();
    });

    it('does not render content paragraph when content is not provided', () => {
      render(<AnnouncementsList initialAnnouncements={mockAnnouncements} />);

      // Office Event has no content
      const eventCard = screen.getByText('Office Event').closest('div[class*="p-5"]');
      const paragraphs = eventCard?.querySelectorAll('p.text-sm.text-gray-700');
      expect(paragraphs?.length || 0).toBe(0);
    });

    it('renders target audience badges', () => {
      render(<AnnouncementsList initialAnnouncements={mockAnnouncements} />);

      expect(screen.getAllByText('All Staff')).toHaveLength(2);
      expect(screen.getByText('Legal Team')).toBeInTheDocument();
      expect(screen.getByText('New Hires')).toBeInTheDocument();
    });

    it('formats publish dates correctly', () => {
      render(<AnnouncementsList initialAnnouncements={mockAnnouncements} />);

      // Dates are formatted using toLocaleDateString
      // Check that dates are rendered (format depends on locale)
      const dateElements = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(dateElements.length).toBe(4);
    });
  });

  // ============================================================================
  // PRIORITY BADGE TESTS
  // ============================================================================

  describe('Priority Badges', () => {
    it('renders urgent priority badge with correct styling', () => {
      render(<AnnouncementsList initialAnnouncements={mockAnnouncements} />);

      const urgentBadge = screen.getByText('urgent');
      expect(urgentBadge).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('renders high priority badge with correct styling', () => {
      render(<AnnouncementsList initialAnnouncements={mockAnnouncements} />);

      const highBadge = screen.getByText('high');
      expect(highBadge).toHaveClass('bg-orange-100', 'text-orange-800');
    });

    it('renders medium priority badge with correct styling', () => {
      render(<AnnouncementsList initialAnnouncements={mockAnnouncements} />);

      const mediumBadge = screen.getByText('medium');
      expect(mediumBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('renders low priority badge with correct styling', () => {
      render(<AnnouncementsList initialAnnouncements={mockAnnouncements} />);

      const lowBadge = screen.getByText('low');
      expect(lowBadge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('applies correct badge styling classes', () => {
      render(<AnnouncementsList initialAnnouncements={mockAnnouncements} />);

      const badges = screen.getAllByText(/urgent|high|medium|low/);
      badges.forEach(badge => {
        expect(badge).toHaveClass('px-3', 'py-1', 'text-xs', 'font-semibold', 'rounded-full');
      });
    });
  });

  // ============================================================================
  // EMPTY STATE TESTS
  // ============================================================================

  describe('Empty State', () => {
    it('renders empty state message when no announcements', () => {
      render(<AnnouncementsList initialAnnouncements={[]} />);

      expect(screen.getByText('No announcements')).toBeInTheDocument();
    });

    it('applies correct styling to empty state', () => {
      render(<AnnouncementsList initialAnnouncements={[]} />);

      const emptyState = screen.getByText('No announcements');
      expect(emptyState).toHaveClass('text-center', 'py-8', 'text-gray-500');
    });

    it('does not render announcements container when empty', () => {
      render(<AnnouncementsList initialAnnouncements={[]} />);

      expect(screen.queryByText('Important System Update')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // CARD LAYOUT TESTS
  // ============================================================================

  describe('Card Layout', () => {
    it('renders announcements as cards with correct structure', () => {
      render(<AnnouncementsList initialAnnouncements={mockAnnouncements} />);

      const announcementCards = document.querySelectorAll('.p-5.rounded-lg.border');
      expect(announcementCards.length).toBe(4);
    });

    it('applies hover and dark mode classes', () => {
      render(<AnnouncementsList initialAnnouncements={mockAnnouncements} />);

      const firstCard = screen.getByText('Important System Update').closest('.p-5');
      expect(firstCard).toHaveClass('dark:bg-gray-800');
    });

    it('renders cards in a space-y-4 container', () => {
      render(<AnnouncementsList initialAnnouncements={mockAnnouncements} />);

      const container = screen.getByText('Important System Update').closest('.space-y-4');
      expect(container).toBeInTheDocument();
    });
  });

  // ============================================================================
  // SINGLE ANNOUNCEMENT TESTS
  // ============================================================================

  describe('Single Announcement', () => {
    it('renders correctly with single announcement', () => {
      const single = [mockAnnouncements[0]];
      render(<AnnouncementsList initialAnnouncements={single} />);

      expect(screen.getByText('Important System Update')).toBeInTheDocument();
      expect(screen.queryByText('New Policy Notice')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // DARK MODE TESTS
  // ============================================================================

  describe('Dark Mode Support', () => {
    it('applies dark mode classes to title', () => {
      render(<AnnouncementsList initialAnnouncements={mockAnnouncements} />);

      const title = screen.getByRole('heading', { name: /announcements/i });
      expect(title).toHaveClass('dark:text-white');
    });

    it('applies dark mode classes to priority badges', () => {
      render(<AnnouncementsList initialAnnouncements={mockAnnouncements} />);

      const urgentBadge = screen.getByText('urgent');
      expect(urgentBadge).toHaveClass('dark:bg-red-900', 'dark:text-red-200');
    });

    it('applies dark mode classes to empty state', () => {
      render(<AnnouncementsList initialAnnouncements={[]} />);

      const emptyState = screen.getByText('No announcements');
      expect(emptyState).toHaveClass('dark:text-gray-400');
    });
  });

  // ============================================================================
  // ANNOUNCEMENT WITHOUT OPTIONAL FIELDS
  // ============================================================================

  describe('Announcements Without Optional Fields', () => {
    it('renders announcement without content', () => {
      const noContent = [{
        id: '1',
        title: 'No Content Announcement',
        author: 'Test Author',
        publishDate: '2024-01-01',
        priority: 'low' as const,
        targetAudience: 'Everyone',
      }];

      render(<AnnouncementsList initialAnnouncements={noContent} />);

      expect(screen.getByText('No Content Announcement')).toBeInTheDocument();
    });
  });
});
