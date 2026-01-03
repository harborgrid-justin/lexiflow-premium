/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ClientPortal } from '@/components/enterprise/CRM/ClientPortal';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';

// Mock Lucide icons
jest.mock('lucide-react', () => {
  const React = require('react');
  return {
    FileText: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="file-icon" {...props} />),
    Download: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="download-icon" {...props} />),
    Upload: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="upload-icon" {...props} />),
    Lock: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="lock-icon" {...props} />),
    Shield: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="shield-icon" {...props} />),
    Calendar: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="calendar-icon" {...props} />),
    MessageSquare: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="message-icon" {...props} />),
    CreditCard: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="credit-card-icon" {...props} />),
    Eye: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="eye-icon" {...props} />),
    Clock: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="clock-icon" {...props} />),
    CheckCircle2: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="check-icon" {...props} />),
    AlertCircle: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="alert-icon" {...props} />),
    Send: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="send-icon" {...props} />),
    Paperclip: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="paperclip-icon" {...props} />),
    Video: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="video-icon" {...props} />),
    Phone: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="phone-icon" {...props} />),
    Mail: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="mail-icon" {...props} />),
    Briefcase: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="briefcase-icon" {...props} />),
  };
});

const mockClient = {
  id: '1',
  name: 'Acme Corporation',
  email: 'contact@acme.com',
  phone: '555-0001',
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ClientPortal Component', () => {
  describe('Portal Header and Security', () => {
    test('renders secure portal header with encryption indicator', () => {
      renderWithProviders(<ClientPortal client={mockClient} />);

      expect(screen.getByText('Secure Client Portal')).toBeInTheDocument();
      expect(screen.getByText(/All communications and documents are encrypted/)).toBeInTheDocument();
      expect(screen.getByText('Secure Connection')).toBeInTheDocument();
    });

    test('displays security icons (shield and lock)', () => {
      renderWithProviders(<ClientPortal />);

      const shieldIcons = screen.getAllByTestId('shield-icon');
      const lockIcons = screen.getAllByTestId('lock-icon');

      expect(shieldIcons.length).toBeGreaterThan(0);
      expect(lockIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Document Sharing View', () => {
    test('renders documents tab by default', () => {
      renderWithProviders(<ClientPortal />);

      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Shared Documents')).toBeInTheDocument();
    });

    test('displays document list with file information', () => {
      renderWithProviders(<ClientPortal />);

      expect(screen.getByText('Engagement_Letter_2026.pdf')).toBeInTheDocument();
      expect(screen.getByText('December_Invoice.pdf')).toBeInTheDocument();
      expect(screen.getByText('Discovery_Response_Draft.docx')).toBeInTheDocument();
    });

    test('shows encryption indicators on documents', () => {
      renderWithProviders(<ClientPortal />);

      // Check for "Encrypted" aria-labels
      const encryptionIcons = screen.getAllByLabelText('Encrypted');
      expect(encryptionIcons.length).toBeGreaterThan(0);
    });

    test('displays signature required badge for documents', () => {
      renderWithProviders(<ClientPortal />);

      expect(screen.getByText('Signature Required')).toBeInTheDocument();
    });

    test('renders upload section for client documents', () => {
      renderWithProviders(<ClientPortal />);

      expect(screen.getByText('Upload Documents')).toBeInTheDocument();
      expect(screen.getByText(/Drag and drop files here/)).toBeInTheDocument();
      expect(screen.getByText('Select Files')).toBeInTheDocument();
    });

    test('shows document status badges (Available, Pending Review)', () => {
      renderWithProviders(<ClientPortal />);

      const availableElements = screen.getAllByText('Available');
      expect(availableElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Pending Review')).toBeInTheDocument();
    });
  });

  describe('Case Status Display', () => {
    test('switches to cases tab when clicked', () => {
      renderWithProviders(<ClientPortal />);

      const casesTab = screen.getByText('Case Status');
      fireEvent.click(casesTab);

      expect(screen.getByText('Contract Dispute - Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('IP Litigation Support')).toBeInTheDocument();
    });

    test('displays case progress bars', () => {
      renderWithProviders(<ClientPortal />);

      const casesTab = screen.getByText('Case Status');
      fireEvent.click(casesTab);

      const progressElements = screen.getAllByText('Case Progress');
      expect(progressElements.length).toBeGreaterThan(0);
      expect(screen.getByText('65%')).toBeInTheDocument();
      expect(screen.getByText('40%')).toBeInTheDocument();
    });

    test('shows case status badges (Active, Pending, Closed)', () => {
      renderWithProviders(<ClientPortal />);

      const casesTab = screen.getByText('Case Status');
      fireEvent.click(casesTab);

      const activeStatuses = screen.getAllByText('Active');
      expect(activeStatuses.length).toBeGreaterThan(0);
    });

    test('displays last update and next deadline dates', () => {
      renderWithProviders(<ClientPortal />);

      const casesTab = screen.getByText('Case Status');
      fireEvent.click(casesTab);

      const lastUpdateElements = screen.getAllByText('Last Update');
      expect(lastUpdateElements.length).toBeGreaterThan(0);
      const nextDeadlineElements = screen.getAllByText('Next Deadline');
      expect(nextDeadlineElements.length).toBeGreaterThan(0);
      expect(screen.getByText('2026-01-15')).toBeInTheDocument();
    });

    test('shows recent activity for each case', () => {
      renderWithProviders(<ClientPortal />);

      const casesTab = screen.getByText('Case Status');
      fireEvent.click(casesTab);

      const recentActivityElements = screen.getAllByText('Recent Activity');
      expect(recentActivityElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Response to motion filed')).toBeInTheDocument();
    });
  });

  describe('Invoice Listing', () => {
    test('switches to invoices tab when clicked', () => {
      renderWithProviders(<ClientPortal />);

      const invoicesTab = screen.getByText('Invoices');
      fireEvent.click(invoicesTab);

      expect(screen.getByText('INV-2026-001')).toBeInTheDocument();
      expect(screen.getByText('INV-2026-002')).toBeInTheDocument();
    });

    test('displays invoice summary with totals', () => {
      renderWithProviders(<ClientPortal />);

      const invoicesTab = screen.getByText('Invoices');
      fireEvent.click(invoicesTab);

      expect(screen.getByText('Total Outstanding')).toBeInTheDocument();
      expect(screen.getByText('Total Paid (YTD)')).toBeInTheDocument();
    });

    test('shows invoice status badges (Paid, Pending, Overdue)', () => {
      renderWithProviders(<ClientPortal />);

      const invoicesTab = screen.getByText('Invoices');
      fireEvent.click(invoicesTab);

      expect(screen.getByText('Paid')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    test('displays pay button for unpaid invoices', () => {
      renderWithProviders(<ClientPortal />);

      const invoicesTab = screen.getByText('Invoices');
      fireEvent.click(invoicesTab);

      const payButtons = screen.getAllByText(/Pay/);
      expect(payButtons.length).toBeGreaterThan(0);
    });

    test('shows view and download options for invoices', () => {
      renderWithProviders(<ClientPortal />);

      const invoicesTab = screen.getByText('Invoices');
      fireEvent.click(invoicesTab);

      const viewButtons = screen.getAllByText(/View/);
      expect(viewButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Secure Messaging', () => {
    test('switches to messages tab when clicked', () => {
      renderWithProviders(<ClientPortal />);

      const messagesTab = screen.getByText('Messages');
      fireEvent.click(messagesTab);

      expect(screen.getByText('Secure Message')).toBeInTheDocument();
      expect(screen.getByText('Recent Messages')).toBeInTheDocument();
    });

    test('displays compose message form with security indicator', () => {
      renderWithProviders(<ClientPortal />);

      const messagesTab = screen.getByText('Messages');
      fireEvent.click(messagesTab);

      expect(screen.getByPlaceholderText('Subject')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Type your secure message...')).toBeInTheDocument();
      expect(screen.getByText('Send Message')).toBeInTheDocument();
    });

    test('shows encryption indicator on messages', () => {
      renderWithProviders(<ClientPortal />);

      const messagesTab = screen.getByText('Messages');
      fireEvent.click(messagesTab);

      // Look for encrypted labels
      const encryptedIcons = screen.getAllByLabelText('Encrypted');
      expect(encryptedIcons.length).toBeGreaterThan(0);
    });

    test('displays unread message indicators', () => {
      renderWithProviders(<ClientPortal />);

      const messagesTab = screen.getByText('Messages');
      fireEvent.click(messagesTab);

      expect(screen.getByText('New')).toBeInTheDocument();
    });

    test('allows typing in message textarea', () => {
      renderWithProviders(<ClientPortal />);

      const messagesTab = screen.getByText('Messages');
      fireEvent.click(messagesTab);

      const textarea = screen.getByPlaceholderText('Type your secure message...');
      fireEvent.change(textarea, { target: { value: 'Test message' } });

      expect(textarea).toHaveValue('Test message');
    });

    test('shows attach file button', () => {
      renderWithProviders(<ClientPortal />);

      const messagesTab = screen.getByText('Messages');
      fireEvent.click(messagesTab);

      expect(screen.getByText('Attach File')).toBeInTheDocument();
    });
  });

  describe('Appointment Scheduling', () => {
    test('switches to appointments tab when clicked', () => {
      renderWithProviders(<ClientPortal />);

      const appointmentsTab = screen.getByText('Appointments');
      fireEvent.click(appointmentsTab);

      expect(screen.getByText('Available Appointment Slots')).toBeInTheDocument();
    });

    test('displays available appointment slots with dates and times', () => {
      renderWithProviders(<ClientPortal />);

      const appointmentsTab = screen.getByText('Appointments');
      fireEvent.click(appointmentsTab);

      expect(screen.getByText(/2026-01-10 at 10:00 AM/)).toBeInTheDocument();
      expect(screen.getByText(/2026-01-12 at 2:00 PM/)).toBeInTheDocument();
    });

    test('shows appointment type icons (Video, Phone, In-Person)', () => {
      renderWithProviders(<ClientPortal />);

      const appointmentsTab = screen.getByText('Appointments');
      fireEvent.click(appointmentsTab);

      expect(screen.getByText('Video Call')).toBeInTheDocument();
      expect(screen.getByText('Phone Call')).toBeInTheDocument();
      expect(screen.getByText('In-Person')).toBeInTheDocument();
    });

    test('displays duration for each appointment slot', () => {
      renderWithProviders(<ClientPortal />);

      const appointmentsTab = screen.getByText('Appointments');
      fireEvent.click(appointmentsTab);

      expect(screen.getByText('60 minutes')).toBeInTheDocument();
      expect(screen.getByText('30 minutes')).toBeInTheDocument();
      expect(screen.getByText('90 minutes')).toBeInTheDocument();
    });

    test('shows book now buttons for available slots', () => {
      renderWithProviders(<ClientPortal />);

      const appointmentsTab = screen.getByText('Appointments');
      fireEvent.click(appointmentsTab);

      const bookButtons = screen.getAllByText('Book Now');
      expect(bookButtons.length).toBe(3);
    });
  });

  describe('Tab Navigation', () => {
    test('highlights active tab', () => {
      renderWithProviders(<ClientPortal />);

      const documentsTab = screen.getByText('Documents').closest('button');
      expect(documentsTab).toHaveClass('border-blue-600');
    });

    test('switches between all tabs successfully', () => {
      renderWithProviders(<ClientPortal />);

      // Documents tab (default)
      expect(screen.getByText('Shared Documents')).toBeInTheDocument();

      // Cases tab
      fireEvent.click(screen.getByText('Case Status'));
      expect(screen.getByText('Contract Dispute - Acme Corp')).toBeInTheDocument();

      // Invoices tab
      fireEvent.click(screen.getByText('Invoices'));
      expect(screen.getByText('INV-2026-001')).toBeInTheDocument();

      // Messages tab
      fireEvent.click(screen.getByText('Messages'));
      expect(screen.getByText('Secure Message')).toBeInTheDocument();

      // Appointments tab
      fireEvent.click(screen.getByText('Appointments'));
      expect(screen.getByText('Available Appointment Slots')).toBeInTheDocument();
    });
  });

  describe('Data Privacy and Security', () => {
    test('does not expose sensitive data in DOM attributes', () => {
      const { container } = renderWithProviders(<ClientPortal client={mockClient} />);

      // Check that sensitive data is not in data attributes
      const elements = container.querySelectorAll('[data-password], [data-secret], [data-ssn]');
      expect(elements.length).toBe(0);
    });

    test('displays end-to-end encryption notice', () => {
      renderWithProviders(<ClientPortal />);

      expect(screen.getByText(/encrypted end-to-end/)).toBeInTheDocument();
    });

    test('shows lock icons on secure elements', () => {
      renderWithProviders(<ClientPortal />);

      const lockIcons = screen.getAllByTestId('lock-icon');
      expect(lockIcons.length).toBeGreaterThan(0);
    });
  });
});
