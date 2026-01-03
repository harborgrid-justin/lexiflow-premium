/// <reference types="cypress" />

/**
 * Session Management E2E Tests
 *
 * Comprehensive session management tests covering:
 * - Session timeout warnings
 * - Session extension/refresh
 * - Forced logout on timeout
 * - Concurrent session handling
 * - Session activity tracking
 */

describe('Authentication - Session Management', () => {
  beforeEach(() => {
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.clearCookies();
  });

  describe('Session Timeout Warning', () => {
    beforeEach(() => {
      // Login and setup authenticated session
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', 'test-jwt-token');
        win.localStorage.setItem('user_id', 'user-123');
        win.localStorage.setItem('session_started', Date.now().toString());
      });

      cy.visit('/dashboard');
    });

    it('should display warning modal before session expires', () => {
      // Mock session status API to indicate near expiration
      cy.intercept('GET', '/api/auth/session/status', {
        statusCode: 200,
        body: {
          active: true,
          expiresIn: 120, // 2 minutes remaining
          showWarning: true,
        },
      }).as('sessionStatus');

      cy.wait('@sessionStatus');

      // Warning modal should appear
      cy.get('[data-testid="session-timeout-warning-modal"]', { timeout: 5000 })
        .should('be.visible');

      cy.get('[data-testid="warning-message"]')
        .should('be.visible')
        .and('contain', 'session will expire');

      // Countdown timer should be visible
      cy.get('[data-testid="session-countdown"]')
        .should('be.visible')
        .and('contain', '2');
    });

    it('should show countdown timer in warning modal', () => {
      cy.intercept('GET', '/api/auth/session/status', {
        statusCode: 200,
        body: {
          active: true,
          expiresIn: 300, // 5 minutes
          showWarning: true,
        },
      }).as('sessionStatus');

      cy.wait('@sessionStatus');

      cy.get('[data-testid="session-timeout-warning-modal"]').should('be.visible');

      // Check countdown format (should show minutes:seconds)
      cy.get('[data-testid="session-countdown"]')
        .should('match', /\d+:\d{2}/);

      // Wait and verify countdown decreases
      cy.wait(1000);

      cy.get('[data-testid="session-countdown"]').should((element) => {
        const timeText = element.text();
        expect(timeText).to.match(/[0-4]:[0-5][0-9]/);
      });
    });

    it('should show warning at 5 minutes before expiration', () => {
      let warningShown = false;

      cy.intercept('GET', '/api/auth/session/status', (req) => {
        if (!warningShown) {
          req.reply({
            statusCode: 200,
            body: {
              active: true,
              expiresIn: 300, // Exactly 5 minutes
              showWarning: true,
            },
          });
          warningShown = true;
        }
      }).as('sessionStatus');

      cy.wait('@sessionStatus');

      cy.get('[data-testid="session-timeout-warning-modal"]')
        .should('be.visible');
    });

    it('should provide option to stay logged in from warning', () => {
      cy.intercept('GET', '/api/auth/session/status', {
        statusCode: 200,
        body: {
          active: true,
          expiresIn: 180,
          showWarning: true,
        },
      }).as('sessionStatus');

      cy.wait('@sessionStatus');

      cy.get('[data-testid="session-timeout-warning-modal"]').should('be.visible');

      cy.get('[data-testid="stay-logged-in-button"]')
        .should('be.visible')
        .and('contain', 'Stay Logged In');

      cy.get('[data-testid="logout-button"]')
        .should('be.visible')
        .and('contain', 'Logout');
    });

    it('should dismiss warning if user interacts with page', () => {
      cy.intercept('GET', '/api/auth/session/status', {
        statusCode: 200,
        body: {
          active: true,
          expiresIn: 240,
          showWarning: true,
        },
      }).as('sessionStatus');

      cy.intercept('POST', '/api/auth/session/refresh', {
        statusCode: 200,
        body: {
          token: 'refreshed-token',
          expiresIn: 3600,
        },
      }).as('refreshSession');

      cy.wait('@sessionStatus');

      cy.get('[data-testid="session-timeout-warning-modal"]').should('be.visible');

      // User clicks somewhere on the page
      cy.get('[data-testid="dashboard-content"]').click();

      // Warning should be dismissed
      cy.get('[data-testid="session-timeout-warning-modal"]').should('not.exist');
    });
  });

  describe('Session Extension', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', 'test-jwt-token');
        win.localStorage.setItem('user_id', 'user-123');
      });

      cy.visit('/dashboard');
    });

    it('should extend session when user clicks "Stay Logged In"', () => {
      cy.intercept('GET', '/api/auth/session/status', {
        statusCode: 200,
        body: {
          active: true,
          expiresIn: 180,
          showWarning: true,
        },
      }).as('sessionStatus');

      cy.intercept('POST', '/api/auth/session/refresh', {
        statusCode: 200,
        body: {
          token: 'new-refreshed-token',
          expiresIn: 3600, // Extended by 1 hour
          refreshedAt: new Date().toISOString(),
        },
      }).as('refreshSession');

      cy.wait('@sessionStatus');

      cy.get('[data-testid="session-timeout-warning-modal"]').should('be.visible');

      cy.get('[data-testid="stay-logged-in-button"]').click();

      cy.wait('@refreshSession');

      // Warning modal should close
      cy.get('[data-testid="session-timeout-warning-modal"]').should('not.exist');

      // Verify new token is stored
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.equal('new-refreshed-token');
      });

      // Success notification
      cy.get('[data-testid="success-notification"]')
        .should('be.visible')
        .and('contain', 'Session extended');
    });

    it('should automatically refresh session on user activity', () => {
      cy.intercept('POST', '/api/auth/session/activity', {
        statusCode: 200,
        body: {
          lastActivity: new Date().toISOString(),
        },
      }).as('trackActivity');

      cy.intercept('POST', '/api/auth/session/refresh', {
        statusCode: 200,
        body: {
          token: 'activity-refreshed-token',
          expiresIn: 3600,
        },
      }).as('autoRefresh');

      // Simulate user activity
      cy.get('[data-testid="dashboard-content"]').click();
      cy.get('[data-testid="menu-button"]').click();

      // Activity should be tracked
      cy.wait('@trackActivity');

      // Session should be refreshed after activity
      cy.wait('@autoRefresh', { timeout: 10000 });

      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.exist;
      });
    });

    it('should display current session expiration time', () => {
      const expirationTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

      cy.intercept('GET', '/api/auth/session/status', {
        statusCode: 200,
        body: {
          active: true,
          expiresAt: expirationTime.toISOString(),
          expiresIn: 1800, // 30 minutes in seconds
        },
      }).as('sessionStatus');

      cy.visit('/settings/security');

      cy.wait('@sessionStatus');

      cy.get('[data-testid="session-info"]').should('be.visible');

      cy.get('[data-testid="session-expires-at"]')
        .should('be.visible')
        .and('contain', 'expires');
    });

    it('should handle token refresh failure gracefully', () => {
      cy.intercept('GET', '/api/auth/session/status', {
        statusCode: 200,
        body: {
          active: true,
          expiresIn: 120,
          showWarning: true,
        },
      }).as('sessionStatus');

      cy.intercept('POST', '/api/auth/session/refresh', {
        statusCode: 401,
        body: {
          error: 'Invalid token',
          message: 'Your session could not be refreshed',
        },
      }).as('refreshFail');

      cy.wait('@sessionStatus');

      cy.get('[data-testid="session-timeout-warning-modal"]').should('be.visible');

      cy.get('[data-testid="stay-logged-in-button"]').click();

      cy.wait('@refreshFail');

      // Should show error and force logout
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'session could not be refreshed');

      cy.url().should('include', '/login');
    });
  });

  describe('Forced Logout on Timeout', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', 'test-jwt-token');
        win.localStorage.setItem('user_id', 'user-123');
      });

      cy.visit('/dashboard');
    });

    it('should automatically logout when session expires', () => {
      cy.intercept('GET', '/api/auth/session/status', {
        statusCode: 401,
        body: {
          active: false,
          expired: true,
          message: 'Session expired',
        },
      }).as('sessionExpired');

      cy.wait('@sessionExpired');

      // Should be redirected to login
      cy.url().should('include', '/login');

      // Should show session expired message
      cy.get('[data-testid="info-message"]')
        .should('be.visible')
        .and('contain', 'session has expired');

      // Auth data should be cleared
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.be.null;
        expect(win.localStorage.getItem('user_id')).to.be.null;
      });
    });

    it('should save current work before forced logout', () => {
      cy.intercept('POST', '/api/cases/autosave', {
        statusCode: 200,
        body: { saved: true },
      }).as('autosave');

      cy.intercept('GET', '/api/auth/session/status', {
        statusCode: 401,
        body: { active: false, expired: true },
      }).as('sessionExpired');

      // Trigger autosave before session check
      cy.wait('@autosave');
      cy.wait('@sessionExpired');

      cy.url().should('include', '/login');
    });

    it('should warn user if they have unsaved changes before timeout', () => {
      // Simulate unsaved changes
      cy.window().then((win) => {
        win.localStorage.setItem('unsaved_changes', 'true');
      });

      cy.intercept('GET', '/api/auth/session/status', {
        statusCode: 200,
        body: {
          active: true,
          expiresIn: 60,
          showWarning: true,
        },
      }).as('sessionStatus');

      cy.wait('@sessionStatus');

      cy.get('[data-testid="session-timeout-warning-modal"]').should('be.visible');

      cy.get('[data-testid="unsaved-changes-warning"]')
        .should('be.visible')
        .and('contain', 'unsaved changes');
    });

    it('should preserve redirect URL after forced logout', () => {
      cy.visit('/cases/case-123');

      cy.intercept('GET', '/api/auth/session/status', {
        statusCode: 401,
        body: { active: false, expired: true },
      }).as('sessionExpired');

      cy.wait('@sessionExpired');

      cy.url().should('include', '/login');
      cy.url().should('include', 'redirect=%2Fcases%2Fcase-123');
    });
  });

  describe('Concurrent Session Handling', () => {
    it('should detect when user logs in from another device', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', 'test-jwt-token');
        win.localStorage.setItem('user_id', 'user-123');
        win.localStorage.setItem('session_id', 'session-abc-123');
      });

      cy.visit('/dashboard');

      cy.intercept('GET', '/api/auth/session/status', {
        statusCode: 409,
        body: {
          error: 'Session conflict',
          message: 'You have been logged in from another device',
          currentSessionId: 'session-xyz-789',
        },
      }).as('sessionConflict');

      cy.wait('@sessionConflict');

      cy.get('[data-testid="session-conflict-modal"]')
        .should('be.visible');

      cy.get('[data-testid="conflict-message"]')
        .should('be.visible')
        .and('contain', 'logged in from another device');
    });

    it('should allow user to terminate other sessions', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', 'test-jwt-token');
        win.localStorage.setItem('user_id', 'user-123');
      });

      cy.intercept('GET', '/api/auth/sessions', {
        statusCode: 200,
        body: {
          sessions: [
            {
              id: 'session-1',
              device: 'Chrome on Windows',
              location: 'New York, US',
              lastActive: '2026-01-03T10:00:00Z',
              current: true,
            },
            {
              id: 'session-2',
              device: 'Safari on iPhone',
              location: 'Boston, US',
              lastActive: '2026-01-02T15:30:00Z',
              current: false,
            },
            {
              id: 'session-3',
              device: 'Firefox on Linux',
              location: 'Seattle, US',
              lastActive: '2025-12-30T08:00:00Z',
              current: false,
            },
          ],
        },
      }).as('getSessions');

      cy.visit('/settings/security');

      cy.wait('@getSessions');

      cy.get('[data-testid="active-sessions-list"]').should('be.visible');

      cy.get('[data-testid="session-item"]').should('have.length', 3);

      cy.get('[data-testid="session-item"]')
        .first()
        .should('contain', 'Chrome on Windows')
        .and('contain', 'Current device');
    });

    it('should terminate specific session', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', 'test-jwt-token');
        win.localStorage.setItem('user_id', 'user-123');
      });

      cy.intercept('GET', '/api/auth/sessions', {
        statusCode: 200,
        body: {
          sessions: [
            {
              id: 'session-1',
              device: 'Chrome on Windows',
              current: true,
            },
            {
              id: 'session-2',
              device: 'Safari on iPhone',
              current: false,
            },
          ],
        },
      }).as('getSessions');

      cy.intercept('DELETE', '/api/auth/sessions/session-2', {
        statusCode: 200,
        body: { success: true },
      }).as('terminateSession');

      cy.visit('/settings/security');

      cy.wait('@getSessions');

      cy.get('[data-testid="terminate-session-button-session-2"]')
        .should('be.visible')
        .click();

      cy.get('[data-testid="confirm-terminate-button"]')
        .should('be.visible')
        .click();

      cy.wait('@terminateSession');

      cy.get('[data-testid="success-notification"]')
        .should('be.visible')
        .and('contain', 'Session terminated');
    });

    it('should terminate all other sessions', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', 'test-jwt-token');
        win.localStorage.setItem('user_id', 'user-123');
      });

      cy.intercept('GET', '/api/auth/sessions', {
        statusCode: 200,
        body: {
          sessions: [
            { id: 'session-1', device: 'Chrome', current: true },
            { id: 'session-2', device: 'Safari', current: false },
            { id: 'session-3', device: 'Firefox', current: false },
          ],
        },
      }).as('getSessions');

      cy.intercept('DELETE', '/api/auth/sessions/all-except-current', {
        statusCode: 200,
        body: {
          success: true,
          terminatedCount: 2,
        },
      }).as('terminateAllSessions');

      cy.visit('/settings/security');

      cy.wait('@getSessions');

      cy.get('[data-testid="terminate-all-sessions-button"]')
        .should('be.visible')
        .click();

      cy.get('[data-testid="confirm-terminate-all-button"]')
        .should('be.visible')
        .click();

      cy.wait('@terminateAllSessions');

      cy.get('[data-testid="success-notification"]')
        .should('be.visible')
        .and('contain', '2 sessions terminated');
    });

    it('should limit number of concurrent sessions', () => {
      cy.visit('/login');

      cy.intercept('POST', '/api/auth/login', {
        statusCode: 429,
        body: {
          error: 'Too many active sessions',
          message: 'You have reached the maximum number of concurrent sessions (5)',
          activeSessions: 5,
        },
      }).as('loginFail');

      cy.get('[data-testid="email-input"]').type('user@test.com');
      cy.get('[data-testid="password-input"]').type('Password123!');
      cy.get('[data-testid="login-button"]').click();

      cy.wait('@loginFail');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'maximum number of concurrent sessions');

      cy.get('[data-testid="manage-sessions-link"]')
        .should('be.visible')
        .and('contain', 'Manage active sessions');
    });

    it('should display session information including IP and location', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', 'test-jwt-token');
        win.localStorage.setItem('user_id', 'user-123');
      });

      cy.intercept('GET', '/api/auth/sessions', {
        statusCode: 200,
        body: {
          sessions: [
            {
              id: 'session-1',
              device: 'Chrome 120 on Windows 11',
              ip: '192.168.1.100',
              location: 'San Francisco, CA, USA',
              lastActive: '2026-01-03T12:00:00Z',
              current: true,
            },
          ],
        },
      }).as('getSessions');

      cy.visit('/settings/security');

      cy.wait('@getSessions');

      cy.get('[data-testid="session-item"]').within(() => {
        cy.contains('Chrome 120 on Windows 11').should('be.visible');
        cy.contains('San Francisco, CA, USA').should('be.visible');
        cy.contains('192.168.1.100').should('be.visible');
      });
    });
  });

  describe('Session Activity Tracking', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', 'test-jwt-token');
        win.localStorage.setItem('user_id', 'user-123');
      });

      cy.visit('/dashboard');
    });

    it('should track user activity and update last active timestamp', () => {
      cy.intercept('POST', '/api/auth/session/activity', {
        statusCode: 200,
        body: {
          lastActivity: new Date().toISOString(),
        },
      }).as('trackActivity');

      // Perform various activities
      cy.get('[data-testid="menu-button"]').click();
      cy.wait('@trackActivity');

      cy.get('[data-testid="dashboard-content"]').click();
      cy.wait('@trackActivity');
    });

    it('should not track activity when user is idle', () => {
      let activityCallCount = 0;

      cy.intercept('POST', '/api/auth/session/activity', (req) => {
        activityCallCount++;
        req.reply({
          statusCode: 200,
          body: { lastActivity: new Date().toISOString() },
        });
      }).as('trackActivity');

      // No user interaction for extended period
      cy.wait(5000);

      // Should not have excessive activity calls
      cy.wrap(null).should(() => {
        expect(activityCallCount).to.be.lessThan(3);
      });
    });

    it('should display session duration', () => {
      const sessionStart = new Date(Date.now() - 45 * 60 * 1000); // 45 minutes ago

      cy.intercept('GET', '/api/auth/session/status', {
        statusCode: 200,
        body: {
          active: true,
          startedAt: sessionStart.toISOString(),
          duration: 2700, // 45 minutes in seconds
        },
      }).as('sessionStatus');

      cy.visit('/settings/security');

      cy.wait('@sessionStatus');

      cy.get('[data-testid="session-duration"]')
        .should('be.visible')
        .and('contain', '45');
    });

    it('should log session start and end events', () => {
      cy.intercept('POST', '/api/auth/session/log', {
        statusCode: 200,
        body: { logged: true },
      }).as('logSession');

      // Session start should be logged on login
      cy.clearAllLocalStorage();
      cy.visit('/login');

      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          user: { id: 'user-123', email: 'user@test.com' },
          token: 'auth-token',
        },
      }).as('login');

      cy.get('[data-testid="email-input"]').type('user@test.com');
      cy.get('[data-testid="password-input"]').type('Password123!');
      cy.get('[data-testid="login-button"]').click();

      cy.wait('@login');
      cy.wait('@logSession');
    });
  });
});
