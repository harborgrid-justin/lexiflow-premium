/**
 * @jest-environment jsdom
 * ResearchTool Component Tests
 * Enterprise-grade tests for legal research tool with search and citations
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResearchTool } from './ResearchTool';

// Mock API endpoints
jest.mock('@/lib/api-config', () => ({
  API_ENDPOINTS: {
    SEARCH: {
      CASES: '/api/search/cases',
    },
    KNOWLEDGE: {
      ARTICLES: '/api/knowledge/articles',
    },
    CITATIONS: {
      LIST: '/api/citations',
      VALIDATE: '/api/citations/validate',
    },
  },
}));

// Mock fetch
global.fetch = jest.fn();

const mockFetch = (response: any) => {
  (global.fetch as jest.Mock).mockResolvedValue({
    json: () => Promise.resolve(response),
  });
};

describe('ResearchTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch([]);
  });

  describe('Rendering', () => {
    it('renders header with title', () => {
      render(<ResearchTool />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Legal Research');
    });

    it('renders subtitle', () => {
      render(<ResearchTool />);

      expect(screen.getByText('Case law, statutes, and citation analysis')).toBeInTheDocument();
    });

    it('renders all tabs', () => {
      render(<ResearchTool />);

      expect(screen.getByText('Active Research')).toBeInTheDocument();
      expect(screen.getByText('History')).toBeInTheDocument();
      expect(screen.getByText('Saved Authorities')).toBeInTheDocument();
      expect(screen.getByText('Shepardize')).toBeInTheDocument();
      expect(screen.getByText('Jurisdiction')).toBeInTheDocument();
    });

    it('renders Active Research tab by default', () => {
      render(<ResearchTool />);

      expect(screen.getByText('Search Query')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Enter keywords/)).toBeInTheDocument();
    });
  });

  describe('Active Research Tab', () => {
    it('displays search input', () => {
      render(<ResearchTool />);

      expect(screen.getByPlaceholderText(/Enter keywords, citation/)).toBeInTheDocument();
    });

    it('displays search button', () => {
      render(<ResearchTool />);

      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });

    it('shows empty state when no results', () => {
      render(<ResearchTool />);

      expect(screen.getByText('Enter a search term to begin research')).toBeInTheDocument();
    });

    it('performs search on form submit', async () => {
      const user = userEvent.setup();
      mockFetch([{ id: '1', title: 'Smith v. Jones', citation: '123 F.3d 456' }]);

      render(<ResearchTool />);

      await user.type(screen.getByPlaceholderText(/Enter keywords/), 'contract dispute');
      await user.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/search/cases?q=contract%20dispute')
        );
      });
    });

    it('shows loading state during search', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({ json: () => Promise.resolve([]) }), 1000)
        )
      );

      render(<ResearchTool />);

      await user.type(screen.getByPlaceholderText(/Enter keywords/), 'test');
      await user.click(screen.getByRole('button', { name: /search/i }));

      expect(screen.getByText('Searching...')).toBeInTheDocument();
    });

    it('displays search results', async () => {
      const user = userEvent.setup();
      mockFetch([
        { id: '1', title: 'Smith v. Jones', citation: '123 F.3d 456', summary: 'Contract case' },
      ]);

      render(<ResearchTool />);

      await user.type(screen.getByPlaceholderText(/Enter keywords/), 'contract');
      await user.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() => {
        expect(screen.getByText('Smith v. Jones')).toBeInTheDocument();
        expect(screen.getByText('123 F.3d 456')).toBeInTheDocument();
        expect(screen.getByText('Contract case')).toBeInTheDocument();
      });
    });

    it('shows results count', async () => {
      const user = userEvent.setup();
      mockFetch([
        { id: '1', title: 'Case 1' },
        { id: '2', title: 'Case 2' },
      ]);

      render(<ResearchTool />);

      await user.type(screen.getByPlaceholderText(/Enter keywords/), 'test');
      await user.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() => {
        expect(screen.getByText('Results (2)')).toBeInTheDocument();
      });
    });
  });

  describe('History Tab', () => {
    it('switches to History tab when clicked', async () => {
      const user = userEvent.setup();
      mockFetch([]);

      render(<ResearchTool />);

      await user.click(screen.getByText('History'));

      expect(screen.getByText('Recent Research')).toBeInTheDocument();
    });

    it('fetches history on mount', async () => {
      const user = userEvent.setup();
      mockFetch([{ id: '1', title: 'Previous Search' }]);

      render(<ResearchTool />);

      await user.click(screen.getByText('History'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/knowledge/articles')
        );
      });
    });

    it('displays history items', async () => {
      const user = userEvent.setup();
      mockFetch([{ id: '1', title: 'Previous Search', timestamp: '2024-01-15T10:00:00Z' }]);

      render(<ResearchTool />);

      await user.click(screen.getByText('History'));

      await waitFor(() => {
        expect(screen.getByText('Previous Search')).toBeInTheDocument();
      });
    });

    it('shows loading state', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({ json: () => Promise.resolve([]) }), 1000)
        )
      );

      render(<ResearchTool />);

      await user.click(screen.getByText('History'));

      expect(screen.getByText('Loading history...')).toBeInTheDocument();
    });

    it('shows empty state when no history', async () => {
      const user = userEvent.setup();
      mockFetch([]);

      render(<ResearchTool />);

      await user.click(screen.getByText('History'));

      await waitFor(() => {
        expect(screen.getByText('No recent history')).toBeInTheDocument();
      });
    });
  });

  describe('Saved Authorities Tab', () => {
    it('switches to Saved Authorities tab when clicked', async () => {
      const user = userEvent.setup();
      mockFetch([]);

      render(<ResearchTool />);

      await user.click(screen.getByText('Saved Authorities'));

      expect(screen.getByText('Saved Authorities')).toBeInTheDocument();
    });

    it('fetches saved authorities on mount', async () => {
      const user = userEvent.setup();
      mockFetch([]);

      render(<ResearchTool />);

      await user.click(screen.getByText('Saved Authorities'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/citations');
      });
    });

    it('displays saved authorities', async () => {
      const user = userEvent.setup();
      mockFetch([
        { id: '1', citation: '123 F.3d 456', title: 'Important Case', jurisdiction: 'Federal' },
      ]);

      render(<ResearchTool />);

      await user.click(screen.getByText('Saved Authorities'));

      await waitFor(() => {
        expect(screen.getByText('Important Case')).toBeInTheDocument();
        expect(screen.getByText('Federal')).toBeInTheDocument();
      });
    });

    it('shows empty state when no saved authorities', async () => {
      const user = userEvent.setup();
      mockFetch([]);

      render(<ResearchTool />);

      await user.click(screen.getByText('Saved Authorities'));

      await waitFor(() => {
        expect(screen.getByText('No saved authorities')).toBeInTheDocument();
      });
    });
  });

  describe('Shepardize Tab', () => {
    it('switches to Shepardize tab when clicked', async () => {
      const user = userEvent.setup();
      render(<ResearchTool />);

      await user.click(screen.getByText('Shepardize'));

      expect(screen.getByText('Shepards Citation Analysis')).toBeInTheDocument();
    });

    it('displays citation input', async () => {
      const user = userEvent.setup();
      render(<ResearchTool />);

      await user.click(screen.getByText('Shepardize'));

      expect(screen.getByPlaceholderText(/Enter citation/)).toBeInTheDocument();
    });

    it('displays analyze button', async () => {
      const user = userEvent.setup();
      render(<ResearchTool />);

      await user.click(screen.getByText('Shepardize'));

      expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
    });

    it('validates citation on submit', async () => {
      const user = userEvent.setup();
      mockFetch({ status: 'Valid Citation', authority: 'Good standing' });

      render(<ResearchTool />);

      await user.click(screen.getByText('Shepardize'));
      await user.type(screen.getByPlaceholderText(/Enter citation/), '123 F.3d 456');
      await user.click(screen.getByRole('button', { name: /analyze/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/citations/validate')
        );
      });
    });

    it('displays validation result', async () => {
      const user = userEvent.setup();
      mockFetch({ status: 'Valid Citation', authority: 'Good standing' });

      render(<ResearchTool />);

      await user.click(screen.getByText('Shepardize'));
      await user.type(screen.getByPlaceholderText(/Enter citation/), '123 F.3d 456');
      await user.click(screen.getByRole('button', { name: /analyze/i }));

      await waitFor(() => {
        expect(screen.getByText('Valid Citation')).toBeInTheDocument();
        expect(screen.getByText('Good standing')).toBeInTheDocument();
      });
    });
  });

  describe('Jurisdiction Tab', () => {
    it('switches to Jurisdiction tab when clicked', async () => {
      const user = userEvent.setup();
      render(<ResearchTool />);

      await user.click(screen.getByText('Jurisdiction'));

      expect(screen.getByText('Jurisdiction Settings')).toBeInTheDocument();
    });

    it('displays jurisdiction selector', async () => {
      const user = userEvent.setup();
      render(<ResearchTool />);

      await user.click(screen.getByText('Jurisdiction'));

      expect(screen.getByText('Primary Jurisdiction')).toBeInTheDocument();
    });

    it('displays jurisdiction options', async () => {
      const user = userEvent.setup();
      render(<ResearchTool />);

      await user.click(screen.getByText('Jurisdiction'));

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();

      expect(screen.getByText('Federal (All Circuits)')).toBeInTheDocument();
    });

    it('allows changing jurisdiction', async () => {
      const user = userEvent.setup();
      render(<ResearchTool />);

      await user.click(screen.getByText('Jurisdiction'));

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'California');

      expect(select).toHaveValue('California');
    });
  });

  describe('Tab Navigation', () => {
    it('highlights active tab', async () => {
      const user = userEvent.setup();
      render(<ResearchTool />);

      const historyTab = screen.getByText('History').closest('button');
      await user.click(historyTab!);

      expect(historyTab).toHaveClass('bg-blue-50');
    });
  });

  describe('Error Handling', () => {
    it('handles fetch errors gracefully', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      render(<ResearchTool />);

      await user.type(screen.getByPlaceholderText(/Enter keywords/), 'test');
      await user.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });
});
