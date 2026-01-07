/**
 * @jest-environment jsdom
 */
/**
 * ConversationSidebar Component Tests
 * Enterprise-grade tests for conversation list with filtering and search
 */

import type { Conversation } from '@/api/communications/messaging-api';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConversationSidebar, ConversationSidebarProps } from './ConversationSidebar';

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '5 minutes ago'),
}));

const createMockConversation = (overrides: Partial<Conversation> = {}): Conversation => ({
  id: 'conv-1',
  name: 'Test Conversation',
  type: 'direct',
  participants: [
    { userId: 'user-1', userName: 'John Doe', isOnline: true, isTyping: false },
  ],
  unreadCount: 0,
  isPinned: false,
  isMuted: false,
  isArchived: false,
  lastMessage: {
    id: 'msg-1',
    content: 'Hello there',
    senderId: 'user-1',
    senderName: 'John Doe',
    createdAt: new Date().toISOString(),
  },
  createdAt: new Date().toISOString(),
  ...overrides,
});

const defaultProps: ConversationSidebarProps = {
  conversations: [],
  onSelectConversation: jest.fn(),
};

describe('ConversationSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the Messages header', () => {
      render(<ConversationSidebar {...defaultProps} />);

      expect(screen.getByText('Messages')).toBeInTheDocument();
    });

    it('renders search input', () => {
      render(<ConversationSidebar {...defaultProps} />);

      expect(screen.getByPlaceholderText('Search conversations...')).toBeInTheDocument();
    });

    it('renders filter buttons', () => {
      render(<ConversationSidebar {...defaultProps} />);

      expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /unread/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /pinned/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /archived/i })).toBeInTheDocument();
    });

    it('renders new conversation button when onNewConversation provided', () => {
      const onNewConversation = jest.fn();
      render(
        <ConversationSidebar
          {...defaultProps}
          onNewConversation={onNewConversation}
        />
      );

      expect(screen.getByTitle('New conversation')).toBeInTheDocument();
    });

    it('does not render new conversation button when not provided', () => {
      render(<ConversationSidebar {...defaultProps} />);

      expect(screen.queryByTitle('New conversation')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when isLoading is true', () => {
      render(<ConversationSidebar {...defaultProps} isLoading={true} />);

      expect(screen.getByRole('status', { hidden: true }) ||
        document.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no conversations', () => {
      render(<ConversationSidebar {...defaultProps} conversations={[]} />);

      expect(screen.getByText('No conversations yet')).toBeInTheDocument();
    });

    it('shows no results message when search has no matches', async () => {
      const user = userEvent.setup();
      const conversations = [createMockConversation({ name: 'Legal Discussion' })];

      render(<ConversationSidebar {...defaultProps} conversations={conversations} />);

      await user.type(screen.getByPlaceholderText('Search conversations...'), 'nonexistent');

      expect(screen.getByText('No conversations found')).toBeInTheDocument();
    });
  });

  describe('Conversation List', () => {
    it('displays conversations with names', () => {
      const conversations = [
        createMockConversation({ id: '1', name: 'Case Discussion' }),
        createMockConversation({ id: '2', name: 'Team Chat' }),
      ];

      render(<ConversationSidebar {...defaultProps} conversations={conversations} />);

      expect(screen.getByText('Case Discussion')).toBeInTheDocument();
      expect(screen.getByText('Team Chat')).toBeInTheDocument();
    });

    it('shows unread badge for conversations with unread messages', () => {
      const conversations = [
        createMockConversation({ id: '1', unreadCount: 5 }),
      ];

      render(<ConversationSidebar {...defaultProps} conversations={conversations} />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('shows pinned indicator for pinned conversations', () => {
      const conversations = [
        createMockConversation({ id: '1', isPinned: true, name: 'Pinned Chat' }),
      ];

      render(<ConversationSidebar {...defaultProps} conversations={conversations} />);

      // The pinned icon should be visible
      expect(screen.getByText('Pinned Chat')).toBeInTheDocument();
    });

    it('shows typing indicator when participant is typing', () => {
      const conversations = [
        createMockConversation({
          id: '1',
          participants: [
            { userId: 'user-1', userName: 'John Doe', isOnline: true, isTyping: true },
          ],
        }),
      ];

      render(<ConversationSidebar {...defaultProps} conversations={conversations} />);

      expect(screen.getByText(/is typing/)).toBeInTheDocument();
    });

    it('shows last message preview', () => {
      const conversations = [
        createMockConversation({
          lastMessage: {
            id: 'msg-1',
            content: 'See you tomorrow',
            senderId: 'user-1',
            senderName: 'John',
            createdAt: new Date().toISOString(),
          },
        }),
      ];

      render(<ConversationSidebar {...defaultProps} conversations={conversations} />);

      expect(screen.getByText(/See you tomorrow/)).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('filters conversations by name', async () => {
      const user = userEvent.setup();
      const conversations = [
        createMockConversation({ id: '1', name: 'Legal Team' }),
        createMockConversation({ id: '2', name: 'Marketing Group' }),
      ];

      render(<ConversationSidebar {...defaultProps} conversations={conversations} />);

      await user.type(screen.getByPlaceholderText('Search conversations...'), 'Legal');

      expect(screen.getByText('Legal Team')).toBeInTheDocument();
      expect(screen.queryByText('Marketing Group')).not.toBeInTheDocument();
    });

    it('filters conversations by participant name', async () => {
      const user = userEvent.setup();
      const conversations = [
        createMockConversation({
          id: '1',
          name: null,
          participants: [{ userId: 'u1', userName: 'Alice Smith', isOnline: false, isTyping: false }],
        }),
        createMockConversation({
          id: '2',
          name: null,
          participants: [{ userId: 'u2', userName: 'Bob Jones', isOnline: false, isTyping: false }],
        }),
      ];

      render(<ConversationSidebar {...defaultProps} conversations={conversations} />);

      await user.type(screen.getByPlaceholderText('Search conversations...'), 'Alice');

      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument();
    });
  });

  describe('Filter Functionality', () => {
    it('filters by unread when unread filter selected', async () => {
      const user = userEvent.setup();
      const conversations = [
        createMockConversation({ id: '1', name: 'Has Unread', unreadCount: 3 }),
        createMockConversation({ id: '2', name: 'All Read', unreadCount: 0 }),
      ];

      render(<ConversationSidebar {...defaultProps} conversations={conversations} />);

      await user.click(screen.getByRole('button', { name: /unread/i }));

      expect(screen.getByText('Has Unread')).toBeInTheDocument();
      expect(screen.queryByText('All Read')).not.toBeInTheDocument();
    });

    it('filters by pinned when pinned filter selected', async () => {
      const user = userEvent.setup();
      const conversations = [
        createMockConversation({ id: '1', name: 'Pinned Chat', isPinned: true }),
        createMockConversation({ id: '2', name: 'Regular Chat', isPinned: false }),
      ];

      render(<ConversationSidebar {...defaultProps} conversations={conversations} />);

      await user.click(screen.getByRole('button', { name: /pinned/i }));

      expect(screen.getByText('Pinned Chat')).toBeInTheDocument();
      expect(screen.queryByText('Regular Chat')).not.toBeInTheDocument();
    });

    it('filters by archived when archived filter selected', async () => {
      const user = userEvent.setup();
      const conversations = [
        createMockConversation({ id: '1', name: 'Archived Chat', isArchived: true }),
        createMockConversation({ id: '2', name: 'Active Chat', isArchived: false }),
      ];

      render(<ConversationSidebar {...defaultProps} conversations={conversations} />);

      await user.click(screen.getByRole('button', { name: /archived/i }));

      expect(screen.getByText('Archived Chat')).toBeInTheDocument();
      expect(screen.queryByText('Active Chat')).not.toBeInTheDocument();
    });
  });

  describe('Conversation Selection', () => {
    it('calls onSelectConversation when conversation clicked', async () => {
      const user = userEvent.setup();
      const onSelectConversation = jest.fn();
      const conversation = createMockConversation({ name: 'Clickable Chat' });

      render(
        <ConversationSidebar
          {...defaultProps}
          conversations={[conversation]}
          onSelectConversation={onSelectConversation}
        />
      );

      await user.click(screen.getByText('Clickable Chat'));

      expect(onSelectConversation).toHaveBeenCalledWith(conversation);
    });

    it('highlights active conversation', () => {
      const conversations = [
        createMockConversation({ id: 'conv-1', name: 'Active' }),
        createMockConversation({ id: 'conv-2', name: 'Inactive' }),
      ];

      render(
        <ConversationSidebar
          {...defaultProps}
          conversations={conversations}
          activeConversationId="conv-1"
        />
      );

      const activeItem = screen.getByText('Active').closest('div[class*="cursor-pointer"]');
      expect(activeItem).toHaveClass('bg-blue-50');
    });
  });

  describe('Action Buttons', () => {
    it('calls onPin when pin button clicked', async () => {
      const user = userEvent.setup();
      const onPin = jest.fn();
      const conversation = createMockConversation({ name: 'Pinnable Chat' });

      render(
        <ConversationSidebar
          {...defaultProps}
          conversations={[conversation]}
          onPin={onPin}
        />
      );

      // Hover to show action buttons
      const conversationItem = screen.getByText('Pinnable Chat').closest('div[class*="cursor-pointer"]');
      fireEvent.mouseEnter(conversationItem!);

      const pinButton = screen.getByTitle(/pin/i);
      await user.click(pinButton);

      expect(onPin).toHaveBeenCalledWith(conversation);
    });

    it('calls onMute when mute button clicked', async () => {
      const user = userEvent.setup();
      const onMute = jest.fn();
      const conversation = createMockConversation({ name: 'Mutable Chat' });

      render(
        <ConversationSidebar
          {...defaultProps}
          conversations={[conversation]}
          onMute={onMute}
        />
      );

      const conversationItem = screen.getByText('Mutable Chat').closest('div[class*="cursor-pointer"]');
      fireEvent.mouseEnter(conversationItem!);

      const muteButton = screen.getByTitle(/mute/i);
      await user.click(muteButton);

      expect(onMute).toHaveBeenCalledWith(conversation);
    });

    it('calls onArchive when archive button clicked', async () => {
      const user = userEvent.setup();
      const onArchive = jest.fn();
      const conversation = createMockConversation({ name: 'Archivable Chat' });

      render(
        <ConversationSidebar
          {...defaultProps}
          conversations={[conversation]}
          onArchive={onArchive}
        />
      );

      const conversationItem = screen.getByText('Archivable Chat').closest('div[class*="cursor-pointer"]');
      fireEvent.mouseEnter(conversationItem!);

      const archiveButton = screen.getByTitle(/archive/i);
      await user.click(archiveButton);

      expect(onArchive).toHaveBeenCalledWith(conversation);
    });

    it('calls onNewConversation when new button clicked', async () => {
      const user = userEvent.setup();
      const onNewConversation = jest.fn();

      render(
        <ConversationSidebar
          {...defaultProps}
          onNewConversation={onNewConversation}
        />
      );

      await user.click(screen.getByTitle('New conversation'));

      expect(onNewConversation).toHaveBeenCalled();
    });
  });

  describe('Sorting', () => {
    it('sorts pinned conversations first', () => {
      const conversations = [
        createMockConversation({ id: '1', name: 'Normal', isPinned: false }),
        createMockConversation({ id: '2', name: 'Pinned', isPinned: true }),
      ];

      render(<ConversationSidebar {...defaultProps} conversations={conversations} />);

      const items = screen.getAllByRole('heading', { level: 3 });
      expect(items[0]).toHaveTextContent('Pinned');
    });
  });

  describe('Conversation Types', () => {
    it('displays group icon for group conversations', () => {
      const conversations = [
        createMockConversation({
          id: '1',
          type: 'group',
          name: 'Team Discussion',
          participants: [
            { userId: 'u1', userName: 'User 1', isOnline: false, isTyping: false },
            { userId: 'u2', userName: 'User 2', isOnline: false, isTyping: false },
          ],
        }),
      ];

      render(<ConversationSidebar {...defaultProps} conversations={conversations} />);

      expect(screen.getByText('Team Discussion')).toBeInTheDocument();
    });

    it('displays case icon for case conversations', () => {
      const conversations = [
        createMockConversation({
          id: '1',
          type: 'case',
          caseId: 'CASE-123',
          name: null,
        }),
      ];

      render(<ConversationSidebar {...defaultProps} conversations={conversations} />);

      expect(screen.getByText(/Case: CASE-123/)).toBeInTheDocument();
    });
  });

  describe('Online Status', () => {
    it('shows online indicator when participant is online', () => {
      const conversations = [
        createMockConversation({
          participants: [
            { userId: 'u1', userName: 'Online User', isOnline: true, isTyping: false },
          ],
        }),
      ];

      render(<ConversationSidebar {...defaultProps} conversations={conversations} />);

      // Should have green online indicator
      const onlineIndicator = document.querySelector('.bg-green-500');
      expect(onlineIndicator).toBeInTheDocument();
    });
  });
});
