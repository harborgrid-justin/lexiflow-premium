/**
 * @jest-environment jsdom
 * ProfilePage Component Tests
 * Enterprise-grade tests for user profile page
 */

import { render, screen } from '@testing-library/react';
import { ProfilePage } from './ProfilePage';

// Mock dependencies
jest.mock('@/features/profile/UserProfileManager', () => ({
  UserProfileManager: () => <div data-testid="user-profile-manager">User Profile Manager Content</div>,
}));

jest.mock('@/components/ui/layouts/PageContainerLayout/PageContainerLayout', () => ({
  PageContainerLayout: ({ children, maxWidth }: { children: React.ReactNode; maxWidth?: string }) => (
    <div data-testid="page-container" data-max-width={maxWidth}>{children}</div>
  ),
}));

describe('ProfilePage', () => {
  describe('Rendering', () => {
    it('renders PageContainerLayout', () => {
      render(<ProfilePage />);

      expect(screen.getByTestId('page-container')).toBeInTheDocument();
    });

    it('renders UserProfileManager inside container', () => {
      render(<ProfilePage />);

      expect(screen.getByTestId('user-profile-manager')).toBeInTheDocument();
    });

    it('renders profile manager content', () => {
      render(<ProfilePage />);

      expect(screen.getByText('User Profile Manager Content')).toBeInTheDocument();
    });
  });

  describe('Layout Configuration', () => {
    it('passes maxWidth of 5xl to PageContainerLayout', () => {
      render(<ProfilePage />);

      const container = screen.getByTestId('page-container');
      expect(container).toHaveAttribute('data-max-width', '5xl');
    });
  });

  describe('React.memo', () => {
    it('is wrapped in React.memo for performance', () => {
      // ProfilePage should be memoized
      expect(ProfilePage.$$typeof).toBeDefined();
    });
  });

  describe('Component Structure', () => {
    it('renders UserProfileManager as child of PageContainerLayout', () => {
      render(<ProfilePage />);

      const container = screen.getByTestId('page-container');
      const profileManager = screen.getByTestId('user-profile-manager');

      expect(container).toContainElement(profileManager);
    });
  });
});
