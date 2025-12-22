/// <reference types="cypress" />

/**
 * Custom Cypress Commands for LexiFlow E2E Testing
 * 
 * STRICT CYPRESS BEST PRACTICES:
 * - Use cy.intercept() for all API mocking
 * - Avoid hardcoded waits, use proper assertions instead
 * - Use data-* attributes for reliable selectors
 * - Chain commands properly for better error messages
 * - Keep commands reusable and focused
 */

// ============================================================================
// AUTHENTICATION COMMANDS
// ============================================================================

/**
 * Login command - handles authentication flow
 * Best Practice: Always start tests from an authenticated state
 */
Cypress.Commands.add('login', (email?: string, password?: string) => {
  const testEmail = email || Cypress.env('TEST_USER_EMAIL') || 'test@lexiflow.com';
  const testPassword = password || Cypress.env('TEST_USER_PASSWORD') || 'TestPassword123!';

  // Mock authentication API response
  cy.intercept('POST', '/api/auth/login', {
    statusCode: 200,
    body: {
      user: {
        id: 'user-001',
        email: testEmail,
        name: 'Test User',
        role: 'attorney',
        firm: 'Test Law Firm',
      },
      token: 'test-jwt-token',
    },
  }).as('loginRequest');

  // Set authentication state in localStorage
  cy.window().then((win) => {
    win.localStorage.setItem('auth_token', 'test-jwt-token');
    win.localStorage.setItem('user_id', 'user-001');
    win.localStorage.setItem('user_email', testEmail);
  });
});

/**
 * Setup test user with specific permissions
 */
Cypress.Commands.add('setupTestUser', (role: 'attorney' | 'paralegal' | 'admin' = 'attorney') => {
  cy.window().then((win) => {
    win.localStorage.setItem('user_role', role);
    win.localStorage.setItem('user_permissions', JSON.stringify({
      canCreateCase: true,
      canEditCase: true,
      canDeleteCase: role === 'admin',
      canViewBilling: true,
      canManageUsers: role === 'admin',
    }));
  });
});

/**
 * Logout command - clears authentication state
 */
Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
});

// ============================================================================
// API MOCKING COMMANDS
// ============================================================================

/**
 * Mock case list API endpoint
 * Best Practice: Use fixtures for consistent test data
 */
Cypress.Commands.add('mockCaseListAPI', (fixture = 'cases.json') => {
  cy.intercept('GET', '/api/cases*', {
    fixture,
  }).as('getCases');
});

/**
 * Mock case detail API endpoint
 */
Cypress.Commands.add('mockCaseDetailAPI', (caseId: string) => {
  cy.fixture('cases.json').then((cases) => {
    const caseData = cases.find((c: any) => c.id === caseId) || cases[0];
    
    cy.intercept('GET', `/api/cases/${caseId}`, {
      statusCode: 200,
      body: caseData,
    }).as('getCaseDetail');
  });
});

/**
 * Mock create case API endpoint
 */
Cypress.Commands.add('mockCreateCaseAPI', () => {
  cy.intercept('POST', '/api/cases', (req) => {
    req.reply({
      statusCode: 201,
      body: {
        id: `case-${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'user-001',
      },
    });
  }).as('createCase');
});

/**
 * Mock update case API endpoint
 */
Cypress.Commands.add('mockUpdateCaseAPI', () => {
  cy.intercept('PATCH', '/api/cases/*', (req) => {
    req.reply({
      statusCode: 200,
      body: {
        ...req.body,
        updatedAt: new Date().toISOString(),
      },
    });
  }).as('updateCase');
});

/**
 * Mock delete/archive case API endpoint
 */
Cypress.Commands.add('mockArchiveCaseAPI', () => {
  cy.intercept('DELETE', '/api/cases/*', {
    statusCode: 200,
    body: { success: true },
  }).as('archiveCase');
});

// ============================================================================
// UI INTERACTION COMMANDS
// ============================================================================

/**
 * Navigate to case list page
 * Best Practice: Use baseUrl and wait for page to fully load
 */
Cypress.Commands.add('visitCaseList', (tab?: string) => {
  const url = tab ? `/#/cases/${tab}` : '/#/cases';
  cy.visit(url);
  cy.url().should('include', '/cases');
  // Wait for content to load (avoid hardcoded waits)
  cy.get('[data-testid="case-list-container"]', { timeout: 10000 })
    .should('be.visible');
});

/**
 * Navigate to case detail page
 */
Cypress.Commands.add('visitCaseDetail', (caseId: string) => {
  cy.mockCaseDetailAPI(caseId);
  cy.visit(`/#/case/${caseId}`);
  cy.url().should('include', `/case/${caseId}`);
  cy.get('[data-testid="case-detail-header"]', { timeout: 10000 })
    .should('be.visible');
});

/**
 * Open create case modal
 */
Cypress.Commands.add('openCreateCaseModal', () => {
  cy.get('[data-testid="new-case-button"]')
    .should('be.visible')
    .click();
  cy.get('[data-testid="create-case-modal"]')
    .should('be.visible');
});

/**
 * Fill case form
 * Best Practice: Accept object parameter for flexible form filling
 */
Cypress.Commands.add('fillCaseForm', (caseData: Record<string, any>) => {
  if (caseData.title) {
    cy.get('[data-testid="case-title-input"]')
      .clear()
      .type(caseData.title);
  }
  if (caseData.client) {
    cy.get('[data-testid="case-client-input"]')
      .clear()
      .type(caseData.client);
  }
  if (caseData.caseNumber) {
    cy.get('[data-testid="case-number-input"]')
      .clear()
      .type(caseData.caseNumber);
  }
  if (caseData.type) {
    cy.get('[data-testid="case-type-select"]')
      .select(caseData.type);
  }
  if (caseData.status) {
    cy.get('[data-testid="case-status-select"]')
      .select(caseData.status);
  }
  if (caseData.jurisdiction) {
    cy.get('[data-testid="case-jurisdiction-input"]')
      .clear()
      .type(caseData.jurisdiction);
  }
});

// ============================================================================
// ASSERTION COMMANDS
// ============================================================================

/**
 * Assert case appears in list
 * Best Practice: Use specific assertions for better error messages
 */
Cypress.Commands.add('assertCaseInList', (caseTitle: string) => {
  cy.contains('[data-testid="case-card"]', caseTitle)
    .should('be.visible')
    .and('exist');
});

/**
 * Assert API call was made with correct data
 */
Cypress.Commands.add('assertAPICall', (alias: string, expectedData?: any) => {
  cy.wait(`@${alias}`).then((interception) => {
    expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
    if (expectedData) {
      expect(interception.request.body).to.deep.include(expectedData);
    }
  });
});

// ============================================================================
// TYPE DECLARATIONS
// ============================================================================

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login with email and password
       * @example cy.login('user@example.com', 'password123')
       */
      login(email?: string, password?: string): Chainable<void>;
      
      /**
       * Setup test user with specific role
       * @example cy.setupTestUser('attorney')
       */
      setupTestUser(role?: 'attorney' | 'paralegal' | 'admin'): Chainable<void>;
      
      /**
       * Logout and clear auth state
       * @example cy.logout()
       */
      logout(): Chainable<void>;
      
      /**
       * Mock case list API endpoint
       * @example cy.mockCaseListAPI('cases.json')
       */
      mockCaseListAPI(fixture?: string): Chainable<void>;
      
      /**
       * Mock case detail API endpoint
       * @example cy.mockCaseDetailAPI('case-001')
       */
      mockCaseDetailAPI(caseId: string): Chainable<void>;
      
      /**
       * Mock create case API endpoint
       * @example cy.mockCreateCaseAPI()
       */
      mockCreateCaseAPI(): Chainable<void>;
      
      /**
       * Mock update case API endpoint
       * @example cy.mockUpdateCaseAPI()
       */
      mockUpdateCaseAPI(): Chainable<void>;
      
      /**
       * Mock archive case API endpoint
       * @example cy.mockArchiveCaseAPI()
       */
      mockArchiveCaseAPI(): Chainable<void>;
      
      /**
       * Visit case list page
       * @example cy.visitCaseList('active')
       */
      visitCaseList(tab?: string): Chainable<void>;
      
      /**
       * Visit case detail page
       * @example cy.visitCaseDetail('case-001')
       */
      visitCaseDetail(caseId: string): Chainable<void>;
      
      /**
       * Open create case modal
       * @example cy.openCreateCaseModal()
       */
      openCreateCaseModal(): Chainable<void>;
      
      /**
       * Fill case form with data
       * @example cy.fillCaseForm({ title: 'New Case', client: 'John Doe' })
       */
      fillCaseForm(caseData: Record<string, any>): Chainable<void>;
      
      /**
       * Assert case appears in list
       * @example cy.assertCaseInList('Smith v. Johnson')
       */
      assertCaseInList(caseTitle: string): Chainable<void>;
      
      /**
       * Assert API call was made with correct data
       * @example cy.assertAPICall('createCase', { title: 'New Case' })
       */
      assertAPICall(alias: string, expectedData?: any): Chainable<void>;
    }
  }
}