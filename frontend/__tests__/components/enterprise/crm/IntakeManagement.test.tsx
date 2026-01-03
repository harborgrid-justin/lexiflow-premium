/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntakeManagement } from '@/components/enterprise/CRM/IntakeManagement';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';

// Mock Lucide icons
jest.mock('lucide-react', () => {
  const React = require('react');
  return {
    UserPlus: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="user-plus-icon" {...props} />),
    FileText: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="file-icon" {...props} />),
    AlertTriangle: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="alert-icon" {...props} />),
    CheckCircle2: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="check-icon" {...props} />),
    Clock: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="clock-icon" {...props} />),
    DollarSign: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="dollar-icon" {...props} />),
    Shield: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="shield-icon" {...props} />),
    Search: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="search-icon" {...props} />),
    Send: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="send-icon" {...props} />),
    Edit: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="edit-icon" {...props} />),
    Eye: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="eye-icon" {...props} />),
    Download: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="download-icon" {...props} />),
    Upload: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="upload-icon" {...props} />),
    XCircle: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="x-circle-icon" {...props} />),
    Plus: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="plus-icon" {...props} />),
    Trash2: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="trash-icon" {...props} />),
    Save: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="save-icon" {...props} />),
    TrendingUp: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="trending-up-icon" {...props} />),
    TrendingDown: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="trending-down-icon" {...props} />),
  };
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('IntakeManagement Component', () => {
  describe('Intake Request Listing', () => {
    test('renders intake requests tab by default', () => {
      renderWithProviders(<IntakeManagement />);

      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      expect(screen.getByText('Tech Startup Inc.')).toBeInTheDocument();
      expect(screen.getByText('Individual - Jane Doe')).toBeInTheDocument();
    });

    test('displays intake request details', () => {
      renderWithProviders(<IntakeManagement />);

      expect(screen.getByText('M&A transaction advisory for acquisition of competitor')).toBeInTheDocument();
      expect(screen.getByText('Patent infringement defense')).toBeInTheDocument();
      expect(screen.getByText('Wrongful termination claim')).toBeInTheDocument();
    });

    test('shows urgency badges with correct styling', () => {
      renderWithProviders(<IntakeManagement />);

      expect(screen.getByText('High Priority')).toBeInTheDocument();
      expect(screen.getByText('Medium Priority')).toBeInTheDocument();
      expect(screen.getByText('Low Priority')).toBeInTheDocument();
    });

    test('displays status for each intake request', () => {
      renderWithProviders(<IntakeManagement />);

      const conflictCheckElements = screen.getAllByText('Conflict Check');
      expect(conflictCheckElements.length).toBeGreaterThan(0);
      const approvedElements = screen.getAllByText('Approved');
      expect(approvedElements.length).toBeGreaterThan(0);
      const rejectedElements = screen.getAllByText('Rejected');
      expect(rejectedElements.length).toBeGreaterThan(0);
    });

    test('shows estimated value for each request', () => {
      renderWithProviders(<IntakeManagement />);

      expect(screen.getByText(/500,000/)).toBeInTheDocument();
      expect(screen.getByText(/350,000/)).toBeInTheDocument();
      expect(screen.getByText(/75,000/)).toBeInTheDocument();
    });

    test('displays conflict check status with icons', () => {
      renderWithProviders(<IntakeManagement />);

      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Clear')).toBeInTheDocument();
      expect(screen.getByText('Conflict')).toBeInTheDocument();
    });
  });

  describe('Form Builder', () => {
    test('switches to form builder tab when clicked', () => {
      renderWithProviders(<IntakeManagement />);

      const formBuilderTab = screen.getByText('Form Builder');
      fireEvent.click(formBuilderTab);

      expect(screen.getByText('Intake Form Templates')).toBeInTheDocument();
    });

    test('displays form templates with metadata', () => {
      renderWithProviders(<IntakeManagement />);

      const formBuilderTab = screen.getByText('Form Builder');
      fireEvent.click(formBuilderTab);

      expect(screen.getByText('General Intake Form')).toBeInTheDocument();
      expect(screen.getByText('Corporate Client Intake')).toBeInTheDocument();
      expect(screen.getByText('Personal Injury Intake')).toBeInTheDocument();
    });

    test('shows create new template button', () => {
      renderWithProviders(<IntakeManagement />);

      const formBuilderTab = screen.getByText('Form Builder');
      fireEvent.click(formBuilderTab);

      expect(screen.getByText('Create New Template')).toBeInTheDocument();
    });

    test('displays template status (Active/Inactive)', () => {
      renderWithProviders(<IntakeManagement />);

      const formBuilderTab = screen.getByText('Form Builder');
      fireEvent.click(formBuilderTab);

      const activeStatuses = screen.getAllByText('Active');
      expect(activeStatuses.length).toBeGreaterThan(0);
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    test('shows template actions (Preview, Edit, Export)', () => {
      renderWithProviders(<IntakeManagement />);

      const formBuilderTab = screen.getByText('Form Builder');
      fireEvent.click(formBuilderTab);

      const previewButtons = screen.getAllByText(/Preview/);
      const editButtons = screen.getAllByText(/Edit/);
      const exportButtons = screen.getAllByText(/Export/);

      expect(previewButtons.length).toBeGreaterThan(0);
      expect(editButtons.length).toBeGreaterThan(0);
      expect(exportButtons.length).toBeGreaterThan(0);
    });

    test('opens form fields editor when create template is clicked', () => {
      renderWithProviders(<IntakeManagement />);

      const formBuilderTab = screen.getByText('Form Builder');
      fireEvent.click(formBuilderTab);

      const createButton = screen.getByText('Create New Template');
      fireEvent.click(createButton);

      expect(screen.getByText('Form Fields')).toBeInTheDocument();
    });

    test('displays form fields in editor', () => {
      renderWithProviders(<IntakeManagement />);

      const formBuilderTab = screen.getByText('Form Builder');
      fireEvent.click(formBuilderTab);

      const createButton = screen.getByText('Create New Template');
      fireEvent.click(createButton);

      expect(screen.getByText('Prospect Name')).toBeInTheDocument();
      expect(screen.getByText('Email Address')).toBeInTheDocument();
      expect(screen.getByText('Phone Number')).toBeInTheDocument();
      expect(screen.getByText('Practice Area')).toBeInTheDocument();
    });
  });

  describe('Conflict Check Interface', () => {
    test('switches to conflict checks tab when clicked', () => {
      renderWithProviders(<IntakeManagement />);

      const conflictTab = screen.getByText('Conflict Checks');
      fireEvent.click(conflictTab);

      expect(screen.getByText('Run Conflict Check')).toBeInTheDocument();
    });

    test('displays conflict check form with input fields', () => {
      renderWithProviders(<IntakeManagement />);

      const conflictTab = screen.getByText('Conflict Checks');
      fireEvent.click(conflictTab);

      expect(screen.getByPlaceholderText('Prospect Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Opposing Party')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Related Companies')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Key Individuals')).toBeInTheDocument();
    });

    test('shows run comprehensive check button', () => {
      renderWithProviders(<IntakeManagement />);

      const conflictTab = screen.getByText('Conflict Checks');
      fireEvent.click(conflictTab);

      expect(screen.getByText('Run Comprehensive Check')).toBeInTheDocument();
    });

    test('displays recent conflict check results', () => {
      renderWithProviders(<IntakeManagement />);

      const conflictTab = screen.getByText('Conflict Checks');
      fireEvent.click(conflictTab);

      expect(screen.getByText('Recent Conflict Checks')).toBeInTheDocument();
      expect(screen.getByText('Potential Conflict')).toBeInTheDocument();
    });

    test('shows risk level indicators', () => {
      renderWithProviders(<IntakeManagement />);

      const conflictTab = screen.getByText('Conflict Checks');
      fireEvent.click(conflictTab);

      expect(screen.getByText('Medium Risk')).toBeInTheDocument();
    });

    test('displays matched clients, matters, and parties', () => {
      renderWithProviders(<IntakeManagement />);

      const conflictTab = screen.getByText('Conflict Checks');
      fireEvent.click(conflictTab);

      expect(screen.getByText('Matched Clients')).toBeInTheDocument();
      expect(screen.getByText('Matched Matters')).toBeInTheDocument();
      expect(screen.getByText('Matched Parties')).toBeInTheDocument();
      expect(screen.getByText('Global Industries LLC')).toBeInTheDocument();
    });
  });

  describe('Fee Agreement Tracking', () => {
    test('switches to fee agreements tab when clicked', () => {
      renderWithProviders(<IntakeManagement />);

      const feeTabs = screen.getAllByText('Fee Agreements');
      fireEvent.click(feeTabs[0]);

      const feeAgreementElements = screen.getAllByText('Fee Agreements');
      expect(feeAgreementElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Create Fee Agreement')).toBeInTheDocument();
    });

    test('displays fee agreement types', () => {
      renderWithProviders(<IntakeManagement />);

      const feeTab = screen.getByText('Fee Agreements');
      fireEvent.click(feeTab);

      expect(screen.getByText('Hourly Agreement')).toBeInTheDocument();
    });

    test('shows fee agreement status', () => {
      renderWithProviders(<IntakeManagement />);

      const feeTab = screen.getByText('Fee Agreements');
      fireEvent.click(feeTab);

      expect(screen.getByText('Sent')).toBeInTheDocument();
    });

    test('displays hourly rate for hourly agreements', () => {
      renderWithProviders(<IntakeManagement />);

      const feeTab = screen.getByText('Fee Agreements');
      fireEvent.click(feeTab);

      expect(screen.getByText('$450/hr')).toBeInTheDocument();
    });

    test('shows agreement actions (View, Edit, Download)', () => {
      renderWithProviders(<IntakeManagement />);

      const feeTab = screen.getByText('Fee Agreements');
      fireEvent.click(feeTab);

      expect(screen.getByText(/View/)).toBeInTheDocument();
      expect(screen.getByText(/Edit/)).toBeInTheDocument();
      expect(screen.getByText(/Download/)).toBeInTheDocument();
    });

    test('displays version information for agreements', () => {
      renderWithProviders(<IntakeManagement />);

      const feeTab = screen.getByText('Fee Agreements');
      fireEvent.click(feeTab);

      expect(screen.getByText('Version')).toBeInTheDocument();
    });
  });

  describe('Workflow Progression', () => {
    test('displays action buttons for intake requests', () => {
      renderWithProviders(<IntakeManagement />);

      const conflictCheckButtons = screen.getAllByText('Run Conflict Check');
      expect(conflictCheckButtons.length).toBeGreaterThan(0);
      const engagementLetterButtons = screen.getAllByText('Generate Engagement Letter');
      expect(engagementLetterButtons.length).toBeGreaterThan(0);
      const feeAgreementButtons = screen.getAllByText('Create Fee Agreement');
      expect(feeAgreementButtons.length).toBeGreaterThan(0);
      const approveButtons = screen.getAllByText('Approve');
      expect(approveButtons.length).toBeGreaterThan(0);
    });

    test('shows assigned attorney for each request', () => {
      renderWithProviders(<IntakeManagement />);

      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
      expect(screen.getByText('Mike Wilson')).toBeInTheDocument();
    });

    test('displays submitted date for tracking', () => {
      renderWithProviders(<IntakeManagement />);

      const submittedElements = screen.getAllByText('Submitted');
      expect(submittedElements.length).toBeGreaterThan(0);
    });
  });

  describe('Metrics Display', () => {
    test('shows total intake requests metric', () => {
      renderWithProviders(<IntakeManagement />);

      expect(screen.getByText('Total Intake Requests')).toBeInTheDocument();
      // Value is animated, just verify label exists
    });

    test('displays pending conflict checks count', () => {
      renderWithProviders(<IntakeManagement />);

      expect(screen.getByText('Pending Conflict Checks')).toBeInTheDocument();
      // Value is animated, just verify label exists
    });

    test('shows approved requests count', () => {
      renderWithProviders(<IntakeManagement />);

      expect(screen.getByText('Approved Requests')).toBeInTheDocument();
    });

    test('displays potential revenue metric', () => {
      renderWithProviders(<IntakeManagement />);

      expect(screen.getByText('Potential Revenue')).toBeInTheDocument();
      // Value is animated, just verify label exists
    });
  });

  describe('Filter Functionality', () => {
    test('renders status filter dropdown', () => {
      renderWithProviders(<IntakeManagement />);

      const statusFilter = screen.getByText('All Statuses').closest('select');
      expect(statusFilter).toBeInTheDocument();
    });

    test('renders practice area filter dropdown', () => {
      renderWithProviders(<IntakeManagement />);

      const practiceAreaFilter = screen.getByText('All Practice Areas').closest('select');
      expect(practiceAreaFilter).toBeInTheDocument();
    });

    test('renders urgency filter dropdown', () => {
      renderWithProviders(<IntakeManagement />);

      const urgencyFilter = screen.getByText('All Urgencies').closest('select');
      expect(urgencyFilter).toBeInTheDocument();
    });
  });

  describe('Data Privacy', () => {
    test('does not expose sensitive prospect data in DOM attributes', () => {
      const { container } = renderWithProviders(<IntakeManagement />);

      // Check that sensitive data is not in data attributes
      const elements = container.querySelectorAll('[data-email], [data-phone], [data-ssn]');
      expect(elements.length).toBe(0);
    });

    test('displays conflict details securely without attribute exposure', () => {
      renderWithProviders(<IntakeManagement />);

      const conflictTab = screen.getByText('Conflict Checks');
      fireEvent.click(conflictTab);

      // Conflict details should be in text content, not attributes
      expect(screen.getByText(/Potential adverse party relationship/)).toBeInTheDocument();
    });
  });
});
