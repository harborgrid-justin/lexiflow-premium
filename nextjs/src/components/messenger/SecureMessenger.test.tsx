/**
 * @jest-environment jsdom
 * SecureMessenger Component Tests
 * Enterprise-grade tests for encrypted messaging platform
 */

import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SecureMessenger from './SecureMessenger';

// Mock providers
jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: '', highlight: '' },
      text: { primary: '', secondary: '', tertiary: '', muted: '' },
      border: { default: '', subtle: '' },
      backdrop: '',
    },
  }),
}));

describe('SecureMessenger', () => {
  describe('Rendering', () => {
    it('renders the messenger header correctly', () => {
      render(<SecureMessenger />);

      expect(screen.getByText('Secure Messenger')).toBeInTheDocument();
      expect(screen.getByText('Encrypted communication platform.')).toBeInTheDocument();
    });

    it('renders all tab buttons', () => {
      render(<SecureMessenger />);

      expect(screen.getByRole('button', { name: /inbox/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /contacts/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /files/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /archived/i })).toBeInTheDocument();
    });

    it('renders inbox tab content by default', () => {
      render(<SecureMessenger />);

      expect(screen.getByPlaceholderText('Search messages...')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('switches to Contacts tab when clicked', async () => {
      const user = userEvent.setup();
      render(<SecureMessenger />);

      await user.click(screen.getByRole('button', { name: /contacts/i }));

      expect(screen.getByText('Add Contact')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane@lawfirm.com')).toBeInTheDocument();
    });

    it('switches to Files tab when clicked', async () => {
      const user = userEvent.setup();
      render(<SecureMessenger />);

      await user.click(screen.getByRole('button', { name: /files/i }));

      expect(screen.getByText('Shared Files')).toBeInTheDocument();
      expect(screen.getByText('Contract_Draft_v1.pdf')).toBeInTheDocument();
    });

    it('switches to Archived tab when clicked', async () => {
      const user = userEvent.setup();
      render(<SecureMessenger />);

      await user.click(screen.getByRole('button', { name: /archived/i }));

      expect(screen.getByText('No archived conversations')).toBeInTheDocument();
    });

    it('highlights active tab', async () => {
      const user = userEvent.setup();
      render(<SecureMessenger />);

      const contactsTab = screen.getByRole('button', { name: /contacts/i });
      await user.click(contactsTab);

      expect(contactsTab).toHaveClass('border-blue-500');
    });
  });

  describe('Inbox View', () => {
    it('displays chat list with user information', () => {
      render(<SecureMessenger />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Can we reschedule?')).toBeInTheDocument();
      expect(screen.getByText('10:30 AM')).toBeInTheDocument();
    });

    it('displays unread badge for chats with unread messages', () => {
      render(<SecureMessenger />);

      // John Doe has 2 unread messages
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('displays chat window with active conversation', () => {
      render(<SecureMessenger />);

      // Chat header shows John Doe
      const chatHeader = screen.getAllByText('John Doe');
      expect(chatHeader.length).toBeGreaterThan(0);

      // Shows online status
      expect(screen.getByText('Online')).toBeInTheDocument();
    });

    it('displays message history in chat window', () => {
      render(<SecureMessenger />);

      expect(screen.getByText('Hi John, do you have the documents ready?')).toBeInTheDocument();
      expect(screen.getByText('Almost there, just reviewing the last section.')).toBeInTheDocument();
      expect(screen.getByText('Can we reschedule our call to 2 PM?')).toBeInTheDocument();
    });

    it('has message input field', () => {
      render(<SecureMessenger />);

      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    });

    it('has search functionality in chat list', () => {
      render(<SecureMessenger />);

      const searchInput = screen.getByPlaceholderText('Search messages...');
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Contacts View', () => {
    it('displays contact list with roles', async () => {
      const user = userEvent.setup();
      render(<SecureMessenger />);

      await user.click(screen.getByRole('button', { name: /contacts/i }));

      expect(screen.getByText('Client')).toBeInTheDocument();
      expect(screen.getByText('Opposing Counsel')).toBeInTheDocument();
    });

    it('has Add Contact button', async () => {
      const user = userEvent.setup();
      render(<SecureMessenger />);

      await user.click(screen.getByRole('button', { name: /contacts/i }));

      expect(screen.getByText('Add Contact')).toBeInTheDocument();
    });
  });

  describe('Files View', () => {
    it('displays shared files grid', async () => {
      const user = userEvent.setup();
      render(<SecureMessenger />);

      await user.click(screen.getByRole('button', { name: /files/i }));

      expect(screen.getByText('Contract_Draft_v1.pdf')).toBeInTheDocument();
      expect(screen.getByText('Contract_Draft_v2.pdf')).toBeInTheDocument();
      expect(screen.getByText('Contract_Draft_v3.pdf')).toBeInTheDocument();
      expect(screen.getByText('Contract_Draft_v4.pdf')).toBeInTheDocument();
    });

    it('displays file metadata', async () => {
      const user = userEvent.setup();
      render(<SecureMessenger />);

      await user.click(screen.getByRole('button', { name: /files/i }));

      const fileInfo = screen.getAllByText(/2.4 MB/);
      expect(fileInfo.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<SecureMessenger />);

      expect(screen.getByRole('heading', { level: 1, name: 'Secure Messenger' })).toBeInTheDocument();
    });

    it('all interactive elements are focusable', () => {
      render(<SecureMessenger />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles tab transitions without errors', async () => {
      const user = userEvent.setup();
      render(<SecureMessenger />);

      // Rapid tab switching
      await user.click(screen.getByRole('button', { name: /contacts/i }));
      await user.click(screen.getByRole('button', { name: /files/i }));
      await user.click(screen.getByRole('button', { name: /archived/i }));
      await user.click(screen.getByRole('button', { name: /inbox/i }));

      // Should return to inbox successfully
      expect(screen.getByPlaceholderText('Search messages...')).toBeInTheDocument();
    });
  });
});
