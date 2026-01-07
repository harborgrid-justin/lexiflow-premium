/**
 * @jest-environment jsdom
 */
/**
 * MessageComposer Component Tests
 * Enterprise-grade tests for rich text message composer with attachments
 */

import type { Message } from '@/api/communications/messaging-api';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageComposer, MessageComposerProps } from './MessageComposer';

// Mock timers
jest.useFakeTimers();

const defaultProps: MessageComposerProps = {
  onSend: jest.fn(),
};

const createMockMessage = (overrides: Partial<Message> = {}): Message => ({
  id: 'msg-1',
  content: 'Test message',
  senderId: 'user-1',
  senderName: 'John Doe',
  createdAt: new Date().toISOString(),
  status: 'sent',
  ...overrides,
});

describe('MessageComposer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Rendering', () => {
    it('renders textarea with default placeholder', () => {
      render(<MessageComposer {...defaultProps} />);

      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    });

    it('renders textarea with custom placeholder', () => {
      render(<MessageComposer {...defaultProps} placeholder="Write something..." />);

      expect(screen.getByPlaceholderText('Write something...')).toBeInTheDocument();
    });

    it('renders send button', () => {
      render(<MessageComposer {...defaultProps} />);

      expect(screen.getByTitle('Send message')).toBeInTheDocument();
    });

    it('renders attachment button', () => {
      render(<MessageComposer {...defaultProps} />);

      expect(screen.getByTitle('Attach file')).toBeInTheDocument();
    });

    it('renders hint text', () => {
      render(<MessageComposer {...defaultProps} />);

      expect(screen.getByText(/Press Enter to send/)).toBeInTheDocument();
    });
  });

  describe('Message Input', () => {
    it('allows typing in textarea', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<MessageComposer {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Type a message...');
      await user.type(textarea, 'Hello world');

      expect(textarea).toHaveValue('Hello world');
    });

    it('respects maxLength prop', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<MessageComposer {...defaultProps} maxLength={10} />);

      const textarea = screen.getByPlaceholderText('Type a message...');
      await user.type(textarea, 'This is a very long message');

      expect(textarea.value.length).toBeLessThanOrEqual(10);
    });

    it('shows character count when approaching limit', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<MessageComposer {...defaultProps} maxLength={100} />);

      const textarea = screen.getByPlaceholderText('Type a message...');
      // Type 91 characters (> 90% of 100)
      await user.type(textarea, 'x'.repeat(91));

      expect(screen.getByText(/91\/100/)).toBeInTheDocument();
    });
  });

  describe('Sending Messages', () => {
    it('calls onSend when clicking send button with content', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onSend = jest.fn();
      render(<MessageComposer onSend={onSend} />);

      const textarea = screen.getByPlaceholderText('Type a message...');
      await user.type(textarea, 'Hello world');
      await user.click(screen.getByTitle('Send message'));

      expect(onSend).toHaveBeenCalledWith('Hello world', []);
    });

    it('clears textarea after sending', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<MessageComposer {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Type a message...');
      await user.type(textarea, 'Hello world');
      await user.click(screen.getByTitle('Send message'));

      expect(textarea).toHaveValue('');
    });

    it('sends message on Enter key press', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onSend = jest.fn();
      render(<MessageComposer onSend={onSend} />);

      const textarea = screen.getByPlaceholderText('Type a message...');
      await user.type(textarea, 'Hello{Enter}');

      expect(onSend).toHaveBeenCalledWith('Hello', []);
    });

    it('does not send on Shift+Enter (allows new line)', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onSend = jest.fn();
      render(<MessageComposer onSend={onSend} />);

      const textarea = screen.getByPlaceholderText('Type a message...');
      await user.type(textarea, 'Hello{Shift>}{Enter}{/Shift}World');

      expect(onSend).not.toHaveBeenCalled();
      expect(textarea.value).toContain('Hello');
      expect(textarea.value).toContain('World');
    });

    it('does not send empty messages', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onSend = jest.fn();
      render(<MessageComposer onSend={onSend} />);

      await user.click(screen.getByTitle('Send message'));

      expect(onSend).not.toHaveBeenCalled();
    });

    it('does not send whitespace-only messages', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onSend = jest.fn();
      render(<MessageComposer onSend={onSend} />);

      const textarea = screen.getByPlaceholderText('Type a message...');
      await user.type(textarea, '   ');
      await user.click(screen.getByTitle('Send message'));

      expect(onSend).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('disables textarea when disabled prop is true', () => {
      render(<MessageComposer {...defaultProps} disabled={true} />);

      expect(screen.getByPlaceholderText('Type a message...')).toBeDisabled();
    });

    it('disables send button when disabled', () => {
      render(<MessageComposer {...defaultProps} disabled={true} />);

      expect(screen.getByTitle('Send message')).toBeDisabled();
    });

    it('disables attachment button when disabled', () => {
      render(<MessageComposer {...defaultProps} disabled={true} />);

      expect(screen.getByTitle('Attach file')).toBeDisabled();
    });

    it('does not send when disabled', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onSend = jest.fn();
      render(<MessageComposer onSend={onSend} disabled={true} />);

      // Try to type and send
      const textarea = screen.getByPlaceholderText('Type a message...');
      await user.type(textarea, 'Hello');

      expect(onSend).not.toHaveBeenCalled();
    });
  });

  describe('File Attachments', () => {
    it('accepts file uploads', async () => {
      render(<MessageComposer {...defaultProps} />);

      const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      expect(screen.getByText('hello.txt')).toBeInTheDocument();
    });

    it('displays file size', async () => {
      render(<MessageComposer {...defaultProps} />);

      const file = new File(['hello world'], 'hello.txt', { type: 'text/plain' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      expect(screen.getByText(/KB/)).toBeInTheDocument();
    });

    it('allows removing attachments', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<MessageComposer {...defaultProps} />);

      const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      // Find and click remove button
      const removeButton = screen.getByText('hello.txt').parentElement?.querySelector('button');
      await user.click(removeButton!);

      expect(screen.queryByText('hello.txt')).not.toBeInTheDocument();
    });

    it('sends attachments with message', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onSend = jest.fn();
      render(<MessageComposer onSend={onSend} />);

      const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      const textarea = screen.getByPlaceholderText('Type a message...');
      await user.type(textarea, 'Check this file');
      await user.click(screen.getByTitle('Send message'));

      expect(onSend).toHaveBeenCalledWith('Check this file', [file]);
    });

    it('clears attachments after sending', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<MessageComposer {...defaultProps} />);

      const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      const textarea = screen.getByPlaceholderText('Type a message...');
      await user.type(textarea, 'Here is a file');
      await user.click(screen.getByTitle('Send message'));

      expect(screen.queryByText('hello.txt')).not.toBeInTheDocument();
    });

    it('can send attachment without message text', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onSend = jest.fn();
      render(<MessageComposer onSend={onSend} />);

      const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      await user.click(screen.getByTitle('Send message'));

      expect(onSend).toHaveBeenCalledWith('', [file]);
    });

    it('supports multiple file attachments', async () => {
      render(<MessageComposer {...defaultProps} />);

      const file1 = new File(['hello'], 'hello.txt', { type: 'text/plain' });
      const file2 = new File(['world'], 'world.txt', { type: 'text/plain' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(input, { target: { files: [file1, file2] } });
      });

      expect(screen.getByText('hello.txt')).toBeInTheDocument();
      expect(screen.getByText('world.txt')).toBeInTheDocument();
    });
  });

  describe('Reply Functionality', () => {
    it('displays reply indicator when replyTo provided', () => {
      const replyMessage = createMockMessage({ senderName: 'Jane Doe' });
      render(<MessageComposer {...defaultProps} replyTo={replyMessage} />);

      expect(screen.getByText(/Replying to/)).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    it('calls onCancelReply when cancel button clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onCancelReply = jest.fn();
      const replyMessage = createMockMessage({ senderName: 'Jane Doe' });

      render(
        <MessageComposer
          {...defaultProps}
          replyTo={replyMessage}
          onCancelReply={onCancelReply}
        />
      );

      const cancelButton = screen.getByText(/Replying to/).parentElement?.querySelector('button');
      await user.click(cancelButton!);

      expect(onCancelReply).toHaveBeenCalled();
    });
  });

  describe('Typing Indicator', () => {
    it('calls onTyping(true) when user starts typing', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onTyping = jest.fn();
      render(<MessageComposer {...defaultProps} onTyping={onTyping} />);

      const textarea = screen.getByPlaceholderText('Type a message...');
      await user.type(textarea, 'H');

      expect(onTyping).toHaveBeenCalledWith(true);
    });

    it('calls onTyping(false) after timeout', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onTyping = jest.fn();
      render(<MessageComposer {...defaultProps} onTyping={onTyping} />);

      const textarea = screen.getByPlaceholderText('Type a message...');
      await user.type(textarea, 'Hello');

      // Fast forward past the typing timeout
      act(() => {
        jest.advanceTimersByTime(3500);
      });

      expect(onTyping).toHaveBeenCalledWith(false);
    });

    it('calls onTyping(false) when text is cleared', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onTyping = jest.fn();
      render(<MessageComposer {...defaultProps} onTyping={onTyping} />);

      const textarea = screen.getByPlaceholderText('Type a message...');
      await user.type(textarea, 'Hello');
      await user.clear(textarea);

      expect(onTyping).toHaveBeenLastCalledWith(false);
    });

    it('calls onTyping(false) after sending message', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onTyping = jest.fn();
      render(<MessageComposer {...defaultProps} onTyping={onTyping} />);

      const textarea = screen.getByPlaceholderText('Type a message...');
      await user.type(textarea, 'Hello');
      await user.click(screen.getByTitle('Send message'));

      expect(onTyping).toHaveBeenLastCalledWith(false);
    });
  });

  describe('Send Button State', () => {
    it('send button is disabled when textarea is empty and no attachments', () => {
      render(<MessageComposer {...defaultProps} />);

      expect(screen.getByTitle('Send message')).toBeDisabled();
    });

    it('send button is enabled when textarea has content', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<MessageComposer {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Type a message...');
      await user.type(textarea, 'Hello');

      expect(screen.getByTitle('Send message')).not.toBeDisabled();
    });

    it('send button is enabled when attachments present', async () => {
      render(<MessageComposer {...defaultProps} />);

      const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      expect(screen.getByTitle('Send message')).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('textarea is accessible', () => {
      render(<MessageComposer {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Type a message...');
      expect(textarea).toHaveAttribute('placeholder');
    });

    it('buttons have accessible titles', () => {
      render(<MessageComposer {...defaultProps} />);

      expect(screen.getByTitle('Send message')).toBeInTheDocument();
      expect(screen.getByTitle('Attach file')).toBeInTheDocument();
    });
  });
});
