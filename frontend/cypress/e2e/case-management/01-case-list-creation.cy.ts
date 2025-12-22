/**
 * CASE MANAGEMENT E2E TEST SUITE - TEST 1 & 2
 * Case List Page & Create New Case
 * 
 * STRICT CYPRESS BEST PRACTICES APPLIED:
 * ✓ No hardcoded waits - uses proper assertions
 * ✓ Data-testid selectors for stability
 * ✓ API mocking with cy.intercept()
 * ✓ Proper before/beforeEach hooks
 * ✓ Descriptive test names
 * ✓ AAA pattern (Arrange, Act, Assert)
 */

describe('Case Management - List & Creation', () => {
  // ============================================================================
  // TEST SETUP
  // ============================================================================
  
  beforeEach(() => {
    // Arrange: Setup authentication and API mocks
    cy.login();
    cy.setupTestUser('attorney');
    cy.mockCaseListAPI();
  });

  afterEach(() => {
    // Cleanup
    cy.logout();
  });

  // ============================================================================
  // TEST 1: Case List Page Loads Correctly
  // ============================================================================
  
  describe('Case List Page', () => {
    it('should load the case list page with all tabs visible', () => {
      // Arrange
      cy.mockCaseListAPI('cases.json');
      
      // Act
      cy.visitCaseList();
      
      // Assert - Page structure
      cy.get('[data-testid="case-list-container"]')
        .should('be.visible');
      
      cy.contains('h1', 'Matter Management')
        .should('be.visible');
      
      // Assert - Tabs are present
      const expectedTabs = ['active', 'intake', 'docket', 'tasks', 'conflicts', 'resources', 'trust', 'closing', 'archived'];
      expectedTabs.forEach(tab => {
        cy.get(`[data-testid="tab-${tab}"]`)
          .should('exist');
      });
    });

    it('should display cases from API with correct data', () => {
      // Arrange
      cy.mockCaseListAPI('cases.json');
      
      // Act
      cy.visitCaseList();
      cy.wait('@getCases');
      
      // Assert - Cases are displayed
      cy.fixture('cases.json').then((cases) => {
        // Verify first case appears
        const firstCase = cases[0];
        cy.assertCaseInList(firstCase.title);
        
        // Verify case details are visible
        cy.contains('[data-testid="case-card"]', firstCase.title)
          .within(() => {
            cy.contains(firstCase.caseNumber).should('be.visible');
            cy.contains(firstCase.client).should('be.visible');
            cy.contains(firstCase.status).should('be.visible');
          });
      });
    });

    it('should show "New Case" button for attorneys', () => {
      // Arrange
      cy.visitCaseList();
      
      // Assert
      cy.get('[data-testid="new-case-button"]')
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should show export button', () => {
      // Arrange
      cy.visitCaseList();
      
      // Assert
      cy.contains('button', 'Export')
        .should('be.visible');
    });

    it('should switch between tabs correctly', () => {
      // Arrange
      cy.visitCaseList();
      
      // Act & Assert - Switch to intake tab
      cy.get('[data-testid="tab-intake"]')
        .click();
      cy.url().should('include', '/cases/intake');
      
      // Act & Assert - Switch to docket tab
      cy.get('[data-testid="tab-docket"]')
        .click();
      cy.url().should('include', '/cases/docket');
      
      // Act & Assert - Back to active tab
      cy.get('[data-testid="tab-active"]')
        .click();
      cy.url().should('include', '/cases/active');
    });
  });

  // ============================================================================
  // TEST 2: Create New Case via Modal
  // ============================================================================
  
  describe('Create New Case', () => {
    beforeEach(() => {
      cy.mockCreateCaseAPI();
      cy.visitCaseList();
    });

    it('should open create case modal when clicking New Case button', () => {
      // Act
      cy.openCreateCaseModal();
      
      // Assert - Modal is visible
      cy.get('[data-testid="create-case-modal"]')
        .should('be.visible');
      
      cy.get('[data-testid="modal-title"]')
        .should('contain', 'New Case')
        .or('contain', 'Create Case');
      
      // Assert - Form fields are present
      cy.get('[data-testid="case-title-input"]').should('exist');
      cy.get('[data-testid="case-client-input"]').should('exist');
      cy.get('[data-testid="case-number-input"]').should('exist');
      cy.get('[data-testid="case-type-select"]').should('exist');
    });

    it('should close modal when clicking cancel', () => {
      // Arrange
      cy.openCreateCaseModal();
      
      // Act
      cy.get('[data-testid="cancel-button"]')
        .or('[data-testid="close-modal-button"]')
        .first()
        .click();
      
      // Assert
      cy.get('[data-testid="create-case-modal"]')
        .should('not.exist');
    });

    it('should create a new case with valid data', () => {
      // Arrange
      cy.fixture('new-case.json').then((newCase) => {
        // Act
        cy.openCreateCaseModal();
        cy.fillCaseForm(newCase);
        
        // Submit form
        cy.get('[data-testid="submit-case-button"]')
          .or('button[type="submit"]')
          .contains(/Create|Save|Submit/)
          .click();
        
        // Assert - API was called
        cy.assertAPICall('createCase', {
          title: newCase.title,
          client: newCase.client,
          caseNumber: newCase.caseNumber,
        });
        
        // Assert - Modal closes
        cy.get('[data-testid="create-case-modal"]')
          .should('not.exist');
        
        // Assert - Success notification
        cy.contains(/Case created|Success|Added/i)
          .should('be.visible');
      });
    });

    it('should show validation errors for required fields', () => {
      // Act
      cy.openCreateCaseModal();
      
      // Try to submit without filling required fields
      cy.get('[data-testid="submit-case-button"]')
        .or('button[type="submit"]')
        .first()
        .click();
      
      // Assert - Validation errors appear
      cy.contains(/required|Please fill|mandatory/i)
        .should('be.visible');
      
      // Assert - Modal stays open
      cy.get('[data-testid="create-case-modal"]')
        .should('be.visible');
    });

    it('should handle API errors gracefully', () => {
      // Arrange - Mock API error
      cy.intercept('POST', '/api/cases', {
        statusCode: 500,
        body: { error: 'Internal server error' },
      }).as('createCaseError');
      
      cy.fixture('new-case.json').then((newCase) => {
        // Act
        cy.openCreateCaseModal();
        cy.fillCaseForm(newCase);
        
        cy.get('[data-testid="submit-case-button"]')
          .or('button[type="submit"]')
          .first()
          .click();
        
        // Assert - Error notification
        cy.wait('@createCaseError');
        cy.contains(/error|failed/i)
          .should('be.visible');
      });
    });

    it('should populate all form fields correctly', () => {
      // Act
      cy.openCreateCaseModal();
      
      cy.fixture('new-case.json').then((newCase) => {
        cy.fillCaseForm(newCase);
        
        // Assert - Fields contain correct values
        cy.get('[data-testid="case-title-input"]')
          .should('have.value', newCase.title);
        
        cy.get('[data-testid="case-client-input"]')
          .should('have.value', newCase.client);
        
        cy.get('[data-testid="case-number-input"]')
          .should('have.value', newCase.caseNumber);
        
        cy.get('[data-testid="case-type-select"]')
          .should('have.value', newCase.type);
      });
    });
  });

  // ============================================================================
  // RESPONSIVE DESIGN TESTS
  // ============================================================================
  
  describe('Responsive Design', () => {
    it('should be mobile-friendly', () => {
      // Arrange - Set mobile viewport
      cy.viewport('iphone-x');
      cy.visitCaseList();
      
      // Assert - Content is visible and usable
      cy.get('[data-testid="case-list-container"]')
        .should('be.visible');
      
      cy.get('[data-testid="new-case-button"]')
        .should('be.visible');
    });

    it('should be tablet-friendly', () => {
      // Arrange - Set tablet viewport
      cy.viewport('ipad-2');
      cy.visitCaseList();
      
      // Assert
      cy.get('[data-testid="case-list-container"]')
        .should('be.visible');
    });
  });
});
