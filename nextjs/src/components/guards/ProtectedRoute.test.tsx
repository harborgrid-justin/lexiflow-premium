/**
 * @fileoverview Enterprise-grade tests for ProtectedRoute component
 * @module components/guards/ProtectedRoute.test
 *
 * Tests authentication state handling, role-based access, permission checks,
 * and redirect behavior.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { ProtectedRoute, AdminRoute, AttorneyRoute, StaffRoute } from './ProtectedRoute';

// ============================================================================
// MOCKS
// ============================================================================

const mockNavigate = jest.fn();

// Mock react-router
jest.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock auth state
const mockUseAuthState = jest.fn();

jest.mock('@/providers/AuthProvider', () => ({
  useAuthState: () => mockUseAuthState(),
}));

// Mock window.location
const mockLocation = {
  pathname: '/protected-page',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// ============================================================================
// TEST UTILITIES
// ============================================================================

const ProtectedContent = () => <div data-testid="protected-content">Protected Content</div>;

const createAuthState = (overrides = {}) => ({
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'attorney',
    permissions: ['cases:read', 'cases:write'],
  },
  isLoading: false,
  isAuthenticated: true,
  ...overrides,
});

// ============================================================================
// SETUP & TEARDOWN
// ============================================================================

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuthState.mockReturnValue(createAuthState());
});

// ============================================================================
// AUTHENTICATION STATE TESTS
// ============================================================================

describe('ProtectedRoute', () => {
  describe('Authentication State', () => {
    it('renders children when user is authenticated', () => {
      render(
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('shows loading state while checking authentication', () => {
      mockUseAuthState.mockReturnValue(createAuthState({ isLoading: true }));

      render(
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      );

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('renders custom fallback during loading', () => {
      mockUseAuthState.mockReturnValue(createAuthState({ isLoading: true }));

      render(
        <ProtectedRoute fallback={<div data-testid="custom-loader">Custom Loading...</div>}>
          <ProtectedContent />
        </ProtectedRoute>
      );

      expect(screen.getByTestId('custom-loader')).toBeInTheDocument();
    });

    it('returns null when not authenticated', () => {
      mockUseAuthState.mockReturnValue(createAuthState({
        isAuthenticated: false,
        user: null,
      }));

      const { container } = render(
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      );

      expect(container.firstChild).toBeNull();
    });
  });

  // ============================================================================
  // REDIRECT BEHAVIOR TESTS
  // ============================================================================

  describe('Redirect Behavior', () => {
    it('redirects to login when not authenticated', () => {
      mockUseAuthState.mockReturnValue(createAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      }));

      render(
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('/login?redirect='),
        { replace: true }
      );
    });

    it('uses custom redirect path when provided', () => {
      mockUseAuthState.mockReturnValue(createAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      }));

      render(
        <ProtectedRoute redirectTo="/custom-login">
          <ProtectedContent />
        </ProtectedRoute>
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('/custom-login'),
        { replace: true }
      );
    });

    it('includes current path in redirect URL', () => {
      mockLocation.pathname = '/admin/settings';
      mockUseAuthState.mockReturnValue(createAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      }));

      render(
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent('/admin/settings')),
        { replace: true }
      );
    });

    it('does not redirect while loading', () => {
      mockUseAuthState.mockReturnValue(createAuthState({ isLoading: true }));

      render(
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      );

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // ROLE-BASED ACCESS TESTS
  // ============================================================================

  describe('Role-Based Access', () => {
    it('renders content when user has required role', () => {
      mockUseAuthState.mockReturnValue(createAuthState({
        user: { ...createAuthState().user, role: 'admin' },
      }));

      render(
        <ProtectedRoute requiredRoles={['admin']}>
          <ProtectedContent />
        </ProtectedRoute>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('redirects to dashboard when user lacks required role', () => {
      mockUseAuthState.mockReturnValue(createAuthState({
        user: { ...createAuthState().user, role: 'paralegal' },
      }));

      render(
        <ProtectedRoute requiredRoles={['admin']}>
          <ProtectedContent />
        </ProtectedRoute>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });

    it('allows access when user has any of the required roles', () => {
      mockUseAuthState.mockReturnValue(createAuthState({
        user: { ...createAuthState().user, role: 'attorney' },
      }));

      render(
        <ProtectedRoute requiredRoles={['admin', 'attorney']}>
          <ProtectedContent />
        </ProtectedRoute>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('returns null when role check fails (render phase)', () => {
      mockUseAuthState.mockReturnValue(createAuthState({
        user: { ...createAuthState().user, role: 'client' },
      }));

      const { container } = render(
        <ProtectedRoute requiredRoles={['admin']}>
          <ProtectedContent />
        </ProtectedRoute>
      );

      expect(container.firstChild).toBeNull();
    });
  });

  // ============================================================================
  // PERMISSION-BASED ACCESS TESTS
  // ============================================================================

  describe('Permission-Based Access', () => {
    it('renders content when user has any required permission (default)', () => {
      mockUseAuthState.mockReturnValue(createAuthState({
        user: {
          ...createAuthState().user,
          permissions: ['cases:read'],
        },
      }));

      render(
        <ProtectedRoute requiredPermissions={['cases:read', 'cases:write']}>
          <ProtectedContent />
        </ProtectedRoute>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('requires all permissions when requireAllPermissions is true', () => {
      mockUseAuthState.mockReturnValue(createAuthState({
        user: {
          ...createAuthState().user,
          permissions: ['cases:read'],
        },
      }));

      const { container } = render(
        <ProtectedRoute
          requiredPermissions={['cases:read', 'cases:write']}
          requireAllPermissions={true}
        >
          <ProtectedContent />
        </ProtectedRoute>
      );

      expect(container.firstChild).toBeNull();
    });

    it('allows access when user has all required permissions', () => {
      mockUseAuthState.mockReturnValue(createAuthState({
        user: {
          ...createAuthState().user,
          permissions: ['cases:read', 'cases:write', 'documents:read'],
        },
      }));

      render(
        <ProtectedRoute
          requiredPermissions={['cases:read', 'cases:write']}
          requireAllPermissions={true}
        >
          <ProtectedContent />
        </ProtectedRoute>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('redirects to dashboard when permission check fails', () => {
      mockUseAuthState.mockReturnValue(createAuthState({
        user: {
          ...createAuthState().user,
          permissions: ['documents:read'],
        },
      }));

      render(
        <ProtectedRoute requiredPermissions={['admin:manage']}>
          <ProtectedContent />
        </ProtectedRoute>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  // ============================================================================
  // LOADING STATE TESTS
  // ============================================================================

  describe('Loading State', () => {
    it('displays default loading spinner', () => {
      mockUseAuthState.mockReturnValue(createAuthState({ isLoading: true }));

      render(
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      );

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('displays loading spinner with animation class', () => {
      mockUseAuthState.mockReturnValue(createAuthState({ isLoading: true }));

      render(
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      );

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });
});

// ============================================================================
// CONVENIENCE COMPONENT TESTS
// ============================================================================

describe('AdminRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children for admin users', () => {
    mockUseAuthState.mockReturnValue(createAuthState({
      user: { ...createAuthState().user, role: 'admin' },
    }));

    render(
      <AdminRoute>
        <ProtectedContent />
      </AdminRoute>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('denies access to non-admin users', () => {
    mockUseAuthState.mockReturnValue(createAuthState({
      user: { ...createAuthState().user, role: 'paralegal' },
    }));

    const { container } = render(
      <AdminRoute>
        <ProtectedContent />
      </AdminRoute>
    );

    expect(container.firstChild).toBeNull();
  });
});

describe('AttorneyRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children for attorney users', () => {
    mockUseAuthState.mockReturnValue(createAuthState({
      user: { ...createAuthState().user, role: 'attorney' },
    }));

    render(
      <AttorneyRoute>
        <ProtectedContent />
      </AttorneyRoute>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('renders children for admin users', () => {
    mockUseAuthState.mockReturnValue(createAuthState({
      user: { ...createAuthState().user, role: 'admin' },
    }));

    render(
      <AttorneyRoute>
        <ProtectedContent />
      </AttorneyRoute>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('denies access to paralegal users', () => {
    mockUseAuthState.mockReturnValue(createAuthState({
      user: { ...createAuthState().user, role: 'paralegal' },
    }));

    const { container } = render(
      <AttorneyRoute>
        <ProtectedContent />
      </AttorneyRoute>
    );

    expect(container.firstChild).toBeNull();
  });
});

describe('StaffRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children for paralegal users', () => {
    mockUseAuthState.mockReturnValue(createAuthState({
      user: { ...createAuthState().user, role: 'paralegal' },
    }));

    render(
      <StaffRoute>
        <ProtectedContent />
      </StaffRoute>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('renders children for attorney users', () => {
    mockUseAuthState.mockReturnValue(createAuthState({
      user: { ...createAuthState().user, role: 'attorney' },
    }));

    render(
      <StaffRoute>
        <ProtectedContent />
      </StaffRoute>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('renders children for admin users', () => {
    mockUseAuthState.mockReturnValue(createAuthState({
      user: { ...createAuthState().user, role: 'admin' },
    }));

    render(
      <StaffRoute>
        <ProtectedContent />
      </StaffRoute>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('denies access to client users', () => {
    mockUseAuthState.mockReturnValue(createAuthState({
      user: { ...createAuthState().user, role: 'client' },
    }));

    const { container } = render(
      <StaffRoute>
        <ProtectedContent />
      </StaffRoute>
    );

    expect(container.firstChild).toBeNull();
  });
});
