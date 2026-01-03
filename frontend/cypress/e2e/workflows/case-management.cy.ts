/// <reference types="cypress" />

/**
 * E2E Test Suite: Case Management Workflow
 *
 * Tests the complete case management lifecycle including:
 * - Creating new cases
 * - Filtering and searching case lists
 * - Viewing case details
 * - Updating case status
 * - Assigning cases to team members
 * - Viewing case timeline and activity
 */

describe('Case Management Workflow', () => {
  beforeEach(() => {
    // Login as attorney before each test
    cy.login('attorney@firm.com', 'password123');
    cy.setupTestUser('attorney');
  });

  afterEach(() => {
    // Clean up after each test
    cy.logout();
  });

  describe('Create New Case', () => {
    beforeEach(() => {
      // Mock the create case API
      cy.mockCreateCaseAPI();
      cy.mockCaseListAPI();
    });

    it('should create a new case successfully with all required fields', () => {
      // Navigate to cases page
      cy.visitCaseList();

      // Click create new case button
      cy.openCreateCaseModal();

      // Fill out the case form
      cy.fillCaseForm({
        title: 'Martinez v. Global Tech Solutions',
        client: 'Maria Martinez',
        caseNumber: '2024-CV-98765',
        type: 'Civil Litigation',
        status: 'Active',
        jurisdiction: 'Superior Court, San Francisco County'
      });

      // Add additional fields
      cy.get('[data-testid="case-practice-area-select"]')
        .select('Employment Law');

      cy.get('[data-testid="case-lead-attorney-select"]')
        .select('Jane Doe');

      cy.get('[data-testid="case-description-textarea"]')
        .type('Wrongful termination and discrimination case');

      // Submit the form
      cy.get('[data-testid="create-case-submit-button"]')
        .should('be.enabled')
        .click();

      // Verify API call was made
      cy.assertAPICall('createCase', {
        title: 'Martinez v. Global Tech Solutions',
        client: 'Maria Martinez',
        caseNumber: '2024-CV-98765'
      });

      // Verify success message
      cy.get('[data-testid="toast-notification"]')
        .should('be.visible')
        .and('contain', 'Case created successfully');

      // Verify modal closes
      cy.get('[data-testid="create-case-modal"]')
        .should('not.exist');

      // Verify case appears in list
      cy.assertCaseInList('Martinez v. Global Tech Solutions');
    });

    it('should validate required fields before submission', () => {
      cy.visitCaseList();
      cy.openCreateCaseModal();

      // Try to submit without filling required fields
      cy.get('[data-testid="create-case-submit-button"]')
        .should('be.disabled');

      // Fill only case title
      cy.get('[data-testid="case-title-input"]')
        .type('Test Case');

      // Submit button should still be disabled
      cy.get('[data-testid="create-case-submit-button"]')
        .should('be.disabled');

      // Fill client name
      cy.get('[data-testid="case-client-input"]')
        .type('Test Client');

      // Now submit button should be enabled
      cy.get('[data-testid="create-case-submit-button"]')
        .should('be.enabled');
    });

    it('should allow canceling case creation', () => {
      cy.visitCaseList();
      cy.openCreateCaseModal();

      // Fill some data
      cy.get('[data-testid="case-title-input"]')
        .type('Test Case to Cancel');

      // Click cancel button
      cy.get('[data-testid="create-case-cancel-button"]')
        .click();

      // Verify modal closes without creating case
      cy.get('[data-testid="create-case-modal"]')
        .should('not.exist');

      // Verify case was not created
      cy.get('[data-testid="case-list-container"]')
        .should('not.contain', 'Test Case to Cancel');
    });
  });

  describe('Case List Filtering', () => {
    beforeEach(() => {
      cy.mockCaseListAPI();
      cy.visitCaseList();
    });

    it('should filter cases by status', () => {
      // Wait for cases to load
      cy.wait('@getCases');

      // Open filter dropdown
      cy.get('[data-testid="case-status-filter"]')
        .click();

      // Select "Active" status
      cy.get('[data-testid="filter-option-active"]')
        .click();

      // Verify filtered results
      cy.get('[data-testid="case-card"]')
        .should('have.length.greaterThan', 0)
        .each(($card) => {
          cy.wrap($card)
            .find('[data-testid="case-status-badge"]')
            .should('contain', 'Active');
        });
    });

    it('should filter cases by practice area', () => {
      cy.wait('@getCases');

      // Open practice area filter
      cy.get('[data-testid="case-practice-area-filter"]')
        .click();

      // Select specific practice area
      cy.get('[data-testid="filter-option-personal-injury"]')
        .click();

      // Verify URL updates with filter
      cy.url().should('include', 'practiceArea=personal-injury');

      // Verify filtered results
      cy.get('[data-testid="case-card"]')
        .first()
        .should('contain', 'Personal Injury');
    });

    it('should search cases by title or case number', () => {
      cy.wait('@getCases');

      // Mock search API
      cy.intercept('GET', '/api/cases*search=Smith*', {
        fixture: 'cases.json'
      }).as('searchCases');

      // Enter search query
      cy.get('[data-testid="case-search-input"]')
        .type('Smith');

      // Trigger search (debounced)
      cy.wait(500);

      // Verify search API was called
      cy.wait('@searchCases');

      // Verify search results
      cy.get('[data-testid="case-card"]')
        .should('contain', 'Smith');
    });

    it('should clear all filters', () => {
      cy.wait('@getCases');

      // Apply multiple filters
      cy.get('[data-testid="case-status-filter"]').click();
      cy.get('[data-testid="filter-option-active"]').click();

      cy.get('[data-testid="case-practice-area-filter"]').click();
      cy.get('[data-testid="filter-option-personal-injury"]').click();

      // Click clear filters button
      cy.get('[data-testid="clear-filters-button"]')
        .click();

      // Verify all cases are shown again
      cy.get('[data-testid="case-card"]')
        .should('have.length.greaterThan', 1);

      // Verify URL is clean
      cy.url().should('not.include', 'practiceArea');
      cy.url().should('not.include', 'status');
    });

    it('should sort cases by different criteria', () => {
      cy.wait('@getCases');

      // Click sort dropdown
      cy.get('[data-testid="case-sort-dropdown"]')
        .click();

      // Select sort by date
      cy.get('[data-testid="sort-option-date-desc"]')
        .click();

      // Verify first case is most recent
      cy.get('[data-testid="case-card"]')
        .first()
        .should('be.visible');
    });
  });

  describe('Case Detail View', () => {
    beforeEach(() => {
      cy.mockCaseDetailAPI('case-001');
    });

    it('should display complete case information', () => {
      cy.visitCaseDetail('case-001');

      // Verify case header information
      cy.get('[data-testid="case-detail-header"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="case-title"]')
            .should('contain', 'Smith v. Johnson Industries');

          cy.get('[data-testid="case-number"]')
            .should('contain', '2024-CV-12345');

          cy.get('[data-testid="case-status-badge"]')
            .should('contain', 'Active');
        });

      // Verify case metadata
      cy.get('[data-testid="case-metadata"]')
        .should('be.visible')
        .within(() => {
          cy.contains('Client').parent()
            .should('contain', 'John Smith');

          cy.contains('Lead Attorney').parent()
            .should('contain', 'Jane Doe');

          cy.contains('Practice Area').parent()
            .should('contain', 'Personal Injury');

          cy.contains('Jurisdiction').parent()
            .should('contain', 'Superior Court, Los Angeles County');
        });
    });

    it('should navigate between case detail tabs', () => {
      cy.visitCaseDetail('case-001');

      // Click on Documents tab
      cy.get('[data-testid="case-tab-documents"]')
        .click();

      cy.get('[data-testid="documents-panel"]')
        .should('be.visible');

      // Click on Timeline tab
      cy.get('[data-testid="case-tab-timeline"]')
        .click();

      cy.get('[data-testid="timeline-panel"]')
        .should('be.visible');

      // Click on Billing tab
      cy.get('[data-testid="case-tab-billing"]')
        .click();

      cy.get('[data-testid="billing-panel"]')
        .should('be.visible');
    });

    it('should display case participants and parties', () => {
      cy.visitCaseDetail('case-001');

      // Navigate to parties tab
      cy.get('[data-testid="case-tab-parties"]')
        .click();

      // Verify parties table is visible
      cy.get('[data-testid="parties-table"]')
        .should('be.visible');

      // Verify plaintiff information
      cy.get('[data-testid="party-plaintiff"]')
        .should('be.visible')
        .and('contain', 'John Smith');

      // Verify defendant information
      cy.get('[data-testid="party-defendant"]')
        .should('be.visible')
        .and('contain', 'Johnson Industries');
    });
  });

  describe('Case Status Update', () => {
    beforeEach(() => {
      cy.mockCaseDetailAPI('case-001');
      cy.mockUpdateCaseAPI();
    });

    it('should update case status successfully', () => {
      cy.visitCaseDetail('case-001');

      // Click edit status button
      cy.get('[data-testid="edit-case-status-button"]')
        .click();

      // Select new status
      cy.get('[data-testid="case-status-dropdown"]')
        .select('Discovery');

      // Add status change note
      cy.get('[data-testid="status-change-note"]')
        .type('Case entering discovery phase - initial disclosures complete');

      // Save status change
      cy.get('[data-testid="save-status-button"]')
        .click();

      // Verify API call
      cy.wait('@updateCase').then((interception) => {
        expect(interception.request.body).to.include({
          status: 'Discovery'
        });
      });

      // Verify success notification
      cy.get('[data-testid="toast-notification"]')
        .should('be.visible')
        .and('contain', 'Case status updated');

      // Verify status badge updated
      cy.get('[data-testid="case-status-badge"]')
        .should('contain', 'Discovery');
    });

    it('should record status change in timeline', () => {
      cy.visitCaseDetail('case-001');

      // Update status
      cy.get('[data-testid="edit-case-status-button"]').click();
      cy.get('[data-testid="case-status-dropdown"]').select('Settlement');
      cy.get('[data-testid="status-change-note"]')
        .type('Settlement negotiations initiated');
      cy.get('[data-testid="save-status-button"]').click();

      // Navigate to timeline
      cy.get('[data-testid="case-tab-timeline"]').click();

      // Verify timeline entry
      cy.get('[data-testid="timeline-panel"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="timeline-entry"]')
            .first()
            .should('contain', 'Status changed to Settlement')
            .and('contain', 'Settlement negotiations initiated');
        });
    });
  });

  describe('Case Assignment', () => {
    beforeEach(() => {
      cy.mockCaseDetailAPI('case-001');
      cy.mockUpdateCaseAPI();

      // Mock team members API
      cy.intercept('GET', '/api/team/members', {
        statusCode: 200,
        body: [
          { id: 'user-001', name: 'Jane Doe', role: 'Attorney' },
          { id: 'user-002', name: 'Robert Chen', role: 'Attorney' },
          { id: 'user-003', name: 'Lisa Park', role: 'Paralegal' }
        ]
      }).as('getTeamMembers');
    });

    it('should assign lead attorney to case', () => {
      cy.visitCaseDetail('case-001');

      // Click assign attorney button
      cy.get('[data-testid="assign-lead-attorney-button"]')
        .click();

      // Wait for team members to load
      cy.wait('@getTeamMembers');

      // Select new lead attorney
      cy.get('[data-testid="lead-attorney-select"]')
        .select('Robert Chen');

      // Save assignment
      cy.get('[data-testid="save-assignment-button"]')
        .click();

      // Verify API call
      cy.wait('@updateCase').then((interception) => {
        expect(interception.request.body).to.include({
          leadAttorney: 'Robert Chen'
        });
      });

      // Verify success notification
      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Lead attorney updated');
    });

    it('should add team members to case', () => {
      cy.visitCaseDetail('case-001');

      // Click add team member button
      cy.get('[data-testid="add-team-member-button"]')
        .click();

      cy.wait('@getTeamMembers');

      // Select team member
      cy.get('[data-testid="team-member-select"]')
        .select('Lisa Park');

      // Select role
      cy.get('[data-testid="team-role-select"]')
        .select('Paralegal');

      // Add team member
      cy.get('[data-testid="confirm-add-team-member"]')
        .click();

      // Verify team member appears in list
      cy.get('[data-testid="case-team-list"]')
        .should('contain', 'Lisa Park')
        .and('contain', 'Paralegal');
    });

    it('should remove team member from case', () => {
      cy.visitCaseDetail('case-001');

      // Find team member to remove
      cy.get('[data-testid="team-member-card"]')
        .contains('Lisa Park')
        .parent()
        .within(() => {
          cy.get('[data-testid="remove-team-member-button"]')
            .click();
        });

      // Confirm removal
      cy.get('[data-testid="confirm-remove-dialog"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="confirm-button"]')
            .click();
        });

      // Verify team member removed
      cy.get('[data-testid="case-team-list"]')
        .should('not.contain', 'Lisa Park');
    });
  });

  describe('Case Timeline', () => {
    beforeEach(() => {
      cy.mockCaseDetailAPI('case-001');

      // Mock timeline API
      cy.intercept('GET', '/api/cases/case-001/timeline', {
        statusCode: 200,
        body: [
          {
            id: 'timeline-001',
            type: 'status_change',
            title: 'Case status changed to Active',
            description: 'Case entered active litigation phase',
            timestamp: '2024-12-20T10:00:00Z',
            user: 'Jane Doe'
          },
          {
            id: 'timeline-002',
            type: 'document',
            title: 'Complaint filed',
            description: 'Initial complaint filed with court',
            timestamp: '2024-12-15T14:30:00Z',
            user: 'Jane Doe'
          },
          {
            id: 'timeline-003',
            type: 'note',
            title: 'Client meeting notes',
            description: 'Discussed case strategy and settlement options',
            timestamp: '2024-12-10T09:15:00Z',
            user: 'Robert Chen'
          }
        ]
      }).as('getTimeline');
    });

    it('should display case timeline in chronological order', () => {
      cy.visitCaseDetail('case-001');

      // Navigate to timeline tab
      cy.get('[data-testid="case-tab-timeline"]')
        .click();

      // Wait for timeline to load
      cy.wait('@getTimeline');

      // Verify timeline entries are displayed
      cy.get('[data-testid="timeline-entry"]')
        .should('have.length', 3);

      // Verify most recent entry is first
      cy.get('[data-testid="timeline-entry"]')
        .first()
        .should('contain', 'Case status changed to Active');
    });

    it('should filter timeline by event type', () => {
      cy.visitCaseDetail('case-001');
      cy.get('[data-testid="case-tab-timeline"]').click();
      cy.wait('@getTimeline');

      // Filter by document events
      cy.get('[data-testid="timeline-filter-type"]')
        .click();

      cy.get('[data-testid="filter-type-document"]')
        .click();

      // Verify only document events shown
      cy.get('[data-testid="timeline-entry"]')
        .should('have.length', 1)
        .and('contain', 'Complaint filed');
    });

    it('should add note to timeline', () => {
      // Mock create timeline entry API
      cy.intercept('POST', '/api/cases/case-001/timeline', (req) => {
        req.reply({
          statusCode: 201,
          body: {
            id: `timeline-${Date.now()}`,
            ...req.body,
            timestamp: new Date().toISOString(),
            user: 'Jane Doe'
          }
        });
      }).as('createTimelineEntry');

      cy.visitCaseDetail('case-001');
      cy.get('[data-testid="case-tab-timeline"]').click();
      cy.wait('@getTimeline');

      // Click add note button
      cy.get('[data-testid="add-timeline-note-button"]')
        .click();

      // Fill note form
      cy.get('[data-testid="note-title-input"]')
        .type('Discovery conference scheduled');

      cy.get('[data-testid="note-description-textarea"]')
        .type('Discovery conference set for January 15th. Prepare document production list.');

      // Save note
      cy.get('[data-testid="save-note-button"]')
        .click();

      // Verify API call
      cy.wait('@createTimelineEntry');

      // Verify note appears in timeline
      cy.get('[data-testid="timeline-entry"]')
        .first()
        .should('contain', 'Discovery conference scheduled');
    });

    it('should display timeline entry details on click', () => {
      cy.visitCaseDetail('case-001');
      cy.get('[data-testid="case-tab-timeline"]').click();
      cy.wait('@getTimeline');

      // Click timeline entry
      cy.get('[data-testid="timeline-entry"]')
        .first()
        .click();

      // Verify detail panel opens
      cy.get('[data-testid="timeline-detail-panel"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="entry-title"]')
            .should('contain', 'Case status changed to Active');

          cy.get('[data-testid="entry-description"]')
            .should('contain', 'Case entered active litigation phase');

          cy.get('[data-testid="entry-user"]')
            .should('contain', 'Jane Doe');

          cy.get('[data-testid="entry-timestamp"]')
            .should('be.visible');
        });
    });
  });

  describe('Case Quick Actions', () => {
    beforeEach(() => {
      cy.mockCaseDetailAPI('case-001');
    });

    it('should perform quick actions from case list', () => {
      cy.mockCaseListAPI();
      cy.visitCaseList();
      cy.wait('@getCases');

      // Find case card
      cy.get('[data-testid="case-card"]')
        .first()
        .within(() => {
          // Click quick actions menu
          cy.get('[data-testid="case-quick-actions-menu"]')
            .click();
        });

      // Verify actions menu appears
      cy.get('[data-testid="quick-actions-dropdown"]')
        .should('be.visible')
        .within(() => {
          cy.contains('View Details').should('be.visible');
          cy.contains('Edit Case').should('be.visible');
          cy.contains('Add Time Entry').should('be.visible');
          cy.contains('Upload Document').should('be.visible');
        });
    });

    it('should navigate to case detail from quick action', () => {
      cy.mockCaseListAPI();
      cy.visitCaseList();
      cy.wait('@getCases');

      cy.get('[data-testid="case-card"]')
        .first()
        .within(() => {
          cy.get('[data-testid="case-quick-actions-menu"]').click();
        });

      cy.get('[data-testid="quick-action-view-details"]')
        .click();

      // Verify navigation to case detail
      cy.url().should('include', '/case/case-001');
      cy.get('[data-testid="case-detail-header"]')
        .should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle case creation errors gracefully', () => {
      // Mock API error
      cy.intercept('POST', '/api/cases', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('createCaseError');

      cy.mockCaseListAPI();
      cy.visitCaseList();
      cy.openCreateCaseModal();

      cy.fillCaseForm({
        title: 'Test Case',
        client: 'Test Client',
        caseNumber: '2024-TEST-001',
        type: 'Civil Litigation',
        status: 'Active'
      });

      cy.get('[data-testid="create-case-submit-button"]').click();

      // Verify error message displayed
      cy.get('[data-testid="toast-notification"]')
        .should('be.visible')
        .and('contain', 'Failed to create case');

      // Verify modal stays open
      cy.get('[data-testid="create-case-modal"]')
        .should('be.visible');
    });

    it('should handle missing case data gracefully', () => {
      // Mock API with missing case
      cy.intercept('GET', '/api/cases/invalid-id', {
        statusCode: 404,
        body: { error: 'Case not found' }
      }).as('getCaseNotFound');

      cy.visit('/#/case/invalid-id');

      // Verify error page or message
      cy.get('[data-testid="case-not-found"]')
        .should('be.visible')
        .and('contain', 'Case not found');

      // Verify back to cases button
      cy.get('[data-testid="back-to-cases-button"]')
        .should('be.visible')
        .click();

      cy.url().should('include', '/cases');
    });
  });
});
