import React, { createContext, useContext } from 'react';

/**
 * Mock contexts for testing
 * Provides mock implementations of application contexts
 */

// Mock Theme Context
export const mockTheme = {
  mode: 'light' as const,
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    background: '#ffffff',
    text: '#1e293b',
  },
  toggleTheme: jest.fn(),
  setTheme: jest.fn(),
};

export const MockThemeContext = createContext(mockTheme);

export const MockThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MockThemeContext.Provider value={mockTheme}>
      {children}
    </MockThemeContext.Provider>
  );
};

export const useMockTheme = () => useContext(MockThemeContext);

// Mock Auth Context
export const mockAuth = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'admin' as const,
  },
  isAuthenticated: true,
  isLoading: false,
  login: jest.fn().mockResolvedValue(undefined),
  logout: jest.fn().mockResolvedValue(undefined),
  register: jest.fn().mockResolvedValue(undefined),
  updateProfile: jest.fn().mockResolvedValue(undefined),
};

export const MockAuthContext = createContext(mockAuth);

export const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MockAuthContext.Provider value={mockAuth}>
      {children}
    </MockAuthContext.Provider>
  );
};

export const useMockAuth = () => useContext(MockAuthContext);

// Mock Notification Context
export const mockNotification = {
  notifications: [],
  addNotification: jest.fn(),
  removeNotification: jest.fn(),
  clearNotifications: jest.fn(),
};

export const MockNotificationContext = createContext(mockNotification);

export const MockNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MockNotificationContext.Provider value={mockNotification}>
      {children}
    </MockNotificationContext.Provider>
  );
};

// Helper to reset all context mocks
export const resetContextMocks = () => {
  mockTheme.toggleTheme.mockClear();
  mockTheme.setTheme.mockClear();
  mockAuth.login.mockClear();
  mockAuth.logout.mockClear();
  mockAuth.register.mockClear();
  mockAuth.updateProfile.mockClear();
  mockNotification.addNotification.mockClear();
  mockNotification.removeNotification.mockClear();
  mockNotification.clearNotifications.mockClear();
};
