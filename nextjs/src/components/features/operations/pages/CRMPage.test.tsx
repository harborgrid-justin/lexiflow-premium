/**
 * @jest-environment jsdom
 * @module CRMPage.test
 * @description Enterprise-grade tests for CRMPage component
 *
 * Test coverage:
 * - Page rendering
 * - CRMDashboard integration
 * - PageContainerLayout wrapper
 * - React.memo optimization
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { CRMPage } from './CRMPage';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/features/operations/crm/CRMDashboard', () => ({
  CRMDashboard: () => (
    <div data-testid="crm-dashboard">
      <h1>Client Relationship Management</h1>
      <div data-testid="crm-content">
        <section data-testid="contacts-section">
          <h2>Contacts</h2>
          <p>Manage client contacts</p>
        </section>
        <section data-testid="clients-section">
          <h2>Clients</h2>
          <p>Active client management</p>
        </section>
        <section data-testid="leads-section">
          <h2>Leads</h2>
          <p>Lead tracking and conversion</p>
        </section>
      </div>
    </div>
  ),
}));

jest.mock('@/components/ui/layouts/PageContainerLayout/PageContainerLayout', () => ({
  PageContainerLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container-layout">{children}</div>
  ),
}));

// ============================================================================
// TEST SUITES
// ============================================================================

describe('CRMPage', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<CRMPage />);

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });

    it('renders CRMDashboard component', () => {
      render(<CRMPage />);

      expect(screen.getByTestId('crm-dashboard')).toBeInTheDocument();
    });

    it('wraps content in PageContainerLayout', () => {
      render(<CRMPage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout).toContainElement(screen.getByTestId('crm-dashboard'));
    });

    it('displays CRM heading', () => {
      render(<CRMPage />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Client Relationship Management');
    });

    it('renders CRM content', () => {
      render(<CRMPage />);

      expect(screen.getByTestId('crm-content')).toBeInTheDocument();
    });
  });

  describe('CRMDashboard Integration', () => {
    it('renders contacts section', () => {
      render(<CRMPage />);

      expect(screen.getByTestId('contacts-section')).toBeInTheDocument();
      expect(screen.getByText('Manage client contacts')).toBeInTheDocument();
    });

    it('renders clients section', () => {
      render(<CRMPage />);

      expect(screen.getByTestId('clients-section')).toBeInTheDocument();
      expect(screen.getByText('Active client management')).toBeInTheDocument();
    });

    it('renders leads section', () => {
      render(<CRMPage />);

      expect(screen.getByTestId('leads-section')).toBeInTheDocument();
      expect(screen.getByText('Lead tracking and conversion')).toBeInTheDocument();
    });

    it('renders all section headings', () => {
      render(<CRMPage />);

      expect(screen.getByText('Contacts')).toBeInTheDocument();
      expect(screen.getByText('Clients')).toBeInTheDocument();
      expect(screen.getByText('Leads')).toBeInTheDocument();
    });
  });

  describe('React.memo Optimization', () => {
    it('is memoized for performance', () => {
      expect(CRMPage).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('re-renders correctly on multiple renders', () => {
      const { rerender } = render(<CRMPage />);

      rerender(<CRMPage />);
      rerender(<CRMPage />);

      expect(screen.getByTestId('crm-dashboard')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('maintains correct component hierarchy', () => {
      const { container } = render(<CRMPage />);

      expect(container.firstChild).toHaveAttribute('data-testid', 'page-container-layout');
    });

    it('renders single child in layout', () => {
      render(<CRMPage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout.children).toHaveLength(1);
    });
  });

  describe('Accessibility', () => {
    it('renders main heading element', () => {
      render(<CRMPage />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('renders section headings', () => {
      render(<CRMPage />);

      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements).toHaveLength(3);
    });

    it('has proper content structure', () => {
      render(<CRMPage />);

      const sections = screen.getAllByRole('region');
      expect(sections).toHaveLength(3);
    });
  });
});
