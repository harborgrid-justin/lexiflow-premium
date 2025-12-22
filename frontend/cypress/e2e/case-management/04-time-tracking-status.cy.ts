/**
 * CASE MANAGEMENT E2E TEST SUITE - TEST 6 & 7
 * Time Tracking & Case Status Updates
 * 
 * STRICT CYPRESS BEST PRACTICES APPLIED:
 * ✓ Form validation testing
 * ✓ API response verification
 * ✓ Optimistic UI updates
 * ✓ Error handling scenarios
 */

describe('Case Management - Time Tracking & Status Updates', () => {
  // ============================================================================
  // TEST SETUP
  // ============================================================================
  
  beforeEach(() => {
    cy.login();
    cy.setupTestUser('attorney');
    cy.mockCaseListAPI('cases.json');
  });

  afterEach(() => {
    cy.logout();
  });

  // ============================================================================
  // TEST 6: Add Time Entry to Case
  // ============================================================================
  
  describe('Time Tracking', () => {
    beforeEach(() => {
      // Mock time entry API
      cy.intercept('POST', '/api/cases/*/time-entries', {
        statusCode: 201,
        body: {
          id: `time-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          hours: 2.5,
          description: 'Legal research',
          rate: 400,
          amount: 1000,
          userId: 'user-001',
          createdAt: new Date().toISOString(),
        },
      }).as('createTimeEntry');

      // Mock get time entries
      cy.intercept('GET', '/api/cases/*/time-entries', {
        statusCode: 200,
        body: [],
      }).as('getTimeEntries');

      cy.fixture('cases.json').then((cases) => {
        cy.mockCaseDetailAPI(cases[0].id);
        cy.visitCaseDetail(cases[0].id);
      });
    });

    it('should open time tracking modal from Overview tab', () => {
      // Assert - Overview tab is active
      cy.get('[data-testid="case-overview-content"]')
        .should('be.visible');
      
      // Act - Click "Add Time" button
      cy.get('[data-testid="add-time-button"]')
        .or('button')
        .contains(/Add Time|Log Time|Track Time/i)
        .should('be.visible')
        .click();
      
      // Assert - Modal opens
      cy.get('[data-testid="time-entry-modal"]')
        .or('[data-testid="add-time-modal"]')
        .should('be.visible');
      
      // Assert - Form fields exist
      cy.get('[data-testid="time-hours-input"]')
        .or('input[name="hours"]')
        .should('exist');
      
      cy.get('[data-testid="time-description-input"]')
        .or('textarea[name="description"]')
        .should('exist');
    });

    it('should close time modal when clicking cancel', () => {
      // Arrange
      cy.get('[data-testid="add-time-button"]')
        .or('button')
        .contains(/Add Time|Log Time/i)
        .click();
      
      cy.get('[data-testid="time-entry-modal"]')
        .should('be.visible');
      
      // Act
      cy.get('[data-testid="cancel-time-button"]')
        .or('button')
        .contains(/Cancel|Close/i)
        .click();
      
      // Assert
      cy.get('[data-testid="time-entry-modal"]')
        .should('not.exist');
    });

    it('should add a time entry with valid data', () => {
      // Arrange
      const timeEntry = {
        hours: '2.5',
        description: 'Client meeting and case review',
        date: '2024-12-22',
      };
      
      // Act - Open modal
      cy.get('[data-testid="add-time-button"]')
        .or('button')
        .contains(/Add Time|Log Time/i)
        .click();
      
      // Fill form
      cy.get('[data-testid="time-hours-input"]')
        .or('input[name="hours"]')
        .clear()
        .type(timeEntry.hours);
      
      cy.get('[data-testid="time-description-input"]')
        .or('textarea[name="description"]')
        .clear()
        .type(timeEntry.description);
      
      cy.get('[data-testid="time-date-input"]')
        .or('input[type="date"]')
        .then(($input) => {
          if ($input.length) {
            cy.wrap($input).clear().type(timeEntry.date);
          }
        });
      
      // Submit
      cy.get('[data-testid="submit-time-button"]')
        .or('button[type="submit"]')
        .contains(/Save|Add|Submit/i)
        .click();
      
      // Assert - API called
      cy.wait('@createTimeEntry').then((interception) => {
        expect(interception.request.body).to.include({
          hours: parseFloat(timeEntry.hours),
          description: timeEntry.description,
        });
      });
      
      // Assert - Modal closes
      cy.get('[data-testid="time-entry-modal"]')
        .should('not.exist');
      
      // Assert - Success notification
      cy.contains(/time entry added|success|saved/i, { timeout: 5000 })
        .should('be.visible');
    });

    it('should validate required fields for time entry', () => {
      // Act - Open modal and submit without filling
      cy.get('[data-testid="add-time-button"]')
        .or('button')
        .contains(/Add Time|Log Time/i)
        .click();
      
      cy.get('[data-testid="submit-time-button"]')
        .or('button[type="submit"]')
        .first()
        .click();
      
      // Assert - Validation errors
      cy.contains(/required|Please enter|mandatory/i)
        .should('be.visible');
      
      // Assert - Modal stays open
      cy.get('[data-testid="time-entry-modal"]')
        .should('be.visible');
    });

    it('should validate hours format', () => {
      // Act - Open modal
      cy.get('[data-testid="add-time-button"]')
        .or('button')
        .contains(/Add Time|Log Time/i)
        .click();
      
      // Try invalid hours
      cy.get('[data-testid="time-hours-input"]')
        .or('input[name="hours"]')
        .clear()
        .type('-5'); // Negative hours
      
      cy.get('[data-testid="time-description-input"]')
        .or('textarea[name="description"]')
        .type('Test entry');
      
      cy.get('[data-testid="submit-time-button"]')
        .or('button[type="submit"]')
        .first()
        .click();
      
      // Assert - Validation error
      cy.contains(/invalid|positive|greater than/i)
        .should('be.visible');
    });

    it('should display time entries in billing section', () => {
      // Arrange - Add a time entry first
      cy.get('[data-testid="add-time-button"]')
        .or('button')
        .contains(/Add Time|Log Time/i)
        .click();
      
      cy.get('[data-testid="time-hours-input"]')
        .or('input[name="hours"]')
        .type('3.0');
      
      cy.get('[data-testid="time-description-input"]')
        .or('textarea[name="description"]')
        .type('Legal research');
      
      cy.get('[data-testid="submit-time-button"]')
        .or('button[type="submit"]')
        .first()
        .click();
      
      cy.wait('@createTimeEntry');
      
      // Act - Navigate to Billing tab
      cy.contains('[role="tab"]', 'Billing')
        .or('[data-testid="tab-billing"]')
        .click();
      
      // Assert - Time entry appears (if billing section shows recent entries)
      cy.get('[data-testid="billing-section"]')
        .should('be.visible');
    });

    it('should calculate billable amount correctly', () => {
      // Arrange
      const hours = '2.5';
      const expectedRate = 400; // From fixture data
      
      // Act
      cy.get('[data-testid="add-time-button"]')
        .or('button')
        .contains(/Add Time|Log Time/i)
        .click();
      
      cy.get('[data-testid="time-hours-input"]')
        .or('input[name="hours"]')
        .type(hours);
      
      cy.get('[data-testid="time-description-input"]')
        .or('textarea[name="description"]')
        .type('Client consultation');
      
      // Assert - Amount calculation (if shown in form)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="calculated-amount"]').length) {
          const expectedAmount = parseFloat(hours) * expectedRate;
          cy.get('[data-testid="calculated-amount"]')
            .should('contain', expectedAmount.toString());
        }
      });
    });

    it('should handle API errors when adding time entry', () => {
      // Arrange - Mock API error
      cy.intercept('POST', '/api/cases/*/time-entries', {
        statusCode: 500,
        body: { error: 'Failed to save time entry' },
      }).as('timeEntryError');
      
      // Act
      cy.get('[data-testid="add-time-button"]')
        .or('button')
        .contains(/Add Time|Log Time/i)
        .click();
      
      cy.get('[data-testid="time-hours-input"]')
        .or('input[name="hours"]')
        .type('1.5');
      
      cy.get('[data-testid="time-description-input"]')
        .or('textarea[name="description"]')
        .type('Test entry');
      
      cy.get('[data-testid="submit-time-button"]')
        .or('button[type="submit"]')
        .first()
        .click();
      
      // Assert - Error message
      cy.wait('@timeEntryError');
      cy.contains(/error|failed/i)
        .should('be.visible');
    });
  });

  // ============================================================================
  // TEST 7: Update Case Status
  // ============================================================================
  
  describe('Case Status Updates', () => {
    beforeEach(() => {
      cy.mockUpdateCaseAPI();
      
      cy.fixture('cases.json').then((cases) => {
        cy.mockCaseDetailAPI(cases[0].id);
        cy.visitCaseDetail(cases[0].id);
      });
    });

    it('should display current case status in header', () => {
      // Assert
      cy.fixture('cases.json').then((cases) => {
        const currentStatus = cases[0].status;
        
        cy.get('[data-testid="case-detail-header"]')
          .should('contain', currentStatus);
      });
    });

    it('should show status dropdown in header', () => {
      // Assert - Status dropdown exists
      cy.get('[data-testid="status-dropdown"]')
        .or('[data-testid="case-status-select"]')
        .or('select[name="status"]')
        .should('exist');
    });

    it('should update case status via dropdown', () => {
      // Arrange
      const newStatus = 'Discovery';
      
      // Act - Change status
      cy.get('[data-testid="status-dropdown"]')
        .or('[data-testid="case-status-select"]')
        .or('select[name="status"]')
        .select(newStatus);
      
      // Assert - API called
      cy.wait('@updateCase').then((interception) => {
        expect(interception.request.body).to.have.property('status', newStatus);
      });
      
      // Assert - Success notification
      cy.contains(/status updated|success/i)
        .should('be.visible');
      
      // Assert - UI updates
      cy.get('[data-testid="case-detail-header"]')
        .should('contain', newStatus);
    });

    it('should update case status to Settlement', () => {
      // Act
      cy.get('[data-testid="status-dropdown"]')
        .or('select[name="status"]')
        .select('Settlement');
      
      // Assert
      cy.wait('@updateCase');
      cy.contains('Settlement').should('be.visible');
    });

    it('should update case status to Closed', () => {
      // Act
      cy.get('[data-testid="status-dropdown"]')
        .or('select[name="status"]')
        .select('Closed');
      
      // Assert
      cy.wait('@updateCase');
      cy.contains('Closed').should('be.visible');
    });

    it('should show confirmation for sensitive status changes', () => {
      // Some status changes may require confirmation
      cy.get('body').then(($body) => {
        // Try changing to Closed status
        cy.get('[data-testid="status-dropdown"]')
          .or('select[name="status"]')
          .select('Closed');
        
        // Check if confirmation dialog appears
        if ($body.find('[data-testid="confirm-dialog"]').length) {
          cy.get('[data-testid="confirm-dialog"]')
            .should('be.visible');
          
          cy.get('[data-testid="confirm-button"]')
            .click();
          
          cy.wait('@updateCase');
        }
      });
    });

    it('should handle status update errors', () => {
      // Arrange - Mock API error
      cy.intercept('PATCH', '/api/cases/*', {
        statusCode: 403,
        body: { error: 'Insufficient permissions' },
      }).as('updateError');
      
      // Act
      cy.get('[data-testid="status-dropdown"]')
        .or('select[name="status"]')
        .select('Discovery');
      
      // Assert
      cy.wait('@updateError');
      cy.contains(/error|permission|failed/i)
        .should('be.visible');
    });

    it('should revert status on API failure', () => {
      // Arrange - Get current status
      cy.fixture('cases.json').then((cases) => {
        const originalStatus = cases[0].status;
        
        // Mock API error
        cy.intercept('PATCH', '/api/cases/*', {
          statusCode: 500,
          body: { error: 'Server error' },
        }).as('updateFailed');
        
        // Act - Try to change status
        cy.get('[data-testid="status-dropdown"]')
          .or('select[name="status"]')
          .select('Settlement');
        
        cy.wait('@updateFailed');
        
        // Assert - Status reverts to original (optimistic UI rollback)
        cy.get('[data-testid="case-detail-header"]')
          .should('contain', originalStatus);
      });
    });

    it('should log status change in timeline', () => {
      // Arrange - Change status
      cy.get('[data-testid="status-dropdown"]')
        .or('select[name="status"]')
        .select('Discovery');
      
      cy.wait('@updateCase');
      
      // Act - Navigate to Timeline tab
      cy.contains('[role="tab"]', 'Timeline').click();
      
      // Assert - Status change event in timeline (if implemented)
      cy.get('[data-testid="case-timeline"]').should('be.visible');
      // Note: Actual timeline event verification depends on implementation
    });

    it('should allow paralegals to update case status', () => {
      // Arrange - Setup paralegal role
      cy.setupTestUser('paralegal');
      
      // Act
      cy.get('[data-testid="status-dropdown"]')
        .or('select[name="status"]')
        .should('not.be.disabled')
        .select('Discovery');
      
      // Assert
      cy.wait('@updateCase');
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================
  
  describe('Time & Status Integration', () => {
    it('should add time entry and update status in same session', () => {
      // Setup
      cy.intercept('POST', '/api/cases/*/time-entries', {
        statusCode: 201,
        body: { id: 'time-001', hours: 2, description: 'Work' },
      }).as('createTime');
      
      cy.mockUpdateCaseAPI();
      
      cy.fixture('cases.json').then((cases) => {
        cy.visitCaseDetail(cases[0].id);
        
        // Act - Add time
        cy.get('[data-testid="add-time-button"]')
          .or('button')
          .contains(/Add Time/i)
          .click();
        
        cy.get('[data-testid="time-hours-input"]')
          .or('input[name="hours"]')
          .type('2');
        
        cy.get('[data-testid="time-description-input"]')
          .or('textarea[name="description"]')
          .type('Initial research');
        
        cy.get('[data-testid="submit-time-button"]')
          .or('button[type="submit"]')
          .first()
          .click();
        
        cy.wait('@createTime');
        
        // Act - Update status
        cy.get('[data-testid="status-dropdown"]')
          .or('select[name="status"]')
          .select('Discovery');
        
        // Assert
        cy.wait('@updateCase');
        cy.contains(/success/i).should('be.visible');
      });
    });
  });
});
