/// <reference types="cypress" />

/**
 * E2E Test Suite: Billing Workflow
 *
 * Tests billing and time tracking features including:
 * - Time entry creation (manual and timer-based)
 * - Invoice generation and editing
 * - Payment recording
 * - Billing reports and analytics
 * - Expense tracking
 */

describe('Billing Workflow', () => {
  beforeEach(() => {
    cy.login('attorney@firm.com', 'password123');
    cy.setupTestUser('attorney');
  });

  afterEach(() => {
    cy.logout();
  });

  describe('Time Entry Creation', () => {
    beforeEach(() => {
      // Mock time entries API
      cy.intercept('GET', '/api/time-entries*', {
        statusCode: 200,
        body: []
      }).as('getTimeEntries');

      // Mock create time entry API
      cy.intercept('POST', '/api/time-entries', (req) => {
        req.reply({
          statusCode: 201,
          body: {
            id: `time-entry-${Date.now()}`,
            ...req.body,
            createdAt: new Date().toISOString(),
            createdBy: 'Jane Doe'
          }
        });
      }).as('createTimeEntry');

      cy.visit('/#/billing/time-entries');
    });

    it('should create manual time entry successfully', () => {
      // Click add time entry button
      cy.get('[data-testid="add-time-entry-button"]')
        .click();

      // Verify time entry modal
      cy.get('[data-testid="time-entry-modal"]')
        .should('be.visible')
        .within(() => {
          // Select case
          cy.get('[data-testid="time-entry-case-select"]')
            .select('Smith v. Johnson Industries');

          // Enter date
          cy.get('[data-testid="time-entry-date-input"]')
            .type('2024-12-20');

          // Enter duration
          cy.get('[data-testid="time-entry-hours-input"]')
            .type('2.5');

          // Select activity type
          cy.get('[data-testid="time-entry-activity-select"]')
            .select('Legal Research');

          // Enter description
          cy.get('[data-testid="time-entry-description-textarea"]')
            .type('Researched case law on workplace safety regulations and employer liability standards');

          // Set billable rate
          cy.get('[data-testid="time-entry-rate-input"]')
            .should('have.value', '450'); // Default attorney rate

          // Verify total calculation
          cy.get('[data-testid="time-entry-total"]')
            .should('contain', '$1,125.00'); // 2.5 hours * $450

          // Save time entry
          cy.get('[data-testid="save-time-entry-button"]')
            .click();
        });

      // Verify API call
      cy.wait('@createTimeEntry').then((interception) => {
        expect(interception.request.body).to.include({
          hours: 2.5,
          activityType: 'Legal Research',
          rate: 450
        });
      });

      // Verify success notification
      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Time entry created successfully');

      // Verify entry appears in list
      cy.get('[data-testid="time-entry-list"]')
        .should('contain', 'Legal Research')
        .and('contain', '2.5 hours')
        .and('contain', '$1,125.00');
    });

    it('should use running timer for time tracking', () => {
      // Mock timer API
      cy.intercept('POST', '/api/time-entries/timer/start', {
        statusCode: 200,
        body: {
          id: 'timer-001',
          startTime: new Date().toISOString(),
          caseId: 'case-001'
        }
      }).as('startTimer');

      cy.intercept('POST', '/api/time-entries/timer/stop', {
        statusCode: 200,
        body: {
          id: 'time-entry-new',
          duration: 0.25,
          total: 112.50
        }
      }).as('stopTimer');

      // Start timer
      cy.get('[data-testid="start-timer-button"]')
        .click();

      // Fill timer details
      cy.get('[data-testid="timer-case-select"]')
        .select('Smith v. Johnson Industries');

      cy.get('[data-testid="timer-activity-select"]')
        .select('Client Communication');

      cy.get('[data-testid="timer-description-input"]')
        .type('Phone call with client');

      cy.get('[data-testid="confirm-start-timer"]')
        .click();

      cy.wait('@startTimer');

      // Verify timer is running
      cy.get('[data-testid="running-timer"]')
        .should('be.visible')
        .and('contain', 'Timer Running');

      // Wait a moment (simulate work)
      cy.wait(2000);

      // Stop timer
      cy.get('[data-testid="stop-timer-button"]')
        .click();

      cy.wait('@stopTimer');

      // Verify time entry created
      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Time entry saved');
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="add-time-entry-button"]').click();

      // Try to save without required fields
      cy.get('[data-testid="save-time-entry-button"]')
        .should('be.disabled');

      // Fill only case
      cy.get('[data-testid="time-entry-case-select"]')
        .select('Smith v. Johnson Industries');

      // Still disabled
      cy.get('[data-testid="save-time-entry-button"]')
        .should('be.disabled');

      // Add duration
      cy.get('[data-testid="time-entry-hours-input"]')
        .type('1.0');

      // Still disabled (need description)
      cy.get('[data-testid="save-time-entry-button"]')
        .should('be.disabled');

      // Add description
      cy.get('[data-testid="time-entry-description-textarea"]')
        .type('Test work');

      // Now enabled
      cy.get('[data-testid="save-time-entry-button"]')
        .should('be.enabled');
    });

    it('should mark time entry as non-billable', () => {
      cy.get('[data-testid="add-time-entry-button"]').click();

      cy.get('[data-testid="time-entry-case-select"]')
        .select('Smith v. Johnson Industries');

      cy.get('[data-testid="time-entry-hours-input"]')
        .type('1.0');

      cy.get('[data-testid="time-entry-description-textarea"]')
        .type('Internal case review meeting');

      // Toggle non-billable
      cy.get('[data-testid="time-entry-billable-toggle"]')
        .click();

      // Verify rate set to 0
      cy.get('[data-testid="time-entry-total"]')
        .should('contain', '$0.00');

      // Verify non-billable badge
      cy.get('[data-testid="non-billable-badge"]')
        .should('be.visible');

      cy.get('[data-testid="save-time-entry-button"]').click();
      cy.wait('@createTimeEntry');

      // Verify entry marked as non-billable
      cy.get('[data-testid="time-entry-list"]')
        .should('contain', 'Non-billable');
    });

    it('should edit existing time entry', () => {
      // Mock get time entry API
      cy.intercept('GET', '/api/time-entries/time-entry-001', {
        statusCode: 200,
        body: {
          id: 'time-entry-001',
          caseId: 'case-001',
          caseName: 'Smith v. Johnson Industries',
          date: '2024-12-15',
          hours: 3.0,
          activityType: 'Legal Research',
          description: 'Original description',
          rate: 450,
          total: 1350
        }
      }).as('getTimeEntry');

      // Mock update API
      cy.intercept('PATCH', '/api/time-entries/time-entry-001', {
        statusCode: 200,
        body: { success: true }
      }).as('updateTimeEntry');

      // Reload page with existing entries
      cy.intercept('GET', '/api/time-entries*', {
        statusCode: 200,
        body: [
          {
            id: 'time-entry-001',
            caseName: 'Smith v. Johnson Industries',
            hours: 3.0,
            description: 'Original description'
          }
        ]
      }).as('getTimeEntries');

      cy.reload();
      cy.wait('@getTimeEntries');

      // Click edit on time entry
      cy.get('[data-testid="time-entry-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="edit-time-entry-button"]')
            .click();
        });

      cy.wait('@getTimeEntry');

      // Modify time entry
      cy.get('[data-testid="time-entry-hours-input"]')
        .clear()
        .type('3.5');

      cy.get('[data-testid="time-entry-description-textarea"]')
        .clear()
        .type('Updated: Comprehensive legal research on liability issues');

      cy.get('[data-testid="save-time-entry-button"]').click();

      cy.wait('@updateTimeEntry');

      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Time entry updated');
    });

    it('should delete time entry', () => {
      // Mock delete API
      cy.intercept('DELETE', '/api/time-entries/time-entry-001', {
        statusCode: 200,
        body: { success: true }
      }).as('deleteTimeEntry');

      cy.intercept('GET', '/api/time-entries*', {
        statusCode: 200,
        body: [
          {
            id: 'time-entry-001',
            caseName: 'Smith v. Johnson Industries',
            hours: 3.0
          }
        ]
      }).as('getTimeEntries');

      cy.reload();
      cy.wait('@getTimeEntries');

      cy.get('[data-testid="time-entry-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="delete-time-entry-button"]')
            .click();
        });

      // Confirm deletion
      cy.get('[data-testid="confirm-delete-dialog"]')
        .within(() => {
          cy.get('[data-testid="confirm-button"]').click();
        });

      cy.wait('@deleteTimeEntry');

      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Time entry deleted');
    });
  });

  describe('Invoice Generation', () => {
    beforeEach(() => {
      // Mock invoices API
      cy.intercept('GET', '/api/invoices*', {
        statusCode: 200,
        body: []
      }).as('getInvoices');

      // Mock unbilled time entries
      cy.intercept('GET', '/api/time-entries/unbilled*', {
        statusCode: 200,
        body: [
          {
            id: 'time-001',
            date: '2024-12-15',
            hours: 2.5,
            description: 'Legal research',
            rate: 450,
            total: 1125
          },
          {
            id: 'time-002',
            date: '2024-12-16',
            hours: 1.0,
            description: 'Client meeting',
            rate: 450,
            total: 450
          }
        ]
      }).as('getUnbilledTime');

      cy.visit('/#/billing/invoices');
    });

    it('should generate invoice from unbilled time entries', () => {
      // Mock create invoice API
      cy.intercept('POST', '/api/invoices', (req) => {
        req.reply({
          statusCode: 201,
          body: {
            id: `invoice-${Date.now()}`,
            invoiceNumber: 'INV-2024-001',
            ...req.body,
            createdAt: new Date().toISOString()
          }
        });
      }).as('createInvoice');

      // Click create invoice button
      cy.get('[data-testid="create-invoice-button"]')
        .click();

      // Verify invoice creation modal
      cy.get('[data-testid="create-invoice-modal"]')
        .should('be.visible')
        .within(() => {
          // Select client/case
          cy.get('[data-testid="invoice-case-select"]')
            .select('Smith v. Johnson Industries');
        });

      // Wait for unbilled entries to load
      cy.wait('@getUnbilledTime');

      // Verify unbilled entries displayed
      cy.get('[data-testid="unbilled-entries-list"]')
        .within(() => {
          cy.get('[data-testid="unbilled-entry"]')
            .should('have.length', 2);

          // Select all entries
          cy.get('[data-testid="select-all-entries"]')
            .check();
        });

      // Verify total calculation
      cy.get('[data-testid="invoice-subtotal"]')
        .should('contain', '$1,575.00');

      // Set invoice details
      cy.get('[data-testid="invoice-due-date-input"]')
        .type('2025-01-15');

      cy.get('[data-testid="invoice-notes-textarea"]')
        .type('Payment due within 30 days. Thank you for your business.');

      // Generate invoice
      cy.get('[data-testid="generate-invoice-button"]')
        .click();

      cy.wait('@createInvoice');

      // Verify success
      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Invoice generated successfully');

      // Verify invoice appears in list
      cy.get('[data-testid="invoice-list"]')
        .should('contain', 'INV-2024-001')
        .and('contain', '$1,575.00');
    });

    it('should preview invoice before generation', () => {
      cy.get('[data-testid="create-invoice-button"]').click();

      cy.get('[data-testid="invoice-case-select"]')
        .select('Smith v. Johnson Industries');

      cy.wait('@getUnbilledTime');

      cy.get('[data-testid="select-all-entries"]').check();

      // Click preview button
      cy.get('[data-testid="preview-invoice-button"]')
        .click();

      // Verify preview modal
      cy.get('[data-testid="invoice-preview-modal"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="invoice-header"]')
            .should('contain', 'INVOICE');

          cy.get('[data-testid="invoice-client-info"]')
            .should('contain', 'John Smith');

          cy.get('[data-testid="invoice-line-items"]')
            .should('be.visible');

          cy.get('[data-testid="invoice-total"]')
            .should('contain', '$1,575.00');
        });
    });

    it('should add expenses to invoice', () => {
      // Mock expenses API
      cy.intercept('GET', '/api/expenses/unbilled*', {
        statusCode: 200,
        body: [
          {
            id: 'expense-001',
            date: '2024-12-18',
            description: 'Court filing fees',
            amount: 435.00
          },
          {
            id: 'expense-002',
            date: '2024-12-19',
            description: 'Deposition transcript',
            amount: 275.00
          }
        ]
      }).as('getUnbilledExpenses');

      cy.get('[data-testid="create-invoice-button"]').click();
      cy.get('[data-testid="invoice-case-select"]')
        .select('Smith v. Johnson Industries');

      cy.wait('@getUnbilledTime');

      // Switch to expenses tab
      cy.get('[data-testid="invoice-expenses-tab"]')
        .click();

      cy.wait('@getUnbilledExpenses');

      // Select expenses
      cy.get('[data-testid="unbilled-expense"]')
        .first()
        .within(() => {
          cy.get('[data-testid="expense-checkbox"]').check();
        });

      // Verify total updated
      cy.get('[data-testid="invoice-expenses-total"]')
        .should('contain', '$435.00');

      // Go back to summary
      cy.get('[data-testid="invoice-summary-tab"]')
        .click();

      // Verify grand total includes expenses
      cy.get('[data-testid="invoice-grand-total"]')
        .should('contain', '$2,010.00'); // 1575 + 435
    });

    it('should apply discount to invoice', () => {
      cy.intercept('POST', '/api/invoices', {
        statusCode: 201,
        body: {
          id: 'invoice-001',
          invoiceNumber: 'INV-2024-001'
        }
      }).as('createInvoice');

      cy.get('[data-testid="create-invoice-button"]').click();
      cy.get('[data-testid="invoice-case-select"]')
        .select('Smith v. Johnson Industries');

      cy.wait('@getUnbilledTime');
      cy.get('[data-testid="select-all-entries"]').check();

      // Add discount
      cy.get('[data-testid="add-discount-button"]')
        .click();

      cy.get('[data-testid="discount-type-select"]')
        .select('Percentage');

      cy.get('[data-testid="discount-value-input"]')
        .type('10');

      cy.get('[data-testid="discount-reason-input"]')
        .type('Valued client discount');

      // Verify discount applied
      cy.get('[data-testid="invoice-discount"]')
        .should('contain', '-$157.50'); // 10% of 1575

      cy.get('[data-testid="invoice-total-after-discount"]')
        .should('contain', '$1,417.50');

      cy.get('[data-testid="generate-invoice-button"]').click();
      cy.wait('@createInvoice');
    });
  });

  describe('Payment Recording', () => {
    beforeEach(() => {
      // Mock invoices with outstanding balance
      cy.intercept('GET', '/api/invoices*', {
        statusCode: 200,
        body: [
          {
            id: 'invoice-001',
            invoiceNumber: 'INV-2024-001',
            clientName: 'John Smith',
            total: 1575.00,
            paid: 0,
            balance: 1575.00,
            status: 'Sent',
            dueDate: '2025-01-15'
          }
        ]
      }).as('getInvoices');

      cy.visit('/#/billing/invoices');
      cy.wait('@getInvoices');
    });

    it('should record full payment', () => {
      // Mock payment API
      cy.intercept('POST', '/api/invoices/invoice-001/payments', (req) => {
        req.reply({
          statusCode: 201,
          body: {
            id: `payment-${Date.now()}`,
            ...req.body,
            createdAt: new Date().toISOString()
          }
        });
      }).as('recordPayment');

      // Click record payment on invoice
      cy.get('[data-testid="invoice-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="record-payment-button"]')
            .click();
        });

      // Verify payment modal
      cy.get('[data-testid="payment-modal"]')
        .should('be.visible')
        .within(() => {
          // Verify invoice details
          cy.get('[data-testid="payment-invoice-number"]')
            .should('contain', 'INV-2024-001');

          cy.get('[data-testid="payment-balance-due"]')
            .should('contain', '$1,575.00');

          // Enter payment amount (full payment by default)
          cy.get('[data-testid="payment-amount-input"]')
            .should('have.value', '1575.00');

          // Select payment method
          cy.get('[data-testid="payment-method-select"]')
            .select('Check');

          // Enter check number
          cy.get('[data-testid="payment-reference-input"]')
            .type('1234');

          // Enter payment date
          cy.get('[data-testid="payment-date-input"]')
            .type('2024-12-20');

          // Add notes
          cy.get('[data-testid="payment-notes-textarea"]')
            .type('Check #1234 received from client');

          // Submit payment
          cy.get('[data-testid="submit-payment-button"]')
            .click();
        });

      cy.wait('@recordPayment');

      // Verify success
      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Payment recorded successfully');

      // Verify invoice status updated
      cy.get('[data-testid="invoice-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="invoice-status-badge"]')
            .should('contain', 'Paid');

          cy.get('[data-testid="invoice-balance"]')
            .should('contain', '$0.00');
        });
    });

    it('should record partial payment', () => {
      cy.intercept('POST', '/api/invoices/invoice-001/payments', {
        statusCode: 201,
        body: {
          id: 'payment-001',
          amount: 500
        }
      }).as('recordPayment');

      cy.get('[data-testid="invoice-item"]')
        .first()
        .find('[data-testid="record-payment-button"]')
        .click();

      // Enter partial amount
      cy.get('[data-testid="payment-amount-input"]')
        .clear()
        .type('500.00');

      cy.get('[data-testid="payment-method-select"]')
        .select('Credit Card');

      cy.get('[data-testid="payment-date-input"]')
        .type('2024-12-20');

      cy.get('[data-testid="submit-payment-button"]').click();

      cy.wait('@recordPayment');

      // Verify status shows partial payment
      cy.get('[data-testid="invoice-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="invoice-status-badge"]')
            .should('contain', 'Partial');

          cy.get('[data-testid="invoice-balance"]')
            .should('contain', '$1,075.00');
        });
    });

    it('should view payment history', () => {
      // Mock payment history API
      cy.intercept('GET', '/api/invoices/invoice-001/payments', {
        statusCode: 200,
        body: [
          {
            id: 'payment-001',
            amount: 500,
            method: 'Credit Card',
            date: '2024-12-20',
            reference: 'CC-xxxx-1234',
            recordedBy: 'Jane Doe'
          },
          {
            id: 'payment-002',
            amount: 300,
            method: 'Check',
            date: '2024-12-25',
            reference: 'Check #5678',
            recordedBy: 'Jane Doe'
          }
        ]
      }).as('getPayments');

      cy.get('[data-testid="invoice-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="view-payments-button"]')
            .click();
        });

      cy.wait('@getPayments');

      // Verify payment history modal
      cy.get('[data-testid="payment-history-modal"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="payment-record"]')
            .should('have.length', 2);

          // Verify first payment
          cy.get('[data-testid="payment-record"]')
            .first()
            .should('contain', '$500.00')
            .and('contain', 'Credit Card')
            .and('contain', '12/20/2024');
        });
    });
  });

  describe('Billing Reports', () => {
    beforeEach(() => {
      cy.visit('/#/billing/reports');

      // Mock reports data
      cy.intercept('GET', '/api/billing/reports/summary*', {
        statusCode: 200,
        body: {
          totalBilled: 125000,
          totalPaid: 98000,
          outstanding: 27000,
          averageCollectionTime: 28,
          billableHours: 278.5,
          realization: 92.5
        }
      }).as('getReportSummary');
    });

    it('should display billing summary report', () => {
      cy.wait('@getReportSummary');

      // Verify summary metrics
      cy.get('[data-testid="total-billed-metric"]')
        .should('contain', '$125,000');

      cy.get('[data-testid="total-paid-metric"]')
        .should('contain', '$98,000');

      cy.get('[data-testid="outstanding-metric"]')
        .should('contain', '$27,000');

      cy.get('[data-testid="billable-hours-metric"]')
        .should('contain', '278.5');

      cy.get('[data-testid="realization-rate-metric"]')
        .should('contain', '92.5%');
    });

    it('should filter reports by date range', () => {
      cy.intercept('GET', '/api/billing/reports/summary*dateFrom=2024-01-01*', {
        statusCode: 200,
        body: {
          totalBilled: 45000,
          totalPaid: 40000,
          outstanding: 5000
        }
      }).as('getFilteredReport');

      // Set date range
      cy.get('[data-testid="report-date-from"]')
        .type('2024-01-01');

      cy.get('[data-testid="report-date-to"]')
        .type('2024-03-31');

      cy.get('[data-testid="apply-date-filter"]')
        .click();

      cy.wait('@getFilteredReport');

      // Verify filtered results
      cy.get('[data-testid="total-billed-metric"]')
        .should('contain', '$45,000');
    });

    it('should view time entries by attorney', () => {
      // Mock attorney breakdown
      cy.intercept('GET', '/api/billing/reports/by-attorney*', {
        statusCode: 200,
        body: [
          {
            attorney: 'Jane Doe',
            hours: 125.5,
            billed: 56475,
            collected: 52000
          },
          {
            attorney: 'Robert Chen',
            hours: 98.0,
            billed: 44100,
            collected: 38500
          }
        ]
      }).as('getAttorneyReport');

      cy.get('[data-testid="report-type-select"]')
        .select('By Attorney');

      cy.wait('@getAttorneyReport');

      // Verify attorney breakdown table
      cy.get('[data-testid="attorney-report-table"]')
        .should('be.visible')
        .within(() => {
          cy.get('tbody tr').should('have.length', 2);

          cy.contains('tr', 'Jane Doe')
            .should('contain', '125.5')
            .and('contain', '$56,475')
            .and('contain', '$52,000');
        });
    });

    it('should export billing report to PDF', () => {
      cy.wait('@getReportSummary');

      // Click export button
      cy.get('[data-testid="export-report-button"]')
        .click();

      // Select PDF format
      cy.get('[data-testid="export-format-select"]')
        .select('PDF');

      cy.get('[data-testid="confirm-export-button"]')
        .click();

      // Verify export initiated
      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Report export started');
    });

    it('should display aging report for outstanding invoices', () => {
      // Mock aging report
      cy.intercept('GET', '/api/billing/reports/aging*', {
        statusCode: 200,
        body: {
          current: 8500,
          days30: 12000,
          days60: 4500,
          days90: 2000,
          over90: 0
        }
      }).as('getAgingReport');

      cy.get('[data-testid="report-type-select"]')
        .select('Aging Report');

      cy.wait('@getAgingReport');

      // Verify aging buckets
      cy.get('[data-testid="aging-current"]')
        .should('contain', '$8,500');

      cy.get('[data-testid="aging-30-days"]')
        .should('contain', '$12,000');

      cy.get('[data-testid="aging-60-days"]')
        .should('contain', '$4,500');

      cy.get('[data-testid="aging-90-days"]')
        .should('contain', '$2,000');
    });
  });

  describe('Expense Tracking', () => {
    beforeEach(() => {
      cy.visit('/#/billing/expenses');

      // Mock expenses API
      cy.intercept('GET', '/api/expenses*', {
        statusCode: 200,
        body: []
      }).as('getExpenses');
    });

    it('should add new expense', () => {
      // Mock create expense API
      cy.intercept('POST', '/api/expenses', (req) => {
        req.reply({
          statusCode: 201,
          body: {
            id: `expense-${Date.now()}`,
            ...req.body,
            createdAt: new Date().toISOString()
          }
        });
      }).as('createExpense');

      cy.get('[data-testid="add-expense-button"]')
        .click();

      cy.get('[data-testid="expense-modal"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="expense-case-select"]')
            .select('Smith v. Johnson Industries');

          cy.get('[data-testid="expense-date-input"]')
            .type('2024-12-20');

          cy.get('[data-testid="expense-category-select"]')
            .select('Filing Fees');

          cy.get('[data-testid="expense-amount-input"]')
            .type('435.00');

          cy.get('[data-testid="expense-description-textarea"]')
            .type('Court filing fee for complaint');

          cy.get('[data-testid="expense-billable-toggle"]')
            .should('be.checked'); // Billable by default

          cy.get('[data-testid="save-expense-button"]')
            .click();
        });

      cy.wait('@createExpense');

      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Expense added successfully');
    });

    it('should attach receipt to expense', () => {
      cy.intercept('POST', '/api/expenses', {
        statusCode: 201,
        body: { id: 'expense-001' }
      }).as('createExpense');

      cy.intercept('POST', '/api/expenses/expense-001/receipt', {
        statusCode: 200,
        body: { success: true }
      }).as('uploadReceipt');

      cy.get('[data-testid="add-expense-button"]').click();

      // Fill expense details
      cy.get('[data-testid="expense-case-select"]')
        .select('Smith v. Johnson Industries');

      cy.get('[data-testid="expense-amount-input"]')
        .type('125.00');

      cy.get('[data-testid="expense-description-textarea"]')
        .type('Parking fees');

      // Attach receipt
      cy.get('[data-testid="expense-receipt-input"]')
        .selectFile('cypress/fixtures/receipt.pdf', { force: true });

      cy.get('[data-testid="receipt-preview"]')
        .should('contain', 'receipt.pdf');

      cy.get('[data-testid="save-expense-button"]').click();

      cy.wait('@createExpense');
      cy.wait('@uploadReceipt');

      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Expense added with receipt');
    });
  });
});
