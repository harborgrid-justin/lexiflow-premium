/**
 * Auth Initialization
 * Setup authentication system on app startup
 */

import { initializeAuthInterceptors } from './authInterceptor';
import { sessionService } from './sessionService';
import { tokenService } from './tokenService';
import apiClient from '../api/apiClient';

/**
 * Initialize authentication system
 * Call this once on app startup
 */
export const initializeAuth = () => {
  console.log('[Auth] Initializing authentication system...');

  // Setup axios interceptors for token refresh
  initializeAuthInterceptors(apiClient);

  // Validate existing session
  validateExistingSession();

  // Setup event listeners
  setupAuthEventListeners();

  // Start session monitoring
  sessionService.startMonitoring();

  console.log('[Auth] Authentication system initialized');
};

/**
 * Validate existing session on app load
 */
const validateExistingSession = () => {
  const hasSession = sessionService.hasActiveSession();
  const hasValidTokens = tokenService.hasValidTokens();

  if (hasSession && !hasValidTokens) {
    console.warn('[Auth] Session exists but tokens are invalid, clearing session');
    sessionService.clearSession();
    return;
  }

  if (!hasSession && hasValidTokens) {
    console.warn('[Auth] Tokens exist but no session, clearing tokens');
    tokenService.clearTokens();
    return;
  }

  // Sync session with token
  if (hasSession) {
    const synced = sessionService.syncWithToken();
    if (!synced) {
      console.warn('[Auth] Session/token sync failed, clearing all auth data');
      sessionService.clearSession();
      tokenService.clearTokens();
    }
  }
};

/**
 * Setup global auth event listeners
 */
const setupAuthEventListeners = () => {
  // Handle logout event
  window.addEventListener('auth:logout', () => {
    console.log('[Auth] Logout event received');
    handleLogout();
  });

  // Handle session expired event
  window.addEventListener('auth:sessionExpired', ((event: CustomEvent) => {
    console.log('[Auth] Session expired');
    handleSessionExpired(event.detail?.redirectToLogin);
  }) as EventListener);

  // Handle forbidden access
  window.addEventListener('auth:forbidden', ((event: CustomEvent) => {
    console.log('[Auth] Forbidden access:', event.detail);
    handleForbiddenAccess(event.detail);
  }) as EventListener);

  // Handle session timeout
  window.addEventListener('session:timeout', () => {
    console.log('[Auth] Session timeout');
    handleSessionTimeout();
  });

  // Handle before unload to update activity
  window.addEventListener('beforeunload', () => {
    if (sessionService.isActive()) {
      sessionService.updateActivity();
    }
  });

  // Handle visibility change to update activity
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && sessionService.isActive()) {
      sessionService.updateActivity();
    }
  });
};

/**
 * Handle logout
 */
const handleLogout = () => {
  sessionService.clearSession();
  tokenService.clearTokens();

  // Redirect to login if not already there
  const currentPath = window.location.pathname;
  if (!currentPath.startsWith('/auth')) {
    window.location.href = '/auth/login';
  }
};

/**
 * Handle session expired
 */
const handleSessionExpired = (redirectToLogin: boolean = true) => {
  sessionService.clearSession();
  tokenService.clearTokens();

  if (redirectToLogin) {
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath.startsWith('/auth');

    if (!isAuthPage) {
      window.location.href = `/auth/login?sessionExpired=true&redirect=${encodeURIComponent(currentPath)}`;
    }
  }
};

/**
 * Handle forbidden access
 */
const handleForbiddenAccess = (detail: any) => {
  console.error('[Auth] Access forbidden:', detail);

  // You can show a toast/notification here
  window.dispatchEvent(
    new CustomEvent('app:notification', {
      detail: {
        type: 'error',
        message: detail?.message || 'Access denied. You do not have permission to perform this action.',
      },
    })
  );
};

/**
 * Handle session timeout
 */
const handleSessionTimeout = () => {
  sessionService.clearSession();
  tokenService.clearTokens();

  const currentPath = window.location.pathname;
  const isAuthPage = currentPath.startsWith('/auth');

  if (!isAuthPage) {
    window.location.href = `/auth/login?timeout=true&redirect=${encodeURIComponent(currentPath)}`;
  }
};

/**
 * Cleanup auth system (call on app unmount)
 */
export const cleanupAuth = () => {
  console.log('[Auth] Cleaning up authentication system');

  // Remove event listeners
  window.removeEventListener('auth:logout', handleLogout);
  window.removeEventListener('auth:sessionExpired', handleSessionExpired as EventListener);
  window.removeEventListener('auth:forbidden', handleForbiddenAccess as EventListener);
  window.removeEventListener('session:timeout', handleSessionTimeout);
};

export default {
  initializeAuth,
  cleanupAuth,
};
