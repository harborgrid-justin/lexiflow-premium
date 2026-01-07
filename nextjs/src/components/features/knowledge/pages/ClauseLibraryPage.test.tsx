/**
 * @jest-environment jsdom
 * @module ClauseLibraryPage.test
 * @description Enterprise-grade tests for ClauseLibraryPage component
 *
 * Test coverage:
 * - Page rendering
 * - ClauseLibrary integration
 * - onSelectClause callback
 * - PageContainerLayout wrapper
 * - React.memo optimization
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClauseLibraryPage } from './ClauseLibraryPage';

// ============================================================================
// MOCKS
// ============================================================================

const mockClause = {
  id: 'clause-123',
  title: 'Indemnification Clause',
  content: 'Sample clause content',
  category: 'liability',
  tags: ['contract', 'protection'],
};

jest.mock('@/features/knowledge/clauses/ClauseLibrary', () => ({
  ClauseLibrary: ({ onSelectClause }: { onSelectClause: (clause: typeof mockClause) => void }) => (
    <div data-testid="clause-library">
      <h1>Clause Library</h1>
      <div data-testid="clause-list">
        <button onClick={() => onSelectClause(mockClause)} data-testid="select-clause-btn">
          {mockClause.title}
        </button>
      </div>
    </div>
  ),
}));

jest.mock('@/components/ui/layouts/PageContainerLayout/PageContainerLayout', () => ({
  PageContainerLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container-layout">{children}</div>
  ),
}));

// Suppress console.log from onSelectClause callback
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

// ============================================================================
// TEST SUITES
// ============================================================================

describe('ClauseLibraryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ClauseLibraryPage />);

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });

    it('renders ClauseLibrary component', () => {
      render(<ClauseLibraryPage />);

      expect(screen.getByTestId('clause-library')).toBeInTheDocument();
    });

    it('wraps content in PageContainerLayout', () => {
      render(<ClauseLibraryPage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout).toContainElement(screen.getByTestId('clause-library'));
    });

    it('displays clause library heading', () => {
      render(<ClauseLibraryPage />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Clause Library');
    });

    it('renders clause list', () => {
      render(<ClauseLibraryPage />);

      expect(screen.getByTestId('clause-list')).toBeInTheDocument();
    });
  });

  describe('ClauseLibrary Integration', () => {
    it('passes onSelectClause callback to ClauseLibrary', () => {
      render(<ClauseLibraryPage />);

      expect(screen.getByTestId('select-clause-btn')).toBeInTheDocument();
    });

    it('logs selected clause when callback is triggered', async () => {
      const user = userEvent.setup();
      render(<ClauseLibraryPage />);

      await user.click(screen.getByTestId('select-clause-btn'));

      expect(consoleLogSpy).toHaveBeenCalledWith('Selected clause:', mockClause);
    });

    it('displays clause title in button', () => {
      render(<ClauseLibraryPage />);

      expect(screen.getByText('Indemnification Clause')).toBeInTheDocument();
    });
  });

  describe('React.memo Optimization', () => {
    it('is memoized for performance', () => {
      expect(ClauseLibraryPage).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('re-renders correctly on multiple renders', () => {
      const { rerender } = render(<ClauseLibraryPage />);

      rerender(<ClauseLibraryPage />);
      rerender(<ClauseLibraryPage />);

      expect(screen.getByTestId('clause-library')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('maintains correct component hierarchy', () => {
      const { container } = render(<ClauseLibraryPage />);

      expect(container.firstChild).toHaveAttribute('data-testid', 'page-container-layout');
    });

    it('renders single child in layout', () => {
      render(<ClauseLibraryPage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout.children).toHaveLength(1);
    });
  });

  describe('Accessibility', () => {
    it('renders heading element', () => {
      render(<ClauseLibraryPage />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('contains interactive button', () => {
      render(<ClauseLibraryPage />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
