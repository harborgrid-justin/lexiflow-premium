/**
 * CaseList Component Tests
 * Enterprise-grade test suite for case list fetching, display, and interactions
 *
 * @module components/cases/CaseList.test
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import { CaseStatus, MatterPriority } from '@/types';
import type { Case } from '@/types';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Import component after mocking
import { CaseList } from './CaseList';

describe('CaseList', () => {
  const mockCases: Case[] = [
    {
      id: 'case-1',
      title: 'Smith v. Johnson',
      caseNumber: 'CV-2024-001',
      status: CaseStatus.Active,
      priority: MatterPriority.HIGH,
      description: 'Commercial dispute case',
      court: 'US District Court',
      nextHearingDate: '2024-06-15',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-20',
    },
    {
      id: 'case-2',
      title: 'Acme Corp v. Widget Inc',
      caseNumber: 'CV-2024-002',
      status: CaseStatus.Pending,
      priority: MatterPriority.URGENT,
      description: 'Patent infringement lawsuit',
      court: 'Federal Court',
      createdAt: '2024-02-01',
      updatedAt: '2024-02-15',
    },
    {
      id: 'case-3',
      title: 'Estate of Brown',
      caseNumber: 'PRO-2024-003',
      status: CaseStatus.Closed,
      priority: MatterPriority.LOW,
      createdAt: '2024-03-01',
      updatedAt: '2024-03-20',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading spinner initially', () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));

      render(<CaseList />);

      // Check for the spinner element
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should show loading indicator centered', () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));

      const { container } = render(<CaseList />);

      const loadingContainer = container.querySelector('.flex.items-center.justify-center');
      expect(loadingContainer).toBeInTheDocument();
    });
  });

  describe('Data Fetching', () => {
    it('should fetch cases on mount', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: mockCases }),
      });

      render(<CaseList />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });

    it('should display cases after successful fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: mockCases }),
      });

      render(<CaseList />);

      await waitFor(() => {
        expect(screen.getByText('Smith v. Johnson')).toBeInTheDocument();
        expect(screen.getByText('Acme Corp v. Widget Inc')).toBeInTheDocument();
        expect(screen.getByText('Estate of Brown')).toBeInTheDocument();
      });
    });

    it('should display case numbers', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: mockCases }),
      });

      render(<CaseList />);

      await waitFor(() => {
        expect(screen.getByText('CV-2024-001')).toBeInTheDocument();
        expect(screen.getByText('CV-2024-002')).toBeInTheDocument();
        expect(screen.getByText('PRO-2024-003')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no cases exist', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: [] }),
      });

      render(<CaseList />);

      await waitFor(() => {
        expect(screen.getByText('No cases found')).toBeInTheDocument();
      });
    });

    it('should handle undefined data gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({}),
      });

      render(<CaseList />);

      await waitFor(() => {
        expect(screen.getByText('No cases found')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<CaseList />);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Failed to fetch cases:',
          expect.any(Error)
        );
      });
    });

    it('should show empty state on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      render(<CaseList />);

      await waitFor(() => {
        expect(screen.getByText('No cases found')).toBeInTheDocument();
      });
    });
  });

  describe('Case Card Display', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: mockCases }),
      });
    });

    it('should display status badges', async () => {
      render(<CaseList />);

      await waitFor(() => {
        expect(screen.getByText(CaseStatus.Active)).toBeInTheDocument();
        expect(screen.getByText(CaseStatus.Pending)).toBeInTheDocument();
        expect(screen.getByText(CaseStatus.Closed)).toBeInTheDocument();
      });
    });

    it('should display priority badges', async () => {
      render(<CaseList />);

      await waitFor(() => {
        expect(screen.getByText(MatterPriority.HIGH)).toBeInTheDocument();
        expect(screen.getByText(MatterPriority.URGENT)).toBeInTheDocument();
        expect(screen.getByText(MatterPriority.LOW)).toBeInTheDocument();
      });
    });

    it('should display case descriptions', async () => {
      render(<CaseList />);

      await waitFor(() => {
        expect(screen.getByText('Commercial dispute case')).toBeInTheDocument();
        expect(screen.getByText('Patent infringement lawsuit')).toBeInTheDocument();
      });
    });

    it('should display court information when available', async () => {
      render(<CaseList />);

      await waitFor(() => {
        expect(screen.getByText(/Court: US District Court/)).toBeInTheDocument();
        expect(screen.getByText(/Court: Federal Court/)).toBeInTheDocument();
      });
    });

    it('should display next hearing date when available', async () => {
      render(<CaseList />);

      await waitFor(() => {
        expect(screen.getByText(/Next Hearing:/)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Links', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: mockCases }),
      });
    });

    it('should render links to case detail pages', async () => {
      render(<CaseList />);

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        expect(links.some(link => link.getAttribute('href') === '/cases/case-1')).toBe(true);
        expect(links.some(link => link.getAttribute('href') === '/cases/case-2')).toBe(true);
        expect(links.some(link => link.getAttribute('href') === '/cases/case-3')).toBe(true);
      });
    });

    it('should make entire card clickable', async () => {
      render(<CaseList />);

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        expect(links.length).toBe(mockCases.length);
      });
    });
  });

  describe('Status Badge Colors', () => {
    it('should apply correct color for ACTIVE status', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: [mockCases[0]] }),
      });

      render(<CaseList />);

      await waitFor(() => {
        const activeBadge = screen.getByText(CaseStatus.Active);
        expect(activeBadge).toHaveClass('bg-green-100');
      });
    });

    it('should apply correct color for PENDING status', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: [mockCases[1]] }),
      });

      render(<CaseList />);

      await waitFor(() => {
        const pendingBadge = screen.getByText(CaseStatus.Pending);
        expect(pendingBadge).toHaveClass('bg-yellow-100');
      });
    });

    it('should apply correct color for CLOSED status', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: [mockCases[2]] }),
      });

      render(<CaseList />);

      await waitFor(() => {
        const closedBadge = screen.getByText(CaseStatus.Closed);
        expect(closedBadge).toHaveClass('bg-slate-100');
      });
    });
  });

  describe('Priority Badge Colors', () => {
    it('should apply correct color for HIGH priority', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: [mockCases[0]] }),
      });

      render(<CaseList />);

      await waitFor(() => {
        const highBadge = screen.getByText(MatterPriority.HIGH);
        expect(highBadge).toHaveClass('bg-orange-100');
      });
    });

    it('should apply correct color for URGENT priority', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: [mockCases[1]] }),
      });

      render(<CaseList />);

      await waitFor(() => {
        const urgentBadge = screen.getByText(MatterPriority.URGENT);
        expect(urgentBadge).toHaveClass('bg-red-100');
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: mockCases }),
      });
    });

    it('should have accessible link elements', async () => {
      render(<CaseList />);

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        links.forEach(link => {
          expect(link).toHaveAttribute('href');
        });
      });
    });
  });

  describe('Content Without Optional Fields', () => {
    it('should handle cases without descriptions', async () => {
      const casesWithoutDescription = [
        {
          ...mockCases[0],
          description: undefined,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: casesWithoutDescription }),
      });

      render(<CaseList />);

      await waitFor(() => {
        expect(screen.getByText('Smith v. Johnson')).toBeInTheDocument();
        expect(screen.queryByText('Commercial dispute case')).not.toBeInTheDocument();
      });
    });

    it('should handle cases without court information', async () => {
      const casesWithoutCourt = [
        {
          ...mockCases[0],
          court: undefined,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: casesWithoutCourt }),
      });

      render(<CaseList />);

      await waitFor(() => {
        expect(screen.getByText('Smith v. Johnson')).toBeInTheDocument();
        expect(screen.queryByText(/Court:/)).not.toBeInTheDocument();
      });
    });

    it('should handle cases without next hearing date', async () => {
      const casesWithoutHearing = [
        {
          ...mockCases[0],
          nextHearingDate: undefined,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: casesWithoutHearing }),
      });

      render(<CaseList />);

      await waitFor(() => {
        expect(screen.getByText('Smith v. Johnson')).toBeInTheDocument();
        expect(screen.queryByText(/Next Hearing:/)).not.toBeInTheDocument();
      });
    });
  });
});
