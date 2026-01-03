/**
 * AuditTrail.test.tsx
 * Comprehensive unit tests for AuditTrail component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuditTrail } from '@/components/enterprise/Documents/AuditTrail';

// Mock audit events
const mockEvents = [
  {
    id: 'event-1',
    documentId: 'doc-1',
    documentTitle: 'Contract Agreement',
    eventType: 'created' as const,
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    timestamp: '2024-01-10T10:00:00Z',
    ipAddress: '192.168.1.100',
    details: { fileName: 'contract.pdf', size: '2.4 MB' },
    metadata: {
      userAgent: 'Mozilla/5.0',
      location: 'New York, US',
      sessionId: 'session-123',
    },
  },
  {
    id: 'event-2',
    documentId: 'doc-1',
    documentTitle: 'Contract Agreement',
    eventType: 'viewed' as const,
    userId: 'user-2',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    timestamp: '2024-01-11T14:30:00Z',
    ipAddress: '192.168.1.101',
  },
  {
    id: 'event-3',
    documentId: 'doc-1',
    documentTitle: 'Contract Agreement',
    eventType: 'edited' as const,
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    timestamp: '2024-01-12T09:15:00Z',
    ipAddress: '192.168.1.100',
    changes: [
      {
        field: 'title',
        oldValue: 'Contract Draft',
        newValue: 'Contract Agreement',
      },
      {
        field: 'status',
        oldValue: 'draft',
        newValue: 'active',
      },
    ],
  },
  {
    id: 'event-4',
    documentId: 'doc-1',
    documentTitle: 'Contract Agreement',
    eventType: 'approved' as const,
    userId: 'user-3',
    userName: 'Bob Johnson',
    userEmail: 'bob@example.com',
    timestamp: '2024-01-13T16:45:00Z',
    ipAddress: '192.168.1.102',
    details: { approver: 'Bob Johnson', comment: 'Approved for execution' },
  },
  {
    id: 'event-5',
    documentId: 'doc-2',
    documentTitle: 'Evidence Document',
    eventType: 'downloaded' as const,
    userId: 'user-2',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    timestamp: '2024-01-14T11:20:00Z',
    ipAddress: '192.168.1.101',
  },
  {
    id: 'event-6',
    documentId: 'doc-1',
    documentTitle: 'Contract Agreement',
    eventType: 'redacted' as const,
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    timestamp: '2024-01-15T13:00:00Z',
    ipAddress: '192.168.1.100',
    details: { redactions: 3, reason: 'Confidential information' },
  },
];

describe('AuditTrail', () => {
  describe('Event Listing', () => {
    it('should render audit trail title', () => {
      render(<AuditTrail events={mockEvents} />);

      expect(screen.getByText('Audit Trail')).toBeInTheDocument();
    });

    it('should display event count', () => {
      render(<AuditTrail events={mockEvents} />);

      expect(screen.getByText('6 events')).toBeInTheDocument();
    });

    it('should render all events', () => {
      render(<AuditTrail events={mockEvents} />);

      expect(screen.getByText('Created')).toBeInTheDocument();
      expect(screen.getByText('Viewed')).toBeInTheDocument();
      expect(screen.getByText('Edited')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByText('Downloaded')).toBeInTheDocument();
      expect(screen.getByText('Redacted')).toBeInTheDocument();
    });

    it('should display event user names', () => {
      render(<AuditTrail events={mockEvents} />);

      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('should display event timestamps', () => {
      render(<AuditTrail events={mockEvents} />);

      // Timestamps should be formatted
      const timestamps = screen.getAllByText(/Jan \d+, \d{4}/i);
      expect(timestamps.length).toBeGreaterThan(0);
    });

    it('should display IP addresses', () => {
      render(<AuditTrail events={mockEvents} />);

      expect(screen.getByText('192.168.1.100')).toBeInTheDocument();
      expect(screen.getByText('192.168.1.101')).toBeInTheDocument();
    });

    it('should show document titles in events', () => {
      render(<AuditTrail events={mockEvents} />);

      expect(screen.getAllByText(/Contract Agreement/).length).toBeGreaterThan(0);
      expect(screen.getByText(/Evidence Document/)).toBeInTheDocument();
    });

    it('should display event icons', () => {
      const { container } = render(<AuditTrail events={mockEvents} />);

      // Each event should have an icon
      const icons = container.querySelectorAll('.rounded-full svg');
      expect(icons.length).toBeGreaterThanOrEqual(mockEvents.length);
    });

    it('should show empty state when no events', () => {
      render(<AuditTrail events={[]} />);

      expect(screen.getByText('No audit events found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
    });

    it('should apply different colors for event types', () => {
      const { container } = render(<AuditTrail events={mockEvents} />);

      expect(container.querySelector('.text-green-600')).toBeInTheDocument(); // created
      expect(container.querySelector('.text-blue-600')).toBeInTheDocument(); // viewed
      expect(container.querySelector('.text-yellow-600')).toBeInTheDocument(); // edited
    });
  });

  describe('Filtering by Type', () => {
    it('should render event type filter', () => {
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      const typeFilter = screen.getByDisplayValue('All Events');
      expect(typeFilter).toBeInTheDocument();
    });

    it('should filter by created events', async () => {
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      const typeFilter = screen.getByDisplayValue('All Events');
      fireEvent.change(typeFilter, { target: { value: 'created' } });

      await waitFor(() => {
        expect(screen.getByText('1 event')).toBeInTheDocument();
        expect(screen.queryByText('Viewed')).not.toBeInTheDocument();
      });
    });

    it('should filter by viewed events', async () => {
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      const typeFilter = screen.getByDisplayValue('All Events');
      fireEvent.change(typeFilter, { target: { value: 'viewed' } });

      await waitFor(() => {
        expect(screen.getByText('Viewed')).toBeInTheDocument();
        expect(screen.queryByText('Created')).not.toBeInTheDocument();
      });
    });

    it('should filter by edited events', async () => {
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      const typeFilter = screen.getByDisplayValue('All Events');
      fireEvent.change(typeFilter, { target: { value: 'edited' } });

      await waitFor(() => {
        expect(screen.getByText('Edited')).toBeInTheDocument();
      });
    });

    it('should filter by approved events', async () => {
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      const typeFilter = screen.getByDisplayValue('All Events');
      fireEvent.change(typeFilter, { target: { value: 'approved' } });

      await waitFor(() => {
        expect(screen.getByText('Approved')).toBeInTheDocument();
        expect(screen.queryByText('Edited')).not.toBeInTheDocument();
      });
    });

    it('should reset to all events', async () => {
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      const typeFilter = screen.getByDisplayValue('All Events');

      // Filter to created
      fireEvent.change(typeFilter, { target: { value: 'created' } });

      await waitFor(() => {
        expect(screen.getByText('1 event')).toBeInTheDocument();
      });

      // Reset to all
      fireEvent.change(typeFilter, { target: { value: 'all' } });

      await waitFor(() => {
        expect(screen.getByText('6 events')).toBeInTheDocument();
      });
    });

    it('should have all event type options', () => {
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      expect(screen.getByText('All Events')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
      expect(screen.getByText('Viewed')).toBeInTheDocument();
      expect(screen.getByText('Downloaded')).toBeInTheDocument();
      expect(screen.getByText('Edited')).toBeInTheDocument();
    });
  });

  describe('Filtering by User', () => {
    it('should render user filter', () => {
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      const userFilter = screen.getByDisplayValue('All Users');
      expect(userFilter).toBeInTheDocument();
    });

    it('should list unique users in filter', () => {
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      // Should show unique users
      expect(screen.getByRole('option', { name: 'John Doe' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Jane Smith' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Bob Johnson' })).toBeInTheDocument();
    });

    it('should filter events by user', async () => {
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      const userFilter = screen.getByDisplayValue('All Users');
      fireEvent.change(userFilter, { target: { value: 'John Doe' } });

      await waitFor(() => {
        expect(screen.getByText('3 events')).toBeInTheDocument();
      });
    });

    it('should filter to specific user', async () => {
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      const userFilter = screen.getByDisplayValue('All Users');
      fireEvent.change(userFilter, { target: { value: 'Bob Johnson' } });

      await waitFor(() => {
        expect(screen.getByText('1 event')).toBeInTheDocument();
        const userTexts = screen.getAllByText('Bob Johnson');
        expect(userTexts.length).toBeGreaterThan(0);
      });
    });

    it('should reset user filter', async () => {
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      const userFilter = screen.getByDisplayValue('All Users');

      // Filter to specific user
      fireEvent.change(userFilter, { target: { value: 'John Doe' } });
      await waitFor(() => {
        expect(screen.getByText('3 events')).toBeInTheDocument();
      });

      // Reset to all users
      fireEvent.change(userFilter, { target: { value: 'all' } });
      await waitFor(() => {
        expect(screen.getByText('6 events')).toBeInTheDocument();
      });
    });
  });

  describe('Date Range Filtering', () => {
    it('should render date range inputs', () => {
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      const dateInputs = screen.getAllByRole('textbox').filter(
        input => input.getAttribute('type') === 'date'
      );
      expect(dateInputs.length).toBe(2);
    });

    it('should filter by start date', async () => {
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      const dateInputs = screen.getAllByRole('textbox').filter(
        input => input.getAttribute('type') === 'date'
      );
      const fromDate = dateInputs[0];

      fireEvent.change(fromDate, { target: { value: '2024-01-13' } });

      await waitFor(() => {
        // Should show only events from Jan 13 onwards
        expect(screen.getByText(/3 events?/)).toBeInTheDocument();
      });
    });

    it('should filter by end date', async () => {
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      const dateInputs = screen.getAllByRole('textbox').filter(
        input => input.getAttribute('type') === 'date'
      );
      const toDate = dateInputs[1];

      fireEvent.change(toDate, { target: { value: '2024-01-12' } });

      await waitFor(() => {
        // Should show only events up to Jan 12
        const eventCount = screen.getByText(/events?/);
        expect(eventCount).toBeInTheDocument();
      });
    });

    it('should filter by date range', async () => {
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      const dateInputs = screen.getAllByRole('textbox').filter(
        input => input.getAttribute('type') === 'date'
      );

      fireEvent.change(dateInputs[0], { target: { value: '2024-01-11' } });
      fireEvent.change(dateInputs[1], { target: { value: '2024-01-13' } });

      await waitFor(() => {
        // Should show events in range
        const eventCount = screen.getByText(/events?/);
        expect(eventCount).toBeInTheDocument();
      });
    });

    it('should clear date filters', async () => {
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      const dateInputs = screen.getAllByRole('textbox').filter(
        input => input.getAttribute('type') === 'date'
      );

      // Set date range
      fireEvent.change(dateInputs[0], { target: { value: '2024-01-13' } });

      // Clear date
      fireEvent.change(dateInputs[0], { target: { value: '' } });

      await waitFor(() => {
        expect(screen.getByText('6 events')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', () => {
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      expect(screen.getByPlaceholderText('Search events...')).toBeInTheDocument();
    });

    it('should search by user name', async () => {
      const user = userEvent.setup();
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      const searchInput = screen.getByPlaceholderText('Search events...');
      await user.type(searchInput, 'Jane');

      await waitFor(() => {
        expect(screen.getByText('2 events')).toBeInTheDocument();
      });
    });

    it('should search by document title', async () => {
      const user = userEvent.setup();
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      const searchInput = screen.getByPlaceholderText('Search events...');
      await user.type(searchInput, 'Evidence');

      await waitFor(() => {
        expect(screen.getByText('1 event')).toBeInTheDocument();
      });
    });

    it('should search by event type', async () => {
      const user = userEvent.setup();
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      const searchInput = screen.getByPlaceholderText('Search events...');
      await user.type(searchInput, 'approved');

      await waitFor(() => {
        expect(screen.getByText('Approved')).toBeInTheDocument();
      });
    });

    it('should be case-insensitive', async () => {
      const user = userEvent.setup();
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      const searchInput = screen.getByPlaceholderText('Search events...');
      await user.type(searchInput, 'JOHN');

      await waitFor(() => {
        expect(screen.getByText('3 events')).toBeInTheDocument();
      });
    });

    it('should clear search results', async () => {
      const user = userEvent.setup();
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      const searchInput = screen.getByPlaceholderText('Search events...');
      await user.type(searchInput, 'Jane');

      await waitFor(() => {
        expect(screen.getByText('2 events')).toBeInTheDocument();
      });

      await user.clear(searchInput);

      await waitFor(() => {
        expect(screen.getByText('6 events')).toBeInTheDocument();
      });
    });
  });

  describe('Export Functionality', () => {
    it('should render export button', () => {
      render(<AuditTrail events={mockEvents} enableExport={true} />);

      expect(screen.getByText('Export')).toBeInTheDocument();
    });

    it('should not render export button when disabled', () => {
      render(<AuditTrail events={mockEvents} enableExport={false} />);

      expect(screen.queryByText('Export')).not.toBeInTheDocument();
    });

    it('should call onExport with all events', () => {
      const onExport = jest.fn();
      render(<AuditTrail events={mockEvents} enableExport={true} onExport={onExport} />);

      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);

      expect(onExport).toHaveBeenCalledWith(mockEvents);
    });

    it('should export only filtered events', async () => {
      const onExport = jest.fn();
      render(<AuditTrail events={mockEvents} enableExport={true} onExport={onExport} showFilters={true} />);

      // Filter to specific type
      const typeFilter = screen.getByDisplayValue('All Events');
      fireEvent.change(typeFilter, { target: { value: 'created' } });

      await waitFor(() => {
        expect(screen.getByText('1 event')).toBeInTheDocument();
      });

      // Export filtered results
      fireEvent.click(screen.getByText('Export'));

      expect(onExport).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ eventType: 'created' })
        ])
      );
      expect(onExport.mock.calls[0][0]).toHaveLength(1);
    });

    it('should export only selected events', async () => {
      const onExport = jest.fn();
      render(<AuditTrail events={mockEvents} enableExport={true} onExport={onExport} />);

      // Select first event
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        expect(screen.getByText('1 selected')).toBeInTheDocument();
      });

      // Export selected
      fireEvent.click(screen.getByText('Export'));

      expect(onExport).toHaveBeenCalled();
      expect(onExport.mock.calls[0][0]).toHaveLength(1);
    });
  });

  describe('Event Details Expansion', () => {
    it('should toggle event expansion', async () => {
      render(<AuditTrail events={mockEvents} />);

      const expandButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('path[d*="M19 9l-7 7-7-7"]')
      );

      fireEvent.click(expandButtons[0]);

      await waitFor(() => {
        // Expanded details should be visible
        expect(screen.getByText('Additional Details')).toBeInTheDocument();
      });
    });

    it('should display event changes when expanded', async () => {
      render(<AuditTrail events={mockEvents} />);

      // Find and expand the edited event
      const editedEventText = screen.getByText('Edited');
      const expandButton = editedEventText.closest('div')?.querySelector('button[class*="p-1"]');

      if (expandButton) {
        fireEvent.click(expandButton);

        await waitFor(() => {
          expect(screen.getByText('Changes')).toBeInTheDocument();
          expect(screen.getByText('title')).toBeInTheDocument();
          expect(screen.getByText('Contract Draft')).toBeInTheDocument();
          expect(screen.getByText('Contract Agreement')).toBeInTheDocument();
        });
      }
    });

    it('should display event metadata when expanded', async () => {
      render(<AuditTrail events={mockEvents} />);

      const expandButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('path[d*="M19 9l-7 7-7-7"]')
      );

      fireEvent.click(expandButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Metadata')).toBeInTheDocument();
        expect(screen.getByText('Mozilla/5.0')).toBeInTheDocument();
        expect(screen.getByText('New York, US')).toBeInTheDocument();
      });
    });

    it('should display event details object when expanded', async () => {
      render(<AuditTrail events={mockEvents} />);

      const expandButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('path[d*="M19 9l-7 7-7-7"]')
      );

      fireEvent.click(expandButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Additional Details')).toBeInTheDocument();
      });
    });

    it('should collapse event on second click', async () => {
      render(<AuditTrail events={mockEvents} />);

      const expandButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('path[d*="M19 9l-7 7-7-7"]')
      );

      // Expand
      fireEvent.click(expandButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Additional Details')).toBeInTheDocument();
      });

      // Collapse
      fireEvent.click(expandButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText('Additional Details')).not.toBeInTheDocument();
      });
    });

    it('should rotate expand icon when expanded', async () => {
      const { container } = render(<AuditTrail events={mockEvents} />);

      const expandButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('path[d*="M19 9l-7 7-7-7"]')
      );

      fireEvent.click(expandButtons[0]);

      await waitFor(() => {
        const rotatedIcon = container.querySelector('.rotate-180');
        expect(rotatedIcon).toBeInTheDocument();
      });
    });
  });

  describe('Event Selection', () => {
    it('should select individual events', async () => {
      render(<AuditTrail events={mockEvents} />);

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        expect(screen.getByText('1 selected')).toBeInTheDocument();
      });
    });

    it('should select multiple events', async () => {
      render(<AuditTrail events={mockEvents} />);

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);

      await waitFor(() => {
        expect(screen.getByText('2 selected')).toBeInTheDocument();
      });
    });

    it('should deselect events', async () => {
      render(<AuditTrail events={mockEvents} />);

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        expect(screen.getByText('1 selected')).toBeInTheDocument();
      });

      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        expect(screen.queryByText('selected')).not.toBeInTheDocument();
      });
    });

    it('should select all filtered events', async () => {
      render(<AuditTrail events={mockEvents} />);

      const selectAllButton = screen.getByText(/Select all 6 events/i);
      fireEvent.click(selectAllButton);

      await waitFor(() => {
        expect(screen.getByText('6 selected')).toBeInTheDocument();
      });
    });

    it('should clear selection', async () => {
      render(<AuditTrail events={mockEvents} />);

      // Select all
      const selectAllButton = screen.getByText(/Select all 6 events/i);
      fireEvent.click(selectAllButton);

      await waitFor(() => {
        expect(screen.getByText('6 selected')).toBeInTheDocument();
      });

      // Clear selection
      const clearButton = screen.getByText('Clear Selection');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.queryByText('selected')).not.toBeInTheDocument();
      });
    });

    it('should show clear selection button only when events selected', async () => {
      render(<AuditTrail events={mockEvents} />);

      // Initially no clear button
      expect(screen.queryByText('Clear Selection')).not.toBeInTheDocument();

      // Select an event
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        expect(screen.getByText('Clear Selection')).toBeInTheDocument();
      });
    });

    it('should highlight selected events', async () => {
      const { container } = render(<AuditTrail events={mockEvents} />);

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        const highlighted = container.querySelector('.bg-blue-50');
        expect(highlighted).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible heading', () => {
      render(<AuditTrail events={mockEvents} />);

      const heading = screen.getByRole('heading', { name: /Audit Trail/i });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible checkboxes', () => {
      render(<AuditTrail events={mockEvents} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBe(mockEvents.length);
    });

    it('should have accessible buttons', () => {
      render(<AuditTrail events={mockEvents} enableExport={true} />);

      const exportButton = screen.getByRole('button', { name: /Export/i });
      expect(exportButton).toBeInTheDocument();
    });

    it('should have accessible form controls', () => {
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      const searchInput = screen.getByPlaceholderText('Search events...');
      expect(searchInput).toBeInTheDocument();

      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      const searchInput = screen.getByPlaceholderText('Search events...');
      await user.tab();

      expect(searchInput).toHaveFocus();
    });

    it('should have semantic HTML structure', () => {
      const { container } = render(<AuditTrail events={mockEvents} />);

      expect(container.querySelector('h2')).toBeInTheDocument();
      expect(container.querySelectorAll('button').length).toBeGreaterThan(0);
    });
  });

  describe('Combined Filters', () => {
    it('should apply multiple filters together', async () => {
      const user = userEvent.setup();
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      // Filter by type
      const typeFilter = screen.getByDisplayValue('All Events');
      fireEvent.change(typeFilter, { target: { value: 'created' } });

      // Filter by user
      const userFilter = screen.getByDisplayValue('All Users');
      fireEvent.change(userFilter, { target: { value: 'John Doe' } });

      await waitFor(() => {
        expect(screen.getByText('1 event')).toBeInTheDocument();
      });
    });

    it('should combine search with filters', async () => {
      const user = userEvent.setup();
      render(<AuditTrail events={mockEvents} showFilters={true} />);

      // Apply search
      const searchInput = screen.getByPlaceholderText('Search events...');
      await user.type(searchInput, 'Contract');

      // Apply type filter
      const typeFilter = screen.getByDisplayValue('All Events');
      fireEvent.change(typeFilter, { target: { value: 'edited' } });

      await waitFor(() => {
        const eventCount = screen.getByText(/event/);
        expect(eventCount).toBeInTheDocument();
      });
    });
  });
});
