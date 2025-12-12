import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  mfaEnabled: boolean;
  avatar?: string;
  permissions?: string[];
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface LoginResponse {
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  requiresMfa?: boolean;
  mfaToken?: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, mfaCode?: string) => Promise<LoginResponse>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshAccessToken: () => Promise<string>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  enableTwoFactor: (password: string) => Promise<{ qrCode: string; secret: string }>;
  disableTwoFactor: (password: string, code: string) => Promise<void>;
  verifyTwoFactorSetup: (secret: string, code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes (tokens expire in 15 minutes)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const isAuthenticated = !!user;

  // Get tokens from localStorage
  const getTokens = (): AuthTokens | null => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (accessToken && refreshToken) {
      return { accessToken, refreshToken };
    }
    return null;
  };

  // Save tokens to localStorage
  const saveTokens = (tokens: AuthTokens) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  };

  // Clear tokens from localStorage
  const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // Make authenticated API request
  const apiRequest = async (
    endpoint: string,
    options: RequestInit = {},
  ): Promise<any> => {
    const tokens = getTokens();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (tokens) {
      headers['Authorization'] = `Bearer ${tokens.accessToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  };

  // Refresh access token
  const refreshAccessToken = useCallback(async (): Promise<string> => {
    const tokens = getTokens();
    if (!tokens) {
      throw new Error('No refresh token available');
    }

    try {
      const data = await apiRequest('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      return data.accessToken;
    } catch (error) {
      // Refresh failed, logout user
      clearTokens();
      setUser(null);
      throw error;
    }
  }, []);

  // Setup auto-refresh for access token
  const setupTokenRefresh = useCallback(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    const interval = setInterval(() => {
      refreshAccessToken().catch((error) => {
        console.error('Token refresh failed:', error);
      });
    }, TOKEN_REFRESH_INTERVAL);

    setRefreshInterval(interval);
  }, [refreshAccessToken, refreshInterval]);

  // Load user profile
  const loadUserProfile = async () => {
    try {
      const userData = await apiRequest('/auth/profile');
      setUser(userData);
      setupTokenRefresh();
    } catch (error) {
      console.error('Failed to load user profile:', error);
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (
    email: string,
    password: string,
    mfaCode?: string,
  ): Promise<LoginResponse> => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, code: mfaCode }),
    });

    if (data.requiresMfa) {
      return { requiresMfa: true, mfaToken: data.mfaToken };
    }

    saveTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    setUser(data.user);
    setupTokenRefresh();

    return data;
  };

  // Register
  const register = async (registerData: RegisterData): Promise<void> => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
    });

    saveTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    setUser(data.user);
    setupTokenRefresh();
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      clearTokens();
      setUser(null);
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  };

  // Forgot password
  const forgotPassword = async (email: string): Promise<any> => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  };

  // Reset password
  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  };

  // Change password
  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<void> => {
    await apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  };

  // Update profile
  const updateProfile = async (data: Partial<User>): Promise<void> => {
    const updatedUser = await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    setUser(updatedUser);
  };

  // OAuth login helpers
  const loginWithGoogle = async (): Promise<void> => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const loginWithMicrosoft = async (): Promise<void> => {
    window.location.href = `${API_URL}/auth/microsoft`;
  };

  // Two-factor authentication
  const enableTwoFactor = async (
    password: string,
  ): Promise<{ qrCode: string; secret: string }> => {
    return apiRequest('/auth/2fa/enable', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  };

  const disableTwoFactor = async (password: string, code: string): Promise<void> => {
    await apiRequest('/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ password, code }),
    });
    if (user) {
      setUser({ ...user, mfaEnabled: false });
    }
  };

  const verifyTwoFactorSetup = async (secret: string, code: string): Promise<void> => {
    await apiRequest('/auth/2fa/verify-setup', {
      method: 'POST',
      body: JSON.stringify({ secret, code }),
    });
    if (user) {
      setUser({ ...user, mfaEnabled: true });
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    const tokens = getTokens();
    if (tokens) {
      loadUserProfile();
    } else {
      setLoading(false);
    }

    // Cleanup on unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (accessToken && refreshToken) {
      saveTokens({ accessToken, refreshToken });
      loadUserProfile();
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    refreshAccessToken,
    updateProfile,
    loginWithGoogle,
    loginWithMicrosoft,
    enableTwoFactor,
    disableTwoFactor,
    verifyTwoFactorSetup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
