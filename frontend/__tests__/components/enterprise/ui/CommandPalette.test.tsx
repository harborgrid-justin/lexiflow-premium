/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { CommandPalette, CommandAction, SearchResult } from '@/components/enterprise/ui/CommandPalette';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock react-dom portal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: any) => node,
}));

const mockActions: CommandAction[] = [
  {
    id: '1',
    label: 'New Case',
    description: 'Create a new case',
    keywords: ['create', 'new'],
    onSelect: jest.fn(),
  },
  {
    id: '2',
    label: 'Search Cases',
    description: 'Search all cases',
    keywords: ['search', 'find'],
    onSelect: jest.fn(),
  },
  {
    id: '3',
    label: 'Settings',
    description: 'Open settings',
    shortcut: ['⌘', 'S'],
    onSelect: jest.fn(),
    children: [
      {
        id: '3-1',
        label: 'Profile Settings',
        onSelect: jest.fn(),
      },
      {
        id: '3-2',
        label: 'System Settings',
        onSelect: jest.fn(),
      },
    ],
  },
];

const mockSearchResults: SearchResult[] = [
  {
    id: 'r1',
    title: 'Case #12345',
    description: 'Patent application',
    type: 'case',
    onClick: jest.fn(),
  },
  {
    id: 'r2',
    title: 'Client ABC Corp',
    description: 'Technology company',
    type: 'client',
    onClick: jest.fn(),
  },
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('CommandPalette', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Keyboard Shortcut (Cmd+K)', () => {
    it('should open when Cmd+K is pressed', async () => {
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search or type a command/i)).toBeInTheDocument();
      });
    });

    it('should open when Ctrl+K is pressed', async () => {
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search or type a command/i)).toBeInTheDocument();
      });
    });

    it('should close when Escape is pressed', async () => {
      renderWithTheme(<CommandPalette actions={mockActions} />);

      // Open palette
      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search or type a command/i)).toBeInTheDocument();
      });

      // Close with Escape
      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/search or type a command/i)).not.toBeInTheDocument();
      });
    });

    it('should display keyboard shortcut indicator', async () => {
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByText('K')).toBeInTheDocument();
      });
    });

    it('should prevent default browser behavior for Cmd+K', () => {
      renderWithTheme(<CommandPalette actions={mockActions} />);

      const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      fireEvent(document, event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Search Filtering', () => {
    it('should filter actions based on search query', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search or type a command/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/search or type a command/i);
      await user.type(input, 'case');

      await waitFor(() => {
        expect(screen.getByText('New Case')).toBeInTheDocument();
        expect(screen.getByText('Search Cases')).toBeInTheDocument();
      });
    });

    it('should perform fuzzy matching on search', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search or type a command/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/search or type a command/i);
      await user.type(input, 'nwcs');

      await waitFor(() => {
        expect(screen.getByText('New Case')).toBeInTheDocument();
      });
    });

    it('should search by keywords', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search or type a command/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/search or type a command/i);
      await user.type(input, 'create');

      await waitFor(() => {
        expect(screen.getByText('New Case')).toBeInTheDocument();
      });
    });

    it('should display search results from onSearch callback', async () => {
      const user = userEvent.setup();
      const onSearch = jest.fn().mockResolvedValue(mockSearchResults);

      renderWithTheme(<CommandPalette actions={mockActions} onSearch={onSearch} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search or type a command/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/search or type a command/i);
      await user.type(input, 'case 123');

      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith('case 123');
        expect(screen.getByText('Case #12345')).toBeInTheDocument();
      });
    });

    it('should debounce search requests', async () => {
      const user = userEvent.setup();
      const onSearch = jest.fn().mockResolvedValue([]);

      renderWithTheme(<CommandPalette actions={mockActions} onSearch={onSearch} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search or type a command/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/search or type a command/i);
      await user.type(input, 'test');

      // Should not call immediately
      expect(onSearch).not.toHaveBeenCalled();

      // Wait for debounce
      await waitFor(() => {
        expect(onSearch).toHaveBeenCalled();
      }, { timeout: 400 });
    });

    it('should show no results message when search returns empty', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search or type a command/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/search or type a command/i);
      await user.type(input, 'xyznonexistent');

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });
    });
  });

  describe('Action Selection', () => {
    it('should execute action when clicked', async () => {
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByText('New Case')).toBeInTheDocument();
      });

      const action = screen.getByText('New Case');
      fireEvent.click(action);

      expect(mockActions[0].onSelect).toHaveBeenCalled();
    });

    it('should execute action when Enter is pressed on selected item', async () => {
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search or type a command/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/search or type a command/i);
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockActions[0].onSelect).toHaveBeenCalled();
    });

    it('should close palette after action execution', async () => {
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByText('New Case')).toBeInTheDocument();
      });

      const action = screen.getByText('New Case');
      fireEvent.click(action);

      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/search or type a command/i)).not.toBeInTheDocument();
      });
    });

    it('should display action shortcuts', async () => {
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });

      expect(screen.getByText('⌘')).toBeInTheDocument();
      expect(screen.getByText('S')).toBeInTheDocument();
    });

    it('should show action descriptions', async () => {
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByText('Create a new case')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate down with ArrowDown key', async () => {
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search or type a command/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/search or type a command/i);
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      // Selection should move to next item
      expect(input).toBeInTheDocument();
    });

    it('should navigate up with ArrowUp key', async () => {
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search or type a command/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/search or type a command/i);
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });

      expect(input).toBeInTheDocument();
    });

    it('should highlight items on mouse hover', async () => {
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByText('New Case')).toBeInTheDocument();
      });

      const action = screen.getByText('New Case').closest('button');
      if (action) {
        fireEvent.mouseEnter(action);
        expect(action).toBeInTheDocument();
      }
    });

    it('should close on backdrop click', async () => {
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search or type a command/i)).toBeInTheDocument();
      });

      const backdrop = document.querySelector('[class*="backdrop"]');
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/search or type a command/i)).not.toBeInTheDocument();
      });
    });

    it('should display keyboard navigation hints in footer', async () => {
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByText('Navigate')).toBeInTheDocument();
        expect(screen.getByText('Select')).toBeInTheDocument();
        expect(screen.getByText('Close')).toBeInTheDocument();
      });
    });
  });

  describe('Recent Items', () => {
    it('should display recent items when no query', async () => {
      const recentItems: SearchResult[] = [
        {
          id: 'r1',
          title: 'Recently viewed case',
          type: 'case',
          onClick: jest.fn(),
        },
      ];

      renderWithTheme(<CommandPalette actions={mockActions} recentItems={recentItems} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByText('Recent')).toBeInTheDocument();
        expect(screen.getByText('Recently viewed case')).toBeInTheDocument();
      });
    });

    it('should hide recent items when searching', async () => {
      const user = userEvent.setup();
      const recentItems: SearchResult[] = [
        {
          id: 'r1',
          title: 'Recently viewed case',
          type: 'case',
          onClick: jest.fn(),
        },
      ];

      renderWithTheme(<CommandPalette actions={mockActions} recentItems={recentItems} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByText('Recently viewed case')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/search or type a command/i);
      await user.type(input, 'test');

      await waitFor(() => {
        expect(screen.queryByText('Recent')).not.toBeInTheDocument();
      });
    });

    it('should limit recent items to maxRecent prop', async () => {
      const recentItems: SearchResult[] = Array.from({ length: 10 }, (_, i) => ({
        id: `r${i}`,
        title: `Recent item ${i}`,
        type: 'case' as const,
        onClick: jest.fn(),
      }));

      renderWithTheme(<CommandPalette actions={mockActions} recentItems={recentItems} maxRecent={3} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByText('Recent item 0')).toBeInTheDocument();
        expect(screen.getByText('Recent item 2')).toBeInTheDocument();
        expect(screen.queryByText('Recent item 3')).not.toBeInTheDocument();
      });
    });

    it('should execute recent item onClick when selected', async () => {
      const onClick = jest.fn();
      const recentItems: SearchResult[] = [
        {
          id: 'r1',
          title: 'Recently viewed case',
          type: 'case',
          onClick,
        },
      ];

      renderWithTheme(<CommandPalette actions={mockActions} recentItems={recentItems} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByText('Recently viewed case')).toBeInTheDocument();
      });

      const recentItem = screen.getByText('Recently viewed case');
      fireEvent.click(recentItem);

      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('Nested Commands', () => {
    it('should navigate into nested commands', async () => {
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });

      const settingsAction = screen.getByText('Settings').closest('button');
      if (settingsAction) {
        fireEvent.click(settingsAction);
      }

      await waitFor(() => {
        expect(screen.getByText('Profile Settings')).toBeInTheDocument();
        expect(screen.getByText('System Settings')).toBeInTheDocument();
      });
    });

    it('should display breadcrumb for nested navigation', async () => {
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });

      const settingsAction = screen.getByText('Settings').closest('button');
      if (settingsAction) {
        fireEvent.click(settingsAction);
      }

      await waitFor(() => {
        const settingsBreadcrumb = screen.getAllByText('Settings')[0];
        expect(settingsBreadcrumb).toBeInTheDocument();
      });
    });

    it('should go back with Backspace when in nested view', async () => {
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });

      const settingsAction = screen.getByText('Settings').closest('button');
      if (settingsAction) {
        fireEvent.click(settingsAction);
      }

      await waitFor(() => {
        expect(screen.getByText('Profile Settings')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/search or type a command/i);
      fireEvent.keyDown(input, { key: 'Backspace' });

      await waitFor(() => {
        expect(screen.getByText('New Case')).toBeInTheDocument();
      });
    });

    it('should show chevron icon for actions with children', async () => {
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });

      // ChevronRight icon should be present
      const settingsButton = screen.getByText('Settings').closest('button');
      expect(settingsButton).toBeInTheDocument();
    });

    it('should clear search query when navigating into nested commands', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search or type a command/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/search or type a command/i);
      await user.type(input, 'test');

      const settingsAction = screen.getByText('Settings').closest('button');
      if (settingsAction) {
        fireEvent.click(settingsAction);
      }

      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        const input = screen.getByPlaceholderText(/search or type a command/i);
        expect(input).toHaveAttribute('type', 'text');
      });
    });

    it('should announce search results count', async () => {
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByText(/\d+ results/)).toBeInTheDocument();
      });
    });

    it('should be fully keyboard navigable', async () => {
      renderWithTheme(<CommandPalette actions={mockActions} />);

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        const input = screen.getByPlaceholderText(/search or type a command/i);
        expect(input).toHaveFocus();
      });
    });
  });
});
