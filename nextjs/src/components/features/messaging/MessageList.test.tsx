/**
 * @jest-environment jsdom
 */
/**
 * MessageList Component Tests
 * Enterprise-grade tests for message list with thread view support
 */

import type { Message } from '@/api/communications/messaging-api';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageList, MessageListProps } from './MessageList';

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '5 minutes ago'),
}));

// Mock scrollIntoView
const mockScrollIntoView = jest.fn();
window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

// Mock window.confirm
const mockConfirm = jest.fn(() => true);
window.confirm = mockConfirm;

const createMockMessage = (overrides: Partial<Message> = {}): Message => ({
  id: 'msg-1',
  content: 'Test message content',
  senderId: 'user-1',
  senderName: 'John Doe',
  createdAt: new Date().toISOString(),
  status: 'sent',
  ...overrides,
});

const defaultProps: MessageListProps = {
  messages: [],
  currentUserId: 'current-user',
};

describe('MessageList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders empty state when no messages', () => {
      render(<MessageList {...defaultProps} messages={[]} />);

      expect(screen.getByText('No messages yet')).toBeInTheDocument();
      expect(screen.getByText(/Start the conversation/)).toBeInTheDocument();
    });

    it('renders loading state when isLoading is true', () => {
      render(<MessageList {...defaultProps} isLoading={true} />);

      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('renders messages from other users on the left', () => {
      const messages = [
        createMockMessage({
          id: '1',
          senderId: 'other-user',
          senderName: 'Other User',
          content: 'Hello from other user',
        }),
      ];

      render(<MessageList {...defaultProps} messages={messages} />);

      const messageContainer = screen.getByText('Hello from other user').closest('div[class*="flex"]');
      expect(messageContainer).toHaveClass('justify-start');
    });

    it('renders own messages on the right', () => {
      const messages = [
        createMockMessage({
          id: '1',
          senderId: 'current-user',
          content: 'Hello from me',
        }),
      ];

      render(<MessageList {...defaultProps} messages={messages} />);

      const messageContainer = screen.getByText('Hello from me').closest('div[class*="justify-"]');
      expect(messageContainer).toHaveClass('justify-end');
    });
  });

  describe('Message Display', () => {
    it('displays message content', () => {
      const messages = [
        createMockMessage({ content: 'Hello World' }),
      ];

      render(<MessageList {...defaultProps} messages={messages} />);

      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('displays sender name for other users messages', () => {
      const messages = [
        createMockMessage({
          senderId: 'other-user',
          senderName: 'Jane Smith',
        }),
      ];

      render(<MessageList {...defaultProps} messages={messages} />);

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('does not display sender name for own messages', () => {
      const messages = [
        createMockMessage({
          senderId: 'current-user',
          senderName: 'Current User',
        }),
      ];

      render(<MessageList {...defaultProps} messages={messages} />);

      expect(screen.queryByText('Current User')).not.toBeInTheDocument();
    });

    it('displays timestamp', () => {
      const messages = [createMockMessage()];

      render(<MessageList {...defaultProps} messages={messages} />);

      expect(screen.getByText('5 minutes ago')).toBeInTheDocument();
    });

    it('displays edited indicator for edited messages', () => {
      const messages = [
        createMockMessage({ isEdited: true }),
      ];

      render(<MessageList {...defaultProps} messages={messages} />);

      expect(screen.getByText('(edited)')).toBeInTheDocument();
    });
  });

  describe('Message Status', () => {
    it('shows sending indicator for status=sending', () => {
      const messages = [
        createMockMessage({
          senderId: 'current-user',
          status: 'sending',
        }),
      ];

      render(<MessageList {...defaultProps} messages={messages} />);

      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('shows checkmark for status=sent', () => {
      const messages = [
        createMockMessage({
          senderId: 'current-user',
          status: 'sent',
        }),
      ];

      render(<MessageList {...defaultProps} messages={messages} />);

      // Should have a checkmark SVG
      const statusContainer = screen.getByText('5 minutes ago').parentElement;
      expect(statusContainer?.querySelector('svg')).toBeInTheDocument();
    });

    it('shows double checkmark for status=delivered', () => {
      const messages = [
        createMockMessage({
          senderId: 'current-user',
          status: 'delivered',
        }),
      ];

      render(<MessageList {...defaultProps} messages={messages} />);

      const statusContainer = screen.getByText('5 minutes ago').parentElement;
      expect(statusContainer?.querySelector('svg')).toBeInTheDocument();
    });

    it('shows blue checkmarks for status=read', () => {
      const messages = [
        createMockMessage({
          senderId: 'current-user',
          status: 'read',
        }),
      ];

      render(<MessageList {...defaultProps} messages={messages} />);

      const statusContainer = screen.getByText('5 minutes ago').parentElement;
      expect(statusContainer?.querySelector('.text-blue-500')).toBeInTheDocument();
    });

    it('shows error indicator for status=failed', () => {
      const messages = [
        createMockMessage({
          senderId: 'current-user',
          status: 'failed',
        }),
      ];

      render(<MessageList {...defaultProps} messages={messages} />);

      const statusContainer = screen.getByText('5 minutes ago').parentElement;
      expect(statusContainer?.querySelector('.text-red-500')).toBeInTheDocument();
    });
  });

  describe('Avatars', () => {
    it('shows avatar for first message from sender', () => {
      const messages = [
        createMockMessage({
          senderId: 'other-user',
          senderName: 'John',
        }),
      ];

      render(<MessageList {...defaultProps} messages={messages} />);

      // Should have avatar with first letter
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('hides avatar for consecutive messages from same sender', () => {
      const messages = [
        createMockMessage({
          id: '1',
          senderId: 'other-user',
          senderName: 'John',
          content: 'Message 1',
        }),
        createMockMessage({
          id: '2',
          senderId: 'other-user',
          senderName: 'John',
          content: 'Message 2',
        }),
      ];

      render(<MessageList {...defaultProps} messages={messages} />);

      // Only one visible avatar (first letter)
      const avatars = screen.getAllByText('J');
      expect(avatars).toHaveLength(1);
    });
  });

  describe('Reply Indicator', () => {
    it('displays reply indicator when message has replyTo', () => {
      const messages = [
        createMockMessage({
          replyTo: 'original-msg-id',
        }),
      ];

      render(<MessageList {...defaultProps} messages={messages} />);

      expect(screen.getByText(/Replying to previous message/)).toBeInTheDocument();
    });
  });

  describe('Attachments', () => {
    it('displays attachments when present', () => {
      const messages = [
        createMockMessage({
          attachments: [
            {
              id: 'att-1',
              name: 'document.pdf',
              url: 'http://example.com/doc.pdf',
              size: 1024,
              mimeType: 'application/pdf',
            },
          ],
        }),
      ];

      render(<MessageList {...defaultProps} messages={messages} />);

      expect(screen.getByText('document.pdf')).toBeInTheDocument();
      expect(screen.getByText('(1.0 KB)')).toBeInTheDocument();
    });

    it('attachments are clickable links', () => {
      const messages = [
        createMockMessage({
          attachments: [
            {
              id: 'att-1',
              name: 'document.pdf',
              url: 'http://example.com/doc.pdf',
              size: 1024,
              mimeType: 'application/pdf',
            },
          ],
        }),
      ];

      render(<MessageList {...defaultProps} messages={messages} />);

      const link = screen.getByText('document.pdf').closest('a');
      expect(link).toHaveAttribute('href', 'http://example.com/doc.pdf');
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  describe('Message Actions', () => {
    it('shows reply button on hover when onReply provided', async () => {
      const onReply = jest.fn();
      const messages = [createMockMessage({ senderId: 'other-user' })];

      render(
        <MessageList
          {...defaultProps}
          messages={messages}
          onReply={onReply}
        />
      );

      const messageElement = screen.getByText('Test message content').closest('.group');
      fireEvent.mouseEnter(messageElement!);

      expect(screen.getByTitle('Reply')).toBeInTheDocument();
    });

    it('calls onReply when reply button clicked', async () => {
      const user = userEvent.setup();
      const onReply = jest.fn();
      const message = createMockMessage({ senderId: 'other-user' });

      render(
        <MessageList
          {...defaultProps}
          messages={[message]}
          onReply={onReply}
        />
      );

      const messageElement = screen.getByText('Test message content').closest('.group');
      fireEvent.mouseEnter(messageElement!);

      await user.click(screen.getByTitle('Reply'));

      expect(onReply).toHaveBeenCalledWith(message);
    });

    it('shows edit button for own messages when onEdit provided', async () => {
      const onEdit = jest.fn();
      const messages = [createMockMessage({ senderId: 'current-user' })];

      render(
        <MessageList
          {...defaultProps}
          messages={messages}
          onEdit={onEdit}
        />
      );

      const messageElement = screen.getByText('Test message content').closest('.group');
      fireEvent.mouseEnter(messageElement!);

      expect(screen.getByTitle('Edit')).toBeInTheDocument();
    });

    it('does not show edit button for other users messages', async () => {
      const onEdit = jest.fn();
      const messages = [createMockMessage({ senderId: 'other-user' })];

      render(
        <MessageList
          {...defaultProps}
          messages={messages}
          onEdit={onEdit}
        />
      );

      const messageElement = screen.getByText('Test message content').closest('.group');
      fireEvent.mouseEnter(messageElement!);

      expect(screen.queryByTitle('Edit')).not.toBeInTheDocument();
    });

    it('calls onEdit when edit button clicked', async () => {
      const user = userEvent.setup();
      const onEdit = jest.fn();
      const message = createMockMessage({ senderId: 'current-user' });

      render(
        <MessageList
          {...defaultProps}
          messages={[message]}
          onEdit={onEdit}
        />
      );

      const messageElement = screen.getByText('Test message content').closest('.group');
      fireEvent.mouseEnter(messageElement!);

      await user.click(screen.getByTitle('Edit'));

      expect(onEdit).toHaveBeenCalledWith(message);
    });

    it('shows delete button for own messages when onDelete provided', async () => {
      const onDelete = jest.fn();
      const messages = [createMockMessage({ senderId: 'current-user' })];

      render(
        <MessageList
          {...defaultProps}
          messages={messages}
          onDelete={onDelete}
        />
      );

      const messageElement = screen.getByText('Test message content').closest('.group');
      fireEvent.mouseEnter(messageElement!);

      expect(screen.getByTitle('Delete')).toBeInTheDocument();
    });

    it('calls onDelete with confirmation when delete button clicked', async () => {
      const user = userEvent.setup();
      const onDelete = jest.fn();
      const message = createMockMessage({ senderId: 'current-user' });

      render(
        <MessageList
          {...defaultProps}
          messages={[message]}
          onDelete={onDelete}
        />
      );

      const messageElement = screen.getByText('Test message content').closest('.group');
      fireEvent.mouseEnter(messageElement!);

      await user.click(screen.getByTitle('Delete'));

      expect(mockConfirm).toHaveBeenCalled();
      expect(onDelete).toHaveBeenCalledWith(message);
    });

    it('does not call onDelete when confirmation cancelled', async () => {
      const user = userEvent.setup();
      const onDelete = jest.fn();
      mockConfirm.mockReturnValueOnce(false);
      const message = createMockMessage({ senderId: 'current-user' });

      render(
        <MessageList
          {...defaultProps}
          messages={[message]}
          onDelete={onDelete}
        />
      );

      const messageElement = screen.getByText('Test message content').closest('.group');
      fireEvent.mouseEnter(messageElement!);

      await user.click(screen.getByTitle('Delete'));

      expect(mockConfirm).toHaveBeenCalled();
      expect(onDelete).not.toHaveBeenCalled();
    });
  });

  describe('Message Click', () => {
    it('calls onMessageClick when message clicked', async () => {
      const user = userEvent.setup();
      const onMessageClick = jest.fn();
      const message = createMockMessage();

      render(
        <MessageList
          {...defaultProps}
          messages={[message]}
          onMessageClick={onMessageClick}
        />
      );

      await user.click(screen.getByText('Test message content'));

      expect(onMessageClick).toHaveBeenCalledWith(message);
    });
  });

  describe('Auto-scroll', () => {
    it('scrolls to bottom when new messages arrive', () => {
      const messages = [createMockMessage({ id: '1' })];
      const { rerender } = render(
        <MessageList {...defaultProps} messages={messages} />
      );

      const newMessages = [
        ...messages,
        createMockMessage({ id: '2', content: 'New message' }),
      ];

      rerender(<MessageList {...defaultProps} messages={newMessages} />);

      expect(mockScrollIntoView).toHaveBeenCalled();
    });
  });

  describe('Message Styling', () => {
    it('applies blue background to own messages', () => {
      const messages = [
        createMockMessage({
          senderId: 'current-user',
          content: 'My message',
        }),
      ];

      render(<MessageList {...defaultProps} messages={messages} />);

      const messageBubble = screen.getByText('My message').closest('div[class*="rounded-lg"]');
      expect(messageBubble).toHaveClass('bg-blue-600');
    });

    it('applies gray background to other users messages', () => {
      const messages = [
        createMockMessage({
          senderId: 'other-user',
          content: 'Their message',
        }),
      ];

      render(<MessageList {...defaultProps} messages={messages} />);

      const messageBubble = screen.getByText('Their message').closest('div[class*="rounded-lg"]');
      expect(messageBubble).toHaveClass('bg-gray-100');
    });
  });

  describe('Multiple Messages', () => {
    it('renders multiple messages in order', () => {
      const messages = [
        createMockMessage({ id: '1', content: 'First message' }),
        createMockMessage({ id: '2', content: 'Second message' }),
        createMockMessage({ id: '3', content: 'Third message' }),
      ];

      render(<MessageList {...defaultProps} messages={messages} />);

      const messageTexts = screen.getAllByText(/message$/);
      expect(messageTexts).toHaveLength(3);
      expect(messageTexts[0]).toHaveTextContent('First message');
      expect(messageTexts[1]).toHaveTextContent('Second message');
      expect(messageTexts[2]).toHaveTextContent('Third message');
    });
  });
});
