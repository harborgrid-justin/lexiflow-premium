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
// REGISTRATION COMMANDS
// ============================================================================

/**
 * Register a new user
 * Best Practice: Use for testing registration flows
 */
Cypress.Commands.add('register', (userData: {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  firmName?: string;
  role?: string;
}) => {
  const defaultData = {
    firstName: 'Test',
    lastName: 'User',
    email: `test-${Date.now()}@lexiflow.com`,
    password: 'TestPassword123!',
    firmName: 'Test Law Firm',
    role: 'attorney',
    ...userData,
  };

  cy.intercept('POST', '/api/auth/register', {
    statusCode: 201,
    body: {
      user: {
        id: `user-${Date.now()}`,
        email: defaultData.email,
        name: `${defaultData.firstName} ${defaultData.lastName}`,
        role: defaultData.role,
        firm: defaultData.firmName,
      },
      token: 'test-registration-token',
    },
  }).as('registerRequest');

  cy.visit('/register');
  cy.get('[data-testid="first-name-input"]').type(defaultData.firstName);
  cy.get('[data-testid="last-name-input"]').type(defaultData.lastName);
  cy.get('[data-testid="email-input"]').type(defaultData.email);
  cy.get('[data-testid="password-input"]').type(defaultData.password);
  cy.get('[data-testid="confirm-password-input"]').type(defaultData.password);
  cy.get('[data-testid="terms-checkbox"]').check();
  cy.get('[data-testid="register-button"]').click();
  cy.wait('@registerRequest');
});

// ============================================================================
// MFA COMMANDS
// ============================================================================

/**
 * Setup MFA for user
 * Best Practice: Use for testing MFA enrollment flows
 */
Cypress.Commands.add('setupMFA', () => {
  cy.intercept('POST', '/api/auth/mfa/setup', {
    statusCode: 200,
    body: {
      qrCode: 'data:image/png;base64,test',
      secret: 'TESTSECRET123',
      backupCodes: ['111111-111111', '222222-222222', '333333-333333'],
    },
  }).as('mfaSetup');

  cy.intercept('POST', '/api/auth/mfa/verify-setup', {
    statusCode: 200,
    body: {
      success: true,
      backupCodes: ['111111-111111', '222222-222222', '333333-333333'],
    },
  }).as('verifyMfaSetup');

  cy.get('[data-testid="enable-mfa-button"]').click();
  cy.wait('@mfaSetup');
  cy.get('[data-testid="mfa-verification-code-input"]').type('123456');
  cy.get('[data-testid="verify-mfa-button"]').click();
  cy.wait('@verifyMfaSetup');
});

/**
 * Login with MFA enabled
 * Best Practice: Use for testing MFA verification flows
 */
Cypress.Commands.add('loginWithMFA', (email?: string, password?: string, mfaCode?: string) => {
  const testEmail = email || 'mfa-user@lexiflow.com';
  const testPassword = password || 'Password123!';
  const testMfaCode = mfaCode || '123456';

  cy.intercept('POST', '/api/auth/login', {
    statusCode: 200,
    body: {
      requiresMfa: true,
      tempToken: 'temp-mfa-token',
    },
  }).as('loginRequest');

  cy.intercept('POST', '/api/auth/mfa/verify', {
    statusCode: 200,
    body: {
      user: {
        id: 'user-mfa-123',
        email: testEmail,
        name: 'MFA User',
      },
      token: 'final-auth-token',
    },
  }).as('mfaVerify');

  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(testEmail);
  cy.get('[data-testid="password-input"]').type(testPassword);
  cy.get('[data-testid="login-button"]').click();
  cy.wait('@loginRequest');

  cy.get('[data-testid="mfa-code-input"]').type(testMfaCode);
  cy.get('[data-testid="verify-mfa-code-button"]').click();
  cy.wait('@mfaVerify');
});

/**
 * Mock MFA status
 * Best Practice: Use to set MFA enabled/disabled state
 */
Cypress.Commands.add('mockMFAStatus', (enabled: boolean, backupCodesRemaining?: number) => {
  cy.intercept('GET', '/api/auth/mfa/status', {
    statusCode: 200,
    body: {
      mfaEnabled: enabled,
      backupCodesRemaining: backupCodesRemaining || 5,
    },
  }).as('mfaStatus');
});

// ============================================================================
// PASSWORD RESET COMMANDS
// ============================================================================

/**
 * Request password reset
 * Best Practice: Use for testing forgot password flows
 */
Cypress.Commands.add('requestPasswordReset', (email: string) => {
  cy.intercept('POST', '/api/auth/forgot-password', {
    statusCode: 200,
    body: {
      success: true,
      message: 'Password reset email sent',
    },
  }).as('forgotPasswordRequest');

  cy.visit('/forgot-password');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="submit-button"]').click();
  cy.wait('@forgotPasswordRequest');
});

/**
 * Reset password with token
 * Best Practice: Use for testing password reset completion
 */
Cypress.Commands.add('resetPassword', (token: string, newPassword: string) => {
  cy.intercept('GET', `/api/auth/validate-reset-token?token=${token}`, {
    statusCode: 200,
    body: {
      valid: true,
      email: 'user@test.com',
    },
  }).as('validateToken');

  cy.intercept('POST', '/api/auth/reset-password', {
    statusCode: 200,
    body: {
      success: true,
      message: 'Password reset successful',
    },
  }).as('resetPassword');

  cy.visit(`/reset-password?token=${token}`);
  cy.wait('@validateToken');
  cy.get('[data-testid="new-password-input"]').type(newPassword);
  cy.get('[data-testid="confirm-password-input"]').type(newPassword);
  cy.get('[data-testid="submit-reset-button"]').click();
  cy.wait('@resetPassword');
});

// ============================================================================
// SESSION MANAGEMENT COMMANDS
// ============================================================================

/**
 * Mock session status
 * Best Practice: Use for testing session timeout scenarios
 */
Cypress.Commands.add('mockSessionStatus', (expiresIn: number, showWarning?: boolean) => {
  cy.intercept('GET', '/api/auth/session/status', {
    statusCode: 200,
    body: {
      active: true,
      expiresIn,
      showWarning: showWarning || false,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    },
  }).as('sessionStatus');
});

/**
 * Mock session expired
 * Best Practice: Use for testing forced logout on timeout
 */
Cypress.Commands.add('mockSessionExpired', () => {
  cy.intercept('GET', '/api/auth/session/status', {
    statusCode: 401,
    body: {
      active: false,
      expired: true,
      message: 'Session expired',
    },
  }).as('sessionExpired');
});

/**
 * Extend session
 * Best Practice: Use for testing session extension flows
 */
Cypress.Commands.add('extendSession', () => {
  cy.intercept('POST', '/api/auth/session/refresh', {
    statusCode: 200,
    body: {
      token: `refreshed-token-${Date.now()}`,
      expiresIn: 3600,
    },
  }).as('refreshSession');

  cy.get('[data-testid="stay-logged-in-button"]').click();
  cy.wait('@refreshSession');
});

/**
 * Mock active sessions list
 * Best Practice: Use for testing concurrent session management
 */
Cypress.Commands.add('mockActiveSessions', (sessionCount?: number) => {
  const count = sessionCount || 2;
  const sessions = [];

  for (let i = 0; i < count; i++) {
    sessions.push({
      id: `session-${i + 1}`,
      device: i === 0 ? 'Chrome on Windows' : `Device ${i + 1}`,
      location: 'New York, US',
      lastActive: new Date().toISOString(),
      current: i === 0,
    });
  }

  cy.intercept('GET', '/api/auth/sessions', {
    statusCode: 200,
    body: { sessions },
  }).as('getSessions');
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

      // ============================================================================
      // REGISTRATION COMMANDS TYPE DECLARATIONS
      // ============================================================================

      /**
       * Register a new user
       * @example cy.register({ email: 'user@test.com', password: 'Pass123!' })
       */
      register(userData?: {
        firstName?: string;
        lastName?: string;
        email?: string;
        password?: string;
        firmName?: string;
        role?: string;
      }): Chainable<void>;

      // ============================================================================
      // MFA COMMANDS TYPE DECLARATIONS
      // ============================================================================

      /**
       * Setup MFA for user
       * @example cy.setupMFA()
       */
      setupMFA(): Chainable<void>;

      /**
       * Login with MFA enabled
       * @example cy.loginWithMFA('user@test.com', 'password', '123456')
       */
      loginWithMFA(email?: string, password?: string, mfaCode?: string): Chainable<void>;

      /**
       * Mock MFA status
       * @example cy.mockMFAStatus(true, 3)
       */
      mockMFAStatus(enabled: boolean, backupCodesRemaining?: number): Chainable<void>;

      // ============================================================================
      // PASSWORD RESET COMMANDS TYPE DECLARATIONS
      // ============================================================================

      /**
       * Request password reset
       * @example cy.requestPasswordReset('user@test.com')
       */
      requestPasswordReset(email: string): Chainable<void>;

      /**
       * Reset password with token
       * @example cy.resetPassword('reset-token-123', 'NewPassword123!')
       */
      resetPassword(token: string, newPassword: string): Chainable<void>;

      // ============================================================================
      // SESSION MANAGEMENT COMMANDS TYPE DECLARATIONS
      // ============================================================================

      /**
       * Mock session status
       * @example cy.mockSessionStatus(300, true)
       */
      mockSessionStatus(expiresIn: number, showWarning?: boolean): Chainable<void>;

      /**
       * Mock session expired
       * @example cy.mockSessionExpired()
       */
      mockSessionExpired(): Chainable<void>;

      /**
       * Extend session
       * @example cy.extendSession()
       */
      extendSession(): Chainable<void>;

      /**
       * Mock active sessions list
       * @example cy.mockActiveSessions(3)
       */
      mockActiveSessions(sessionCount?: number): Chainable<void>;
    }
  }
}