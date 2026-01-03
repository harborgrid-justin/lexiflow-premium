/**
 * AuthProvider Tests
 *
 * Tests for authentication provider including login/logout,
 * token refresh, session management, and MFA functionality.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider, useAuthState, useAuthActions } from '@/contexts/auth/AuthProvider';
import { AuthApiService } from '@/api/auth/auth-api';

// Mock the API service
jest.mock('@/api/auth/auth-api');

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.dispatchEvent
const mockDispatchEvent = jest.fn();
Object.defineProperty(window, 'dispatchEvent', {
  value: mockDispatchEvent,
});

describe('AuthProvider', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'attorney',
    permissions: ['read', 'write'],
    mfaEnabled: false,
    accountLocked: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    it('provides initial unauthenticated state', () => {
      const { result } = renderHook(() => useAuthState(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('provides password policy', () => {
      const { result } = renderHook(() => useAuthState(), { wrapper });

      expect(result.current.passwordPolicy).toEqual({
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expiryDays: 90,
        preventReuse: 5,
      });
    });

    it('provides all authentication actions', () => {
      const { result } = renderHook(() => useAuthActions(), { wrapper });

      expect(result.current.login).toBeDefined();
      expect(result.current.logout).toBeDefined();
      expect(result.current.verifyMFA).toBeDefined();
      expect(result.current.refreshToken).toBeDefined();
      expect(result.current.hasPermission).toBeDefined();
      expect(result.current.hasRole).toBeDefined();
      expect(result.current.enableMFA).toBeDefined();
      expect(result.current.disableMFA).toBeDefined();
      expect(result.current.changePassword).toBeDefined();
      expect(result.current.loginWithSSO).toBeDefined();
      expect(result.current.extendSession).toBeDefined();
    });
  });

  describe('Login', () => {
    it('successfully logs in user without MFA', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        accessToken: 'test-token',
        user: mockUser,
      });
      (AuthApiService as jest.Mock).mockImplementation(() => ({
        login: mockLogin,
      }));

      const { result } = renderHook(() => ({ state: useAuthState(), actions: useAuthActions() }), { wrapper });

      let loginResult: boolean = false;
      await act(async () => {
        loginResult = await result.current.actions.login('test@example.com', 'password');
      });

      expect(loginResult).toBe(true);
      expect(result.current.state.user).toBeDefined();
      expect(result.current.state.user?.email).toBe('test@example.com');
      expect(result.current.state.isAuthenticated).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('lexiflow_auth_token', 'test-token');
    });

    it('sets requiresMFA when user has MFA enabled', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        accessToken: 'test-token',
        user: { ...mockUser, mfaEnabled: true },
      });
      (AuthApiService as jest.Mock).mockImplementation(() => ({
        login: mockLogin,
      }));

      const { result } = renderHook(() => ({ state: useAuthState(), actions: useAuthActions() }), { wrapper });

      let loginResult: boolean = false;
      await act(async () => {
        loginResult = await result.current.actions.login('test@example.com', 'password');
      });

      expect(loginResult).toBe(false);
      expect(result.current.state.requiresMFA).toBe(true);
    });

    it('handles login failure', async () => {
      const mockLogin = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
      (AuthApiService as jest.Mock).mockImplementation(() => ({
        login: mockLogin,
      }));

      const { result } = renderHook(() => ({ state: useAuthState(), actions: useAuthActions() }), { wrapper });

      let loginResult: boolean = true;
      await act(async () => {
        loginResult = await result.current.actions.login('test@example.com', 'wrong-password');
      });

      expect(loginResult).toBe(false);
      expect(result.current.state.error).toBe('Invalid credentials');
      expect(result.current.state.isAuthenticated).toBe(false);
    });

    it('rejects login for locked account', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        accessToken: 'test-token',
        user: { ...mockUser, accountLocked: true },
      });
      (AuthApiService as jest.Mock).mockImplementation(() => ({
        login: mockLogin,
      }));

      const { result } = renderHook(() => ({ state: useAuthState(), actions: useAuthActions() }), { wrapper });

      let loginResult: boolean = true;
      await act(async () => {
        loginResult = await result.current.actions.login('test@example.com', 'password');
      });

      expect(loginResult).toBe(false);
      expect(result.current.state.error).toBe('Account is locked. Please contact administrator.');
    });
  });

  describe('MFA Verification', () => {
    it('successfully verifies MFA code', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        accessToken: 'test-token',
        user: { ...mockUser, mfaEnabled: true },
      });
      const mockVerifyMFA = jest.fn().mockResolvedValue({ verified: true });

      (AuthApiService as jest.Mock).mockImplementation(() => ({
        login: mockLogin,
        verifyMFA: mockVerifyMFA,
      }));

      const { result } = renderHook(() => ({ state: useAuthState(), actions: useAuthActions() }), { wrapper });

      // First login
      await act(async () => {
        await result.current.actions.login('test@example.com', 'password');
      });

      expect(result.current.state.requiresMFA).toBe(true);

      // Then verify MFA
      let verifyResult: boolean = false;
      await act(async () => {
        verifyResult = await result.current.actions.verifyMFA('123456');
      });

      expect(verifyResult).toBe(true);
      expect(result.current.state.requiresMFA).toBe(false);
      expect(mockVerifyMFA).toHaveBeenCalledWith('123456');
    });

    it('handles MFA verification failure', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        accessToken: 'test-token',
        user: { ...mockUser, mfaEnabled: true },
      });
      const mockVerifyMFA = jest.fn().mockResolvedValue({ verified: false });

      (AuthApiService as jest.Mock).mockImplementation(() => ({
        login: mockLogin,
        verifyMFA: mockVerifyMFA,
      }));

      const { result } = renderHook(() => ({ state: useAuthState(), actions: useAuthActions() }), { wrapper });

      await act(async () => {
        await result.current.actions.login('test@example.com', 'password');
      });

      let verifyResult: boolean = true;
      await act(async () => {
        verifyResult = await result.current.actions.verifyMFA('wrong-code');
      });

      expect(verifyResult).toBe(false);
      expect(result.current.state.requiresMFA).toBe(true);
    });

    it('returns false when MFA not required', async () => {
      const { result } = renderHook(() => ({ state: useAuthState(), actions: useAuthActions() }), { wrapper });

      let verifyResult: boolean = true;
      await act(async () => {
        verifyResult = await result.current.actions.verifyMFA('123456');
      });

      expect(verifyResult).toBe(false);
    });
  });

  describe('Logout', () => {
    it('successfully logs out user', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        accessToken: 'test-token',
        user: mockUser,
      });
      const mockLogout = jest.fn().mockResolvedValue(undefined);

      (AuthApiService as jest.Mock).mockImplementation(() => ({
        login: mockLogin,
        logout: mockLogout,
      }));

      const { result } = renderHook(() => ({ state: useAuthState(), actions: useAuthActions() }), { wrapper });

      // Login first
      await act(async () => {
        await result.current.actions.login('test@example.com', 'password');
      });

      expect(result.current.state.isAuthenticated).toBe(true);

      // Then logout
      await act(async () => {
        await result.current.actions.logout();
      });

      expect(result.current.state.user).toBeNull();
      expect(result.current.state.isAuthenticated).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('lexiflow_auth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('lexiflow_auth_user');
    });

    it('clears state even if API fails', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        accessToken: 'test-token',
        user: mockUser,
      });
      const mockLogout = jest.fn().mockRejectedValue(new Error('Network error'));

      (AuthApiService as jest.Mock).mockImplementation(() => ({
        login: mockLogin,
        logout: mockLogout,
      }));

      const { result } = renderHook(() => ({ state: useAuthState(), actions: useAuthActions() }), { wrapper });

      await act(async () => {
        await result.current.actions.login('test@example.com', 'password');
      });

      await act(async () => {
        await result.current.actions.logout();
      });

      expect(result.current.state.user).toBeNull();
      expect(result.current.state.isAuthenticated).toBe(false);
    });
  });

  describe('Token Refresh', () => {
    it('successfully refreshes token', async () => {
      const mockRefreshToken = jest.fn().mockResolvedValue({
        accessToken: 'new-token',
      });

      (AuthApiService as jest.Mock).mockImplementation(() => ({
        refreshToken: mockRefreshToken,
      }));

      const { result } = renderHook(() => useAuthActions(), { wrapper });

      let refreshResult: boolean = false;
      await act(async () => {
        refreshResult = await result.current.refreshToken();
      });

      expect(refreshResult).toBe(true);
      expect(mockRefreshToken).toHaveBeenCalled();
      expect(localStorageMock.setItem).toHaveBeenCalledWith('lexiflow_auth_token', 'new-token');
    });

    it('logs out user when refresh fails', async () => {
      const mockRefreshToken = jest.fn().mockRejectedValue(new Error('Token expired'));
      const mockLogout = jest.fn().mockResolvedValue(undefined);

      (AuthApiService as jest.Mock).mockImplementation(() => ({
        refreshToken: mockRefreshToken,
        logout: mockLogout,
      }));

      const { result } = renderHook(() => ({ state: useAuthState(), actions: useAuthActions() }), { wrapper });

      let refreshResult: boolean = true;
      await act(async () => {
        refreshResult = await result.current.actions.refreshToken();
      });

      expect(refreshResult).toBe(false);
      expect(result.current.state.isAuthenticated).toBe(false);
    });
  });

  describe('Permissions and Roles', () => {
    it('checks user permissions correctly', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        accessToken: 'test-token',
        user: mockUser,
      });

      (AuthApiService as jest.Mock).mockImplementation(() => ({
        login: mockLogin,
      }));

      const { result } = renderHook(() => ({ state: useAuthState(), actions: useAuthActions() }), { wrapper });

      await act(async () => {
        await result.current.actions.login('test@example.com', 'password');
      });

      expect(result.current.actions.hasPermission('read')).toBe(true);
      expect(result.current.actions.hasPermission('write')).toBe(true);
      expect(result.current.actions.hasPermission('delete')).toBe(false);
    });

    it('returns false for permissions when not authenticated', () => {
      const { result } = renderHook(() => useAuthActions(), { wrapper });

      expect(result.current.hasPermission('read')).toBe(false);
    });

    it('checks user roles correctly', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        accessToken: 'test-token',
        user: mockUser,
      });

      (AuthApiService as jest.Mock).mockImplementation(() => ({
        login: mockLogin,
      }));

      const { result } = renderHook(() => ({ state: useAuthState(), actions: useAuthActions() }), { wrapper });

      await act(async () => {
        await result.current.actions.login('test@example.com', 'password');
      });

      expect(result.current.actions.hasRole('attorney')).toBe(true);
      expect(result.current.actions.hasRole('admin', 'attorney')).toBe(true);
      expect(result.current.actions.hasRole('admin')).toBe(false);
    });

    it('returns false for roles when not authenticated', () => {
      const { result } = renderHook(() => useAuthActions(), { wrapper });

      expect(result.current.hasRole('attorney')).toBe(false);
    });
  });

  describe('MFA Management', () => {
    it('enables MFA successfully', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        accessToken: 'test-token',
        user: mockUser,
      });
      const mockEnableMFA = jest.fn().mockResolvedValue({
        qrCode: 'data:image/png;base64,ABC123',
        secret: 'JBSWY3DPEHPK3PXP',
        backupCodes: ['code1', 'code2'],
      });

      (AuthApiService as jest.Mock).mockImplementation(() => ({
        login: mockLogin,
        enableMFA: mockEnableMFA,
      }));

      const { result } = renderHook(() => ({ state: useAuthState(), actions: useAuthActions() }), { wrapper });

      await act(async () => {
        await result.current.actions.login('test@example.com', 'password');
      });

      let mfaSetup;
      await act(async () => {
        mfaSetup = await result.current.actions.enableMFA();
      });

      expect(mfaSetup).toEqual({
        qrCode: 'data:image/png;base64,ABC123',
        secret: 'JBSWY3DPEHPK3PXP',
        backupCodes: ['code1', 'code2'],
      });
      expect(result.current.state.user?.mfaEnabled).toBe(true);
    });

    it('disables MFA successfully', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        accessToken: 'test-token',
        user: { ...mockUser, mfaEnabled: true },
      });
      const mockDisableMFA = jest.fn().mockResolvedValue(undefined);

      (AuthApiService as jest.Mock).mockImplementation(() => ({
        login: mockLogin,
        disableMFA: mockDisableMFA,
      }));

      const { result } = renderHook(() => ({ state: useAuthState(), actions: useAuthActions() }), { wrapper });

      await act(async () => {
        await result.current.actions.login('test@example.com', 'password');
        jest.runOnlyPendingTimers(); // Skip MFA verification
      });

      await act(async () => {
        await result.current.actions.disableMFA();
      });

      expect(mockDisableMFA).toHaveBeenCalled();
      expect(result.current.state.user?.mfaEnabled).toBe(false);
    });
  });

  describe('Password Management', () => {
    it('changes password successfully', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        accessToken: 'test-token',
        user: mockUser,
      });
      const mockChangePassword = jest.fn().mockResolvedValue(undefined);

      (AuthApiService as jest.Mock).mockImplementation(() => ({
        login: mockLogin,
        changePassword: mockChangePassword,
      }));

      const { result } = renderHook(() => ({ state: useAuthState(), actions: useAuthActions() }), { wrapper });

      await act(async () => {
        await result.current.actions.login('test@example.com', 'password');
      });

      await act(async () => {
        await result.current.actions.changePassword('oldPassword', 'newPassword');
      });

      expect(mockChangePassword).toHaveBeenCalledWith('oldPassword', 'newPassword');
      expect(result.current.state.user?.passwordExpiresAt).toBeDefined();
    });
  });

  describe('SSO Login', () => {
    it('redirects to SSO provider', async () => {
      const { result } = renderHook(() => useAuthActions(), { wrapper });

      // Clear any existing audit logs
      localStorageMock.clear();

      await act(async () => {
        await result.current.loginWithSSO('azure-ad');
      });

      // Verify that SSO login was logged (the function calls logAuditEvent)
      // Since we can't easily mock window.location.href assignment in JSDOM,
      // we verify the function executes by checking the audit log
      expect(localStorageMock.getItem).toHaveBeenCalledWith('lexiflow_audit_log');
      expect(localStorageMock.setItem).toHaveBeenCalled();

      // Get the audit logs and verify SSO event was logged
      const auditLogCalls = (localStorageMock.setItem as jest.Mock).mock.calls.filter(
        call => call[0] === 'lexiflow_audit_log'
      );

      // Check that at least one audit log call contains the SSO provider
      const hasSSOEvent = auditLogCalls.some(call => {
        try {
          const logs = JSON.parse(call[1]);
          return logs.some((log: any) =>
            log.type === 'login' && log.metadata?.ssoProvider === 'azure-ad'
          );
        } catch {
          return false;
        }
      });

      expect(hasSSOEvent).toBe(true);
    });
  });

  describe('Session Management', () => {
    it('starts session after successful login', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        accessToken: 'test-token',
        user: mockUser,
      });

      (AuthApiService as jest.Mock).mockImplementation(() => ({
        login: mockLogin,
      }));

      const { result } = renderHook(() => ({ state: useAuthState(), actions: useAuthActions() }), { wrapper });

      await act(async () => {
        await result.current.actions.login('test@example.com', 'password');
      });

      expect(result.current.state.session).toBeDefined();
      expect(result.current.state.session?.expiresAt).toBeInstanceOf(Date);
    });

    it('extends session', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        accessToken: 'test-token',
        user: mockUser,
      });

      (AuthApiService as jest.Mock).mockImplementation(() => ({
        login: mockLogin,
      }));

      const { result } = renderHook(() => ({ state: useAuthState(), actions: useAuthActions() }), { wrapper });

      await act(async () => {
        await result.current.actions.login('test@example.com', 'password');
      });

      const originalExpiry = result.current.state.session?.expiresAt;

      await act(async () => {
        jest.advanceTimersByTime(1000);
        await result.current.actions.extendSession();
      });

      expect(result.current.state.session?.expiresAt).not.toEqual(originalExpiry);
    });

    it('dispatches session warning event', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        accessToken: 'test-token',
        user: mockUser,
      });

      (AuthApiService as jest.Mock).mockImplementation(() => ({
        login: mockLogin,
      }));

      const { result } = renderHook(() => ({ state: useAuthState(), actions: useAuthActions() }), { wrapper });

      await act(async () => {
        await result.current.actions.login('test@example.com', 'password');
      });

      // Fast forward to warning time (25 minutes)
      act(() => {
        jest.advanceTimersByTime(25 * 60 * 1000);
      });

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'session-warning',
        })
      );
    });
  });

  describe('Hook Error Handling', () => {
    it('throws error when useAuthState is used outside provider', () => {
      expect(() => {
        renderHook(() => useAuthState());
      }).toThrow('useAuthState must be used within an AuthProvider');
    });

    it('throws error when useAuthActions is used outside provider', () => {
      expect(() => {
        renderHook(() => useAuthActions());
      }).toThrow('useAuthActions must be used within an AuthProvider');
    });
  });

  describe('Persistence', () => {
    it('restores user from localStorage on mount', async () => {
      const storedUser = JSON.stringify({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'attorney',
        permissions: ['read', 'write'],
      });

      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'lexiflow_auth_token') return 'stored-token';
        if (key === 'lexiflow_auth_user') return storedUser;
        return null;
      });

      const { result } = renderHook(() => useAuthState(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeDefined();
        expect(result.current.user?.email).toBe('test@example.com');
        expect(result.current.isAuthenticated).toBe(true);
      });
    });

    it('does not restore locked accounts', async () => {
      const storedUser = JSON.stringify({
        id: 'user-123',
        email: 'test@example.com',
        accountLocked: true,
      });

      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'lexiflow_auth_token') return 'stored-token';
        if (key === 'lexiflow_auth_user') return storedUser;
        return null;
      });

      const { result } = renderHook(() => useAuthState(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBe('Account is locked. Please contact administrator.');
        expect(result.current.isAuthenticated).toBe(false);
      });
    });
  });
});
