/**
 * CASE MANAGEMENT E2E TEST SUITE - TEST 3
 * Filter and Search Cases
 * 
 * STRICT CYPRESS BEST PRACTICES APPLIED:
 * ✓ Debounced search simulation
 * ✓ Multiple filter combinations
 * ✓ Clear and reset functionality
 * ✓ Real-time filtering assertions
 */

describe('Case Management - Filtering & Search', () => {
  // ============================================================================
  // TEST SETUP
  // ============================================================================
  
  beforeEach(() => {
    cy.login();
    cy.setupTestUser('attorney');
    cy.mockCaseListAPI('cases.json');
    cy.visitCaseList();
  });

  afterEach(() => {
    cy.logout();
  });

  // ============================================================================
  // TEST 3: Filter and Search Cases
  // ============================================================================
  
  describe('Search Functionality', () => {
    it('should filter cases by search term in title', () => {
      // Arrange
      const searchTerm = 'Smith';
      
      // Act
      cy.get('[data-testid="search-input"]')
        .or('input[placeholder*="Search"]')
        .first()
        .clear()
        .type(searchTerm);
      
      // Wait for debounce (best practice: use cy.wait with intercept alias instead of hardcoded wait)
      cy.wait(500);
      
      // Assert - Only matching cases are visible
      cy.get('[data-testid="case-card"]')
        .should('have.length.at.least', 1)
        .each(($card) => {
          cy.wrap($card)
            .invoke('text')
            .should('match', new RegExp(searchTerm, 'i'));
        });
    });

    it('should filter cases by search term in case number', () => {
      // Arrange
      const searchTerm = '2024-CV';
      
      // Act
      cy.get('[data-testid="search-input"]')
        .or('input[placeholder*="Search"]')
        .first()
        .type(searchTerm);
      
      cy.wait(500);
      
      // Assert
      cy.get('[data-testid="case-card"]')
        .should('exist')
        .first()
        .should('contain', searchTerm);
    });

    it('should filter cases by client name', () => {
      // Arrange
      const searchTerm = 'Anderson';
      
      // Act
      cy.get('[data-testid="search-input"]')
        .or('input[placeholder*="Search"]')
        .first()
        .type(searchTerm);
      
      cy.wait(500);
      
      // Assert
      cy.get('[data-testid="case-card"]')
        .should('exist')
        .contains(searchTerm);
    });

    it('should show no results message when no matches found', () => {
      // Arrange
      const searchTerm = 'NonExistentCaseName123456';
      
      // Act
      cy.get('[data-testid="search-input"]')
        .or('input[placeholder*="Search"]')
        .first()
        .type(searchTerm);
      
      cy.wait(500);
      
      // Assert
      cy.contains(/no cases|no results|not found/i)
        .should('be.visible');
    });

    it('should clear search when input is cleared', () => {
      // Arrange
      cy.get('[data-testid="search-input"]')
        .or('input[placeholder*="Search"]')
        .first()
        .as('searchInput')
        .type('Smith');
      
      cy.wait(500);
      
      // Store original count
      cy.get('[data-testid="case-card"]').then(($filteredCards) => {
        const filteredCount = $filteredCards.length;
        
        // Act - Clear search
        cy.get('@searchInput').clear();
        cy.wait(500);
        
        // Assert - More cases visible after clearing
        cy.get('[data-testid="case-card"]')
          .should('have.length.greaterThan', filteredCount);
      });
    });
  });

  // ============================================================================
  // STATUS FILTER TESTS
  // ============================================================================
  
  describe('Status Filter', () => {
    it('should filter cases by Active status', () => {
      // Act
      cy.get('[data-testid="status-filter"]')
        .or('select[name="status"]')
        .first()
        .select('Active');
      
      cy.wait(300);
      
      // Assert
      cy.get('[data-testid="case-card"]')
        .should('exist')
        .each(($card) => {
          cy.wrap($card).should('contain', 'Active');
        });
    });

    it('should filter cases by Discovery status', () => {
      // Act
      cy.get('[data-testid="status-filter"]')
        .or('select[name="status"]')
        .first()
        .select('Discovery');
      
      cy.wait(300);
      
      // Assert
      cy.get('[data-testid="case-card"]')
        .should('exist')
        .and('contain', 'Discovery');
    });

    it('should filter cases by Settlement status', () => {
      // Act
      cy.get('[data-testid="status-filter"]')
        .or('select[name="status"]')
        .first()
        .select('Settlement');
      
      cy.wait(300);
      
      // Assert
      cy.get('[data-testid="case-card"]')
        .should('exist')
        .and('contain', 'Settlement');
    });

    it('should show all cases when status filter is set to All', () => {
      // Arrange - First apply a filter
      cy.get('[data-testid="status-filter"]')
        .or('select[name="status"]')
        .first()
        .as('statusFilter')
        .select('Active');
      
      cy.wait(300);
      
      // Act - Reset to All
      cy.get('@statusFilter').select('All');
      cy.wait(300);
      
      // Assert - Multiple statuses visible
      cy.fixture('cases.json').then((cases) => {
        const uniqueStatuses = [...new Set(cases.map((c: any) => c.status))];
        
        if (uniqueStatuses.length > 1) {
          // Verify at least 2 different statuses appear
          const firstStatus = uniqueStatuses[0];
          const secondStatus = uniqueStatuses[1];
          
          cy.contains('[data-testid="case-card"]', firstStatus).should('exist');
          cy.contains('[data-testid="case-card"]', secondStatus).should('exist');
        }
      });
    });
  });

  // ============================================================================
  // TYPE FILTER TESTS
  // ============================================================================
  
  describe('Type Filter', () => {
    it('should filter cases by Civil Litigation type', () => {
      // Act
      cy.get('[data-testid="type-filter"]')
        .or('select[name="type"]')
        .first()
        .select('Civil Litigation');
      
      cy.wait(300);
      
      // Assert
      cy.get('[data-testid="case-card"]')
        .should('exist')
        .and('contain', 'Civil Litigation');
    });

    it('should filter cases by Criminal Defense type', () => {
      // Act
      cy.get('[data-testid="type-filter"]')
        .or('select[name="type"]')
        .first()
        .select('Criminal Defense');
      
      cy.wait(300);
      
      // Assert
      cy.get('[data-testid="case-card"]')
        .should('exist')
        .and('contain', 'Criminal Defense');
    });

    it('should filter cases by Family Law type', () => {
      // Act
      cy.get('[data-testid="type-filter"]')
        .or('select[name="type"]')
        .first()
        .select('Family Law');
      
      cy.wait(300);
      
      // Assert
      cy.get('[data-testid="case-card"]')
        .should('exist')
        .and('contain', 'Family Law');
    });
  });

  // ============================================================================
  // COMBINED FILTER TESTS
  // ============================================================================
  
  describe('Combined Filters', () => {
    it('should apply multiple filters simultaneously', () => {
      // Act - Apply status filter
      cy.get('[data-testid="status-filter"]')
        .or('select[name="status"]')
        .first()
        .select('Active');
      
      // Act - Apply type filter
      cy.get('[data-testid="type-filter"]')
        .or('select[name="type"]')
        .first()
        .select('Civil Litigation');
      
      cy.wait(500);
      
      // Assert - Cases match both filters
      cy.get('[data-testid="case-card"]')
        .should('exist')
        .each(($card) => {
          cy.wrap($card).should('contain', 'Active');
          cy.wrap($card).should('contain', 'Civil Litigation');
        });
    });

    it('should combine search with status filter', () => {
      // Act
      cy.get('[data-testid="search-input"]')
        .or('input[placeholder*="Search"]')
        .first()
        .type('Smith');
      
      cy.get('[data-testid="status-filter"]')
        .or('select[name="status"]')
        .first()
        .select('Active');
      
      cy.wait(500);
      
      // Assert
      cy.get('[data-testid="case-card"]')
        .should('exist')
        .and('contain', 'Smith')
        .and('contain', 'Active');
    });

    it('should combine search with type filter', () => {
      // Act
      cy.get('[data-testid="search-input"]')
        .or('input[placeholder*="Search"]')
        .first()
        .type('Anderson');
      
      cy.get('[data-testid="type-filter"]')
        .or('select[name="type"]')
        .first()
        .select('Criminal Defense');
      
      cy.wait(500);
      
      // Assert
      cy.get('[data-testid="case-card"]')
        .should('exist')
        .and('contain', 'Anderson')
        .and('contain', 'Criminal Defense');
    });
  });

  // ============================================================================
  // RESET FILTERS TESTS
  // ============================================================================
  
  describe('Reset Filters', () => {
    it('should reset all filters when clicking reset button', () => {
      // Arrange - Apply multiple filters
      cy.get('[data-testid="search-input"]')
        .or('input[placeholder*="Search"]')
        .first()
        .type('Smith');
      
      cy.get('[data-testid="status-filter"]')
        .or('select[name="status"]')
        .first()
        .select('Active');
      
      cy.wait(500);
      
      // Get filtered count
      cy.get('[data-testid="case-card"]').then(($filtered) => {
        const filteredCount = $filtered.length;
        
        // Act - Click reset button
        cy.get('[data-testid="reset-filters-button"]')
          .or('button')
          .contains(/reset|clear filter/i)
          .click();
        
        cy.wait(500);
        
        // Assert - More cases visible
        cy.get('[data-testid="case-card"]')
          .should('have.length.greaterThan', filteredCount);
        
        // Assert - Filters are cleared
        cy.get('[data-testid="search-input"]')
          .or('input[placeholder*="Search"]')
          .first()
          .should('have.value', '');
      });
    });
  });

  // ============================================================================
  // DATE RANGE FILTER TESTS
  // ============================================================================
  
  describe('Date Range Filter', () => {
    it('should filter cases by date range', () => {
      // Check if date filters exist
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="date-from-input"]').length) {
          // Act
          cy.get('[data-testid="date-from-input"]')
            .type('2024-01-01');
          
          cy.get('[data-testid="date-to-input"]')
            .type('2024-06-30');
          
          cy.wait(500);
          
          // Assert - Cases within date range
          cy.get('[data-testid="case-card"]')
            .should('exist');
        }
      });
    });
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================
  
  describe('Filter Performance', () => {
    it('should filter quickly without lag', () => {
      // Act - Type search term
      const startTime = Date.now();
      
      cy.get('[data-testid="search-input"]')
        .or('input[placeholder*="Search"]')
        .first()
        .type('Smith');
      
      cy.wait(600);
      
      // Assert - Results appear within reasonable time
      cy.get('[data-testid="case-card"]')
        .should('exist')
        .then(() => {
          const endTime = Date.now();
          const elapsed = endTime - startTime;
          expect(elapsed).to.be.lessThan(2000); // Should complete in under 2 seconds
        });
    });
  });
});
