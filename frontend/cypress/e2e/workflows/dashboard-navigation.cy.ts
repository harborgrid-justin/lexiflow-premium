/// <reference types="cypress" />

/**
 * E2E Test Suite: Dashboard and Navigation
 *
 * Tests application navigation and dashboard functionality including:
 * - Dashboard widget loading and interaction
 * - Navigation between different modules
 * - Sidebar navigation and menu interactions
 * - Breadcrumb navigation
 * - Quick actions and shortcuts
 */

describe('Dashboard and Navigation Workflow', () => {
  beforeEach(() => {
    cy.login('attorney@firm.com', 'password123');
    cy.setupTestUser('attorney');
  });

  afterEach(() => {
    cy.logout();
  });

  describe('Dashboard Widgets Load', () => {
    beforeEach(() => {
      // Mock dashboard data
      cy.intercept('GET', '/api/dashboard/widgets', {
        statusCode: 200,
        body: {
          stats: {
            activeCases: 12,
            upcomingDeadlines: 5,
            unbilledHours: 42.5,
            pendingTasks: 8
          },
          recentActivity: [
            {
              id: 'activity-001',
              type: 'case_update',
              title: 'Case status changed',
              description: 'Smith v. Johnson Industries moved to Discovery',
              timestamp: '2024-12-20T10:00:00Z',
              user: 'Jane Doe'
            },
            {
              id: 'activity-002',
              type: 'document_uploaded',
              title: 'Document uploaded',
              description: 'Complaint filed in Anderson case',
              timestamp: '2024-12-20T09:30:00Z',
              user: 'Robert Chen'
            }
          ],
          upcomingDeadlines: [
            {
              id: 'deadline-001',
              title: 'Response to Discovery Requests',
              case: 'Smith v. Johnson Industries',
              dueDate: '2024-12-25',
              priority: 'high'
            },
            {
              id: 'deadline-002',
              title: 'File Motion to Compel',
              case: 'People v. Anderson',
              dueDate: '2024-12-28',
              priority: 'medium'
            }
          ],
          billingSnapshot: {
            thisMonth: 15250,
            lastMonth: 18500,
            unbilledTime: 1925
          }
        }
      }).as('getDashboardWidgets');

      cy.visit('/#/dashboard');
    });

    it('should load all dashboard widgets successfully', () => {
      cy.wait('@getDashboardWidgets');

      // Verify KPI widgets loaded
      cy.get('[data-testid="kpi-widget-active-cases"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="kpi-value"]')
            .should('contain', '12');

          cy.get('[data-testid="kpi-label"]')
            .should('contain', 'Active Cases');
        });

      cy.get('[data-testid="kpi-widget-upcoming-deadlines"]')
        .should('be.visible')
        .and('contain', '5');

      cy.get('[data-testid="kpi-widget-unbilled-hours"]')
        .should('be.visible')
        .and('contain', '42.5');

      cy.get('[data-testid="kpi-widget-pending-tasks"]')
        .should('be.visible')
        .and('contain', '8');
    });

    it('should display recent activity feed', () => {
      cy.wait('@getDashboardWidgets');

      cy.get('[data-testid="recent-activity-widget"]')
        .should('be.visible')
        .within(() => {
          // Verify widget title
          cy.get('[data-testid="widget-title"]')
            .should('contain', 'Recent Activity');

          // Verify activity items
          cy.get('[data-testid="activity-item"]')
            .should('have.length', 2);

          // Verify first activity
          cy.get('[data-testid="activity-item"]')
            .first()
            .should('contain', 'Case status changed')
            .and('contain', 'Smith v. Johnson Industries')
            .and('contain', 'Jane Doe');
        });
    });

    it('should display upcoming deadlines widget', () => {
      cy.wait('@getDashboardWidgets');

      cy.get('[data-testid="deadlines-widget"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="widget-title"]')
            .should('contain', 'Upcoming Deadlines');

          // Verify deadline items
          cy.get('[data-testid="deadline-item"]')
            .should('have.length', 2);

          // Verify high priority deadline highlighted
          cy.get('[data-testid="deadline-item"]')
            .first()
            .should('contain', 'Response to Discovery Requests')
            .and('contain', 'Smith v. Johnson Industries')
            .within(() => {
              cy.get('[data-testid="priority-badge"]')
                .should('contain', 'High')
                .and('have.class', 'priority-high');
            });
        });
    });

    it('should display billing snapshot widget', () => {
      cy.wait('@getDashboardWidgets');

      cy.get('[data-testid="billing-snapshot-widget"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="this-month-revenue"]')
            .should('contain', '$15,250');

          cy.get('[data-testid="last-month-revenue"]')
            .should('contain', '$18,500');

          cy.get('[data-testid="unbilled-time-value"]')
            .should('contain', '$1,925');
        });
    });

    it('should click on KPI widget to navigate to detail view', () => {
      cy.wait('@getDashboardWidgets');

      // Mock cases API
      cy.intercept('GET', '/api/cases*', {
        fixture: 'cases.json'
      }).as('getCases');

      // Click on active cases KPI
      cy.get('[data-testid="kpi-widget-active-cases"]')
        .click();

      // Verify navigation to cases page
      cy.url().should('include', '/cases');
      cy.wait('@getCases');

      cy.get('[data-testid="case-list-container"]')
        .should('be.visible');
    });

    it('should click on activity item to navigate to related page', () => {
      cy.wait('@getDashboardWidgets');

      // Mock case detail API
      cy.intercept('GET', '/api/cases/case-001', {
        fixture: 'cases.json'
      }).as('getCaseDetail');

      // Click on first activity item
      cy.get('[data-testid="activity-item"]')
        .first()
        .click();

      // Verify navigation to case detail
      cy.url().should('include', '/case/');
    });

    it('should refresh dashboard widgets', () => {
      cy.wait('@getDashboardWidgets');

      // Click refresh button
      cy.get('[data-testid="refresh-dashboard-button"]')
        .click();

      // Verify API called again
      cy.wait('@getDashboardWidgets');

      // Verify loading state shown briefly
      cy.get('[data-testid="dashboard-loading"]')
        .should('not.exist'); // Should complete quickly
    });

    it('should handle widget loading errors gracefully', () => {
      // Mock API error
      cy.intercept('GET', '/api/dashboard/widgets', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getDashboardError');

      cy.reload();
      cy.wait('@getDashboardError');

      // Verify error message displayed
      cy.get('[data-testid="dashboard-error"]')
        .should('be.visible')
        .and('contain', 'Unable to load dashboard');

      // Verify retry button available
      cy.get('[data-testid="retry-dashboard-button"]')
        .should('be.visible');
    });
  });

  describe('Navigation Between Modules', () => {
    beforeEach(() => {
      cy.visit('/#/dashboard');

      // Mock basic APIs for each module
      cy.intercept('GET', '/api/cases*', { fixture: 'cases.json' }).as('getCases');
      cy.intercept('GET', '/api/documents*', { body: [] }).as('getDocuments');
      cy.intercept('GET', '/api/billing/invoices*', { body: [] }).as('getInvoices');
      cy.intercept('GET', '/api/discovery/custodians*', { body: [] }).as('getCustodians');
      cy.intercept('GET', '/api/crm/clients*', { body: [] }).as('getClients');
    });

    it('should navigate to Cases module', () => {
      // Click on Cases in main navigation
      cy.get('[data-testid="nav-cases"]')
        .click();

      cy.wait('@getCases');

      // Verify URL
      cy.url().should('include', '/cases');

      // Verify page loaded
      cy.get('[data-testid="case-list-container"]')
        .should('be.visible');

      // Verify active nav item
      cy.get('[data-testid="nav-cases"]')
        .should('have.class', 'active');
    });

    it('should navigate to Documents module', () => {
      cy.get('[data-testid="nav-documents"]')
        .click();

      cy.wait('@getDocuments');

      cy.url().should('include', '/documents');

      cy.get('[data-testid="documents-page"]')
        .should('be.visible');
    });

    it('should navigate to Billing module', () => {
      cy.get('[data-testid="nav-billing"]')
        .click();

      cy.url().should('include', '/billing');

      // Verify billing sub-navigation
      cy.get('[data-testid="billing-subnav"]')
        .should('be.visible')
        .within(() => {
          cy.contains('Time Entries').should('be.visible');
          cy.contains('Invoices').should('be.visible');
          cy.contains('Reports').should('be.visible');
        });
    });

    it('should navigate to Discovery module', () => {
      cy.get('[data-testid="nav-discovery"]')
        .click();

      cy.wait('@getCustodians');

      cy.url().should('include', '/discovery');

      cy.get('[data-testid="discovery-page"]')
        .should('be.visible');
    });

    it('should navigate to CRM module', () => {
      cy.get('[data-testid="nav-crm"]')
        .click();

      cy.wait('@getClients');

      cy.url().should('include', '/crm');

      cy.get('[data-testid="crm-page"]')
        .should('be.visible');
    });

    it('should navigate back to Dashboard', () => {
      // Navigate to Cases first
      cy.get('[data-testid="nav-cases"]').click();
      cy.wait('@getCases');

      // Then back to Dashboard
      cy.get('[data-testid="nav-dashboard"]')
        .click();

      cy.url().should('include', '/dashboard');

      cy.get('[data-testid="dashboard-page"]')
        .should('be.visible');
    });

    it('should maintain state when navigating between modules', () => {
      // Navigate to cases and apply filter
      cy.get('[data-testid="nav-cases"]').click();
      cy.wait('@getCases');

      cy.get('[data-testid="case-status-filter"]')
        .select('Active');

      // Navigate away
      cy.get('[data-testid="nav-dashboard"]').click();

      // Navigate back to cases
      cy.get('[data-testid="nav-cases"]').click();

      // Verify filter still applied (depends on implementation)
      cy.url().should('include', 'status=Active');
    });
  });

  describe('Sidebar Navigation', () => {
    beforeEach(() => {
      cy.visit('/#/dashboard');
    });

    it('should toggle sidebar open and closed', () => {
      // Verify sidebar is open by default
      cy.get('[data-testid="sidebar"]')
        .should('be.visible')
        .and('have.class', 'expanded');

      // Click toggle button
      cy.get('[data-testid="sidebar-toggle"]')
        .click();

      // Verify sidebar collapsed
      cy.get('[data-testid="sidebar"]')
        .should('have.class', 'collapsed');

      // Verify only icons visible
      cy.get('[data-testid="nav-item-label"]')
        .should('not.be.visible');

      // Toggle back open
      cy.get('[data-testid="sidebar-toggle"]')
        .click();

      cy.get('[data-testid="sidebar"]')
        .should('have.class', 'expanded');

      cy.get('[data-testid="nav-item-label"]')
        .should('be.visible');
    });

    it('should expand sidebar section on hover when collapsed', () => {
      // Collapse sidebar
      cy.get('[data-testid="sidebar-toggle"]').click();

      // Hover over nav item
      cy.get('[data-testid="nav-cases"]')
        .trigger('mouseenter');

      // Verify tooltip or flyout appears
      cy.get('[data-testid="nav-tooltip"]')
        .should('be.visible')
        .and('contain', 'Cases');
    });

    it('should display user profile in sidebar', () => {
      cy.get('[data-testid="sidebar-user-profile"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="user-avatar"]')
            .should('be.visible');

          cy.get('[data-testid="user-name"]')
            .should('contain', 'Test User');

          cy.get('[data-testid="user-role"]')
            .should('contain', 'Attorney');
        });
    });

    it('should open user menu from sidebar', () => {
      cy.get('[data-testid="sidebar-user-profile"]')
        .click();

      // Verify user menu appears
      cy.get('[data-testid="user-menu"]')
        .should('be.visible')
        .within(() => {
          cy.contains('Profile').should('be.visible');
          cy.contains('Settings').should('be.visible');
          cy.contains('Logout').should('be.visible');
        });
    });

    it('should navigate using keyboard shortcuts', () => {
      // Press keyboard shortcut for Cases (e.g., Alt+C)
      cy.get('body').type('{alt}c');

      // Verify navigation
      cy.url().should('include', '/cases');
    });

    it('should highlight active module in sidebar', () => {
      // Navigate to Cases
      cy.get('[data-testid="nav-cases"]').click();

      // Verify Cases nav item is active
      cy.get('[data-testid="nav-cases"]')
        .should('have.class', 'active')
        .and('have.attr', 'aria-current', 'page');

      // Verify other items not active
      cy.get('[data-testid="nav-documents"]')
        .should('not.have.class', 'active');
    });

    it('should show notification badges on nav items', () => {
      // Mock notifications
      cy.intercept('GET', '/api/notifications/count', {
        statusCode: 200,
        body: {
          cases: 3,
          documents: 0,
          tasks: 5
        }
      }).as('getNotificationCount');

      cy.reload();
      cy.wait('@getNotificationCount');

      // Verify badge on Cases
      cy.get('[data-testid="nav-cases"]')
        .find('[data-testid="notification-badge"]')
        .should('be.visible')
        .and('contain', '3');

      // Verify badge on Tasks
      cy.get('[data-testid="nav-tasks"]')
        .find('[data-testid="notification-badge"]')
        .should('contain', '5');
    });
  });

  describe('Breadcrumb Navigation', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/cases*', { fixture: 'cases.json' }).as('getCases');
      cy.intercept('GET', '/api/cases/case-001', {
        statusCode: 200,
        body: {
          id: 'case-001',
          title: 'Smith v. Johnson Industries',
          caseNumber: '2024-CV-12345'
        }
      }).as('getCaseDetail');
    });

    it('should display breadcrumb navigation on detail pages', () => {
      // Navigate to case detail
      cy.visit('/#/case/case-001');
      cy.wait('@getCaseDetail');

      // Verify breadcrumb
      cy.get('[data-testid="breadcrumb"]')
        .should('be.visible')
        .within(() => {
          // Home/Dashboard
          cy.get('[data-testid="breadcrumb-item"]')
            .first()
            .should('contain', 'Dashboard');

          // Cases
          cy.get('[data-testid="breadcrumb-item"]')
            .eq(1)
            .should('contain', 'Cases');

          // Current case
          cy.get('[data-testid="breadcrumb-item"]')
            .last()
            .should('contain', 'Smith v. Johnson Industries')
            .and('have.attr', 'aria-current', 'page');
        });
    });

    it('should navigate using breadcrumb links', () => {
      cy.visit('/#/case/case-001');
      cy.wait('@getCaseDetail');

      // Click on Cases breadcrumb
      cy.get('[data-testid="breadcrumb-item"]')
        .contains('Cases')
        .click();

      cy.wait('@getCases');

      // Verify navigation to cases list
      cy.url().should('include', '/cases');
      cy.get('[data-testid="case-list-container"]')
        .should('be.visible');
    });

    it('should navigate to dashboard using breadcrumb home', () => {
      cy.visit('/#/case/case-001');
      cy.wait('@getCaseDetail');

      // Click Dashboard breadcrumb
      cy.get('[data-testid="breadcrumb-item"]')
        .first()
        .click();

      cy.url().should('include', '/dashboard');
    });

    it('should show truncated breadcrumbs for long paths', () => {
      // Navigate deep into hierarchy
      cy.visit('/#/case/case-001/documents/doc-001');

      cy.get('[data-testid="breadcrumb"]')
        .should('be.visible');

      // Verify ellipsis for middle items if path is too long
      // (Implementation may vary)
      cy.get('[data-testid="breadcrumb-item"]')
        .should('have.length.greaterThan', 1);
    });
  });

  describe('Quick Actions', () => {
    beforeEach(() => {
      cy.visit('/#/dashboard');

      // Mock quick action APIs
      cy.intercept('POST', '/api/cases', {
        statusCode: 201,
        body: { id: 'case-new' }
      }).as('createCase');

      cy.intercept('POST', '/api/time-entries', {
        statusCode: 201,
        body: { id: 'time-new' }
      }).as('createTimeEntry');
    });

    it('should display quick actions menu', () => {
      // Click quick actions button
      cy.get('[data-testid="quick-actions-button"]')
        .should('be.visible')
        .click();

      // Verify menu appears
      cy.get('[data-testid="quick-actions-menu"]')
        .should('be.visible')
        .within(() => {
          cy.contains('New Case').should('be.visible');
          cy.contains('Add Time Entry').should('be.visible');
          cy.contains('Upload Document').should('be.visible');
          cy.contains('Create Invoice').should('be.visible');
          cy.contains('Add Task').should('be.visible');
        });
    });

    it('should create new case from quick action', () => {
      cy.get('[data-testid="quick-actions-button"]').click();

      cy.get('[data-testid="quick-action-new-case"]')
        .click();

      // Verify create case modal opens
      cy.get('[data-testid="create-case-modal"]')
        .should('be.visible');
    });

    it('should add time entry from quick action', () => {
      cy.get('[data-testid="quick-actions-button"]').click();

      cy.get('[data-testid="quick-action-add-time"]')
        .click();

      // Verify time entry modal opens
      cy.get('[data-testid="time-entry-modal"]')
        .should('be.visible');
    });

    it('should use keyboard shortcut for quick actions', () => {
      // Press quick action keyboard shortcut (e.g., Ctrl+K)
      cy.get('body').type('{ctrl}k');

      // Verify quick actions menu opens
      cy.get('[data-testid="quick-actions-menu"]')
        .should('be.visible');
    });

    it('should search and filter quick actions', () => {
      cy.get('[data-testid="quick-actions-button"]').click();

      // Type in search box
      cy.get('[data-testid="quick-actions-search"]')
        .type('case');

      // Verify filtered results
      cy.get('[data-testid="quick-actions-menu"]')
        .should('contain', 'New Case')
        .and('not.contain', 'Add Time Entry');
    });
  });

  describe('Global Search', () => {
    beforeEach(() => {
      cy.visit('/#/dashboard');

      // Mock search API
      cy.intercept('GET', '/api/search*', {
        statusCode: 200,
        body: {
          cases: [
            {
              id: 'case-001',
              title: 'Smith v. Johnson Industries',
              type: 'case'
            }
          ],
          documents: [
            {
              id: 'doc-001',
              name: 'Complaint.pdf',
              type: 'document'
            }
          ],
          clients: [
            {
              id: 'client-001',
              name: 'John Smith',
              type: 'client'
            }
          ]
        }
      }).as('search');
    });

    it('should perform global search', () => {
      // Click search box
      cy.get('[data-testid="global-search-input"]')
        .click()
        .type('smith');

      // Wait for debounced search
      cy.wait(500);
      cy.wait('@search');

      // Verify search results appear
      cy.get('[data-testid="search-results"]')
        .should('be.visible')
        .within(() => {
          // Verify grouped results
          cy.get('[data-testid="search-group-cases"]')
            .should('contain', 'Smith v. Johnson Industries');

          cy.get('[data-testid="search-group-clients"]')
            .should('contain', 'John Smith');
        });
    });

    it('should navigate to search result', () => {
      cy.intercept('GET', '/api/cases/case-001', {
        statusCode: 200,
        body: { id: 'case-001', title: 'Smith v. Johnson Industries' }
      }).as('getCaseDetail');

      cy.get('[data-testid="global-search-input"]')
        .type('smith');

      cy.wait(500);
      cy.wait('@search');

      // Click on search result
      cy.get('[data-testid="search-result-case-001"]')
        .click();

      cy.wait('@getCaseDetail');

      // Verify navigation
      cy.url().should('include', '/case/case-001');

      // Verify search closed
      cy.get('[data-testid="search-results"]')
        .should('not.exist');
    });

    it('should show recent searches', () => {
      // Perform a search
      cy.get('[data-testid="global-search-input"]')
        .type('smith{enter}');

      cy.wait('@search');

      // Clear search
      cy.get('[data-testid="clear-search-button"]')
        .click();

      // Focus search again
      cy.get('[data-testid="global-search-input"]')
        .click();

      // Verify recent searches shown
      cy.get('[data-testid="recent-searches"]')
        .should('be.visible')
        .and('contain', 'smith');
    });

    it('should use keyboard shortcut to open search', () => {
      // Press search shortcut (e.g., Ctrl+/)
      cy.get('body').type('{ctrl}/');

      // Verify search focused
      cy.get('[data-testid="global-search-input"]')
        .should('be.focused');
    });
  });

  describe('Responsive Navigation', () => {
    it('should show mobile menu on small screens', () => {
      // Set mobile viewport
      cy.viewport('iphone-x');

      cy.visit('/#/dashboard');

      // Verify sidebar hidden on mobile
      cy.get('[data-testid="sidebar"]')
        .should('not.be.visible');

      // Click mobile menu button
      cy.get('[data-testid="mobile-menu-button"]')
        .click();

      // Verify mobile menu appears
      cy.get('[data-testid="mobile-menu"]')
        .should('be.visible');
    });

    it('should close mobile menu after navigation', () => {
      cy.viewport('iphone-x');
      cy.visit('/#/dashboard');

      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.get('[data-testid="mobile-menu"]').should('be.visible');

      // Navigate to Cases
      cy.get('[data-testid="mobile-nav-cases"]').click();

      // Verify menu closes
      cy.get('[data-testid="mobile-menu"]')
        .should('not.be.visible');

      // Verify navigation occurred
      cy.url().should('include', '/cases');
    });
  });
});
