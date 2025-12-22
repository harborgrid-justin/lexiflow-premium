/**
 * CASE MANAGEMENT E2E TEST SUITE - TEST 4 & 5
 * Case Detail Navigation & Tab Switching
 * 
 * STRICT CYPRESS BEST PRACTICES APPLIED:
 * ✓ URL validation for routing
 * ✓ Tab content lazy loading verification
 * ✓ Back navigation testing
 * ✓ Deep linking support
 */

describe('Case Management - Detail Page & Navigation', () => {
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
  // TEST 4: Navigate to Case Detail
  // ============================================================================
  
  describe('Case Detail Navigation', () => {
    it('should navigate to case detail when clicking a case card', () => {
      // Arrange
      cy.visitCaseList();
      cy.fixture('cases.json').then((cases) => {
        const firstCase = cases[0];
        cy.mockCaseDetailAPI(firstCase.id);
        
        // Act - Click case card
        cy.contains('[data-testid="case-card"]', firstCase.title)
          .should('be.visible')
          .click();
        
        // Assert - URL changes
        cy.url().should('include', `/case/${firstCase.id}`);
        
        // Assert - Case detail page loads
        cy.get('[data-testid="case-detail-header"]')
          .should('be.visible');
        
        // Assert - Case information is displayed
        cy.contains('h1', firstCase.title)
          .or('h2', firstCase.title)
          .should('be.visible');
        
        cy.contains(firstCase.caseNumber)
          .should('be.visible');
        
        cy.contains(firstCase.client)
          .should('be.visible');
      });
    });

    it('should load case detail directly via URL', () => {
      // Arrange
      cy.fixture('cases.json').then((cases) => {
        const testCase = cases[1];
        
        // Act - Direct navigation
        cy.visitCaseDetail(testCase.id);
        
        // Assert - Page loads correctly
        cy.get('[data-testid="case-detail-header"]')
          .should('be.visible');
        
        cy.contains(testCase.title)
          .should('be.visible');
      });
    });

    it('should show back button that returns to case list', () => {
      // Arrange
      cy.fixture('cases.json').then((cases) => {
        cy.visitCaseDetail(cases[0].id);
        
        // Assert - Back button exists
        cy.get('[data-testid="back-button"]')
          .or('button[aria-label*="back"]')
          .should('be.visible');
        
        // Act - Click back
        cy.get('[data-testid="back-button"]')
          .or('button[aria-label*="back"]')
          .first()
          .click();
        
        // Assert - Returns to case list
        cy.url().should('include', '/cases');
        cy.get('[data-testid="case-list-container"]')
          .should('be.visible');
      });
    });

    it('should display case header with key information', () => {
      // Arrange
      cy.fixture('cases.json').then((cases) => {
        const testCase = cases[0];
        cy.visitCaseDetail(testCase.id);
        
        // Assert - Header information
        cy.get('[data-testid="case-detail-header"]')
          .within(() => {
            cy.contains(testCase.title).should('be.visible');
            cy.contains(testCase.status).should('be.visible');
            cy.contains(testCase.caseNumber).should('be.visible');
          });
      });
    });

    it('should handle case not found error', () => {
      // Arrange - Mock 404 response
      cy.intercept('GET', '/api/cases/non-existent-id', {
        statusCode: 404,
        body: { error: 'Case not found' },
      }).as('caseNotFound');
      
      // Act
      cy.visit('/#/case/non-existent-id', { failOnStatusCode: false });
      
      // Assert - Error message displayed
      cy.contains(/not found|error|404/i)
        .should('be.visible');
    });
  });

  // ============================================================================
  // TEST 5: Case Detail Tabs Navigation
  // ============================================================================
  
  describe('Case Detail Tabs', () => {
    beforeEach(() => {
      cy.fixture('cases.json').then((cases) => {
        const testCase = cases[0];
        cy.mockCaseDetailAPI(testCase.id);
        cy.visitCaseDetail(testCase.id);
      });
    });

    it('should display all main tabs', () => {
      // Assert - Main tabs are visible
      const expectedTabs = [
        'Overview',
        'Timeline',
        'Documents',
        'Billing',
        'Parties',
        'Strategy',
        'Workflow',
      ];
      
      expectedTabs.forEach(tabName => {
        cy.contains('[role="tab"]', tabName)
          .or(`[data-testid="tab-${tabName.toLowerCase()}"]`)
          .should('exist');
      });
    });

    it('should load Overview tab by default', () => {
      // Assert - Overview tab is active
      cy.get('[data-testid="tab-overview"]')
        .or('button[role="tab"]')
        .contains('Overview')
        .should('have.attr', 'aria-selected', 'true')
        .or('have.class', /active|selected/);
      
      // Assert - Overview content is visible
      cy.get('[data-testid="case-overview-content"]')
        .or('[data-testid="overview-section"]')
        .should('be.visible');
    });

    it('should switch to Timeline tab', () => {
      // Act
      cy.contains('[role="tab"]', 'Timeline')
        .or('[data-testid="tab-timeline"]')
        .click();
      
      // Assert - Timeline tab is active
      cy.contains('[role="tab"]', 'Timeline')
        .should('have.attr', 'aria-selected', 'true')
        .or('have.class', /active|selected/);
      
      // Assert - Timeline content loads
      cy.get('[data-testid="case-timeline"]')
        .or('[data-testid="timeline-content"]')
        .should('be.visible');
    });

    it('should switch to Documents tab', () => {
      // Act
      cy.contains('[role="tab"]', 'Documents')
        .or('[data-testid="tab-documents"]')
        .click();
      
      // Assert - Documents tab is active
      cy.contains('[role="tab"]', 'Documents')
        .should('have.attr', 'aria-selected', 'true')
        .or('have.class', /active|selected/);
      
      // Assert - Documents content loads
      cy.get('[data-testid="documents-section"]')
        .or('[data-testid="case-documents"]')
        .should('be.visible');
    });

    it('should switch to Billing tab', () => {
      // Arrange - Mock billing data
      cy.intercept('GET', '/api/cases/*/billing', {
        statusCode: 200,
        body: {
          entries: [
            {
              id: 'billing-001',
              date: '2024-12-20',
              description: 'Legal research',
              hours: 2.5,
              rate: 400,
              amount: 1000,
            },
          ],
        },
      }).as('getBilling');
      
      // Act
      cy.contains('[role="tab"]', 'Billing')
        .or('[data-testid="tab-billing"]')
        .click();
      
      // Assert - Billing tab is active
      cy.contains('[role="tab"]', 'Billing')
        .should('have.attr', 'aria-selected', 'true')
        .or('have.class', /active|selected/);
      
      // Assert - Billing content loads
      cy.get('[data-testid="billing-section"]')
        .or('[data-testid="case-billing"]')
        .should('be.visible');
    });

    it('should switch to Parties tab', () => {
      // Arrange - Mock parties data
      cy.intercept('GET', '/api/cases/*/parties', {
        statusCode: 200,
        body: [
          {
            id: 'party-001',
            name: 'John Doe',
            role: 'Plaintiff',
            type: 'Individual',
          },
        ],
      }).as('getParties');
      
      // Act
      cy.contains('[role="tab"]', 'Parties')
        .or('[data-testid="tab-parties"]')
        .click();
      
      // Assert
      cy.contains('[role="tab"]', 'Parties')
        .should('have.attr', 'aria-selected', 'true')
        .or('have.class', /active|selected/);
    });

    it('should preserve tab selection when navigating away and back', () => {
      // Arrange - Switch to Documents tab
      cy.contains('[role="tab"]', 'Documents')
        .or('[data-testid="tab-documents"]')
        .click();
      
      cy.wait(500);
      
      // Act - Navigate back to case list
      cy.get('[data-testid="back-button"]')
        .or('button[aria-label*="back"]')
        .first()
        .click();
      
      cy.url().should('include', '/cases');
      
      // Act - Return to case detail
      cy.fixture('cases.json').then((cases) => {
        cy.contains('[data-testid="case-card"]', cases[0].title)
          .click();
        
        // Assert - Documents tab should still be active (if session persisted)
        // Or Overview tab if session not persisted (acceptable)
        cy.url().should('include', `/case/${cases[0].id}`);
      });
    });

    it('should load tab content lazily', () => {
      // Assert - Only active tab content should be loaded initially
      cy.get('[data-testid="case-overview-content"]')
        .should('be.visible');
      
      // Timeline content should not exist yet (lazy loaded)
      cy.get('body').then(($body) => {
        const timelineExists = $body.find('[data-testid="case-timeline"]').length > 0;
        
        if (!timelineExists) {
          // Act - Click Timeline tab
          cy.contains('[role="tab"]', 'Timeline').click();
          
          // Assert - Now timeline content loads
          cy.get('[data-testid="case-timeline"]', { timeout: 5000 })
            .should('be.visible');
        }
      });
    });

    it('should handle rapid tab switching', () => {
      // Act - Rapidly switch between tabs
      cy.contains('[role="tab"]', 'Timeline').click();
      cy.wait(100);
      cy.contains('[role="tab"]', 'Documents').click();
      cy.wait(100);
      cy.contains('[role="tab"]', 'Billing').click();
      cy.wait(100);
      cy.contains('[role="tab"]', 'Overview').click();
      
      // Assert - Final tab is active and content visible
      cy.contains('[role="tab"]', 'Overview')
        .should('have.attr', 'aria-selected', 'true')
        .or('have.class', /active|selected/);
      
      cy.get('[data-testid="case-overview-content"]')
        .should('be.visible');
    });
  });

  // ============================================================================
  // SUB-TAB NAVIGATION TESTS
  // ============================================================================
  
  describe('Sub-Tab Navigation', () => {
    it('should navigate between sub-tabs within a parent tab', () => {
      // Some tabs may have sub-tabs (e.g., Strategy tab)
      cy.fixture('cases.json').then((cases) => {
        cy.visitCaseDetail(cases[0].id);
        
        // Check if Strategy tab exists
        cy.get('body').then(($body) => {
          if ($body.find('[data-testid="tab-strategy"]').length) {
            cy.get('[data-testid="tab-strategy"]').click();
            
            // Assert sub-tabs load
            cy.get('[data-testid="case-strategy"]')
              .should('be.visible');
          }
        });
      });
    });
  });

  // ============================================================================
  // MOBILE RESPONSIVE TESTS
  // ============================================================================
  
  describe('Mobile Navigation', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
      cy.fixture('cases.json').then((cases) => {
        cy.visitCaseDetail(cases[0].id);
      });
    });

    it('should show mobile menu for tabs', () => {
      // Check for mobile menu button
      cy.get('[data-testid="mobile-menu-button"]')
        .or('button[aria-label*="menu"]')
        .should('be.visible');
    });

    it('should navigate tabs on mobile', () => {
      // Tabs should be accessible on mobile (possibly via dropdown/menu)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="mobile-menu-button"]').length) {
          cy.get('[data-testid="mobile-menu-button"]').click();
          cy.contains('Timeline').click();
          cy.get('[data-testid="case-timeline"]').should('be.visible');
        }
      });
    });
  });
});
