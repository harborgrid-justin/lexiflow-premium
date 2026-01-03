/**
 * Mock services for testing
 * Provides mock implementations of API and data services
 */

// Mock API Service
export const mockApiService = {
  get: jest.fn().mockResolvedValue({ data: {} }),
  post: jest.fn().mockResolvedValue({ data: {} }),
  put: jest.fn().mockResolvedValue({ data: {} }),
  patch: jest.fn().mockResolvedValue({ data: {} }),
  delete: jest.fn().mockResolvedValue({ data: {} }),
  request: jest.fn().mockResolvedValue({ data: {} }),
};

// Mock Auth Service
export const mockAuthService = {
  login: jest.fn().mockResolvedValue({ token: 'mock-token', user: { id: '1', email: 'test@example.com' } }),
  logout: jest.fn().mockResolvedValue(undefined),
  register: jest.fn().mockResolvedValue({ token: 'mock-token', user: { id: '1', email: 'test@example.com' } }),
  refreshToken: jest.fn().mockResolvedValue({ token: 'new-mock-token' }),
  verifyToken: jest.fn().mockResolvedValue(true),
  getCurrentUser: jest.fn().mockResolvedValue({ id: '1', email: 'test@example.com' }),
};

// Mock Data Service
export const mockDataService = {
  fetch: jest.fn().mockResolvedValue([]),
  fetchOne: jest.fn().mockResolvedValue({}),
  create: jest.fn().mockResolvedValue({ id: '1' }),
  update: jest.fn().mockResolvedValue({ id: '1' }),
  delete: jest.fn().mockResolvedValue(undefined),
  search: jest.fn().mockResolvedValue([]),
};

// Mock Cache Service
export const mockCacheService = {
  get: jest.fn().mockReturnValue(null),
  set: jest.fn().mockReturnValue(undefined),
  delete: jest.fn().mockReturnValue(undefined),
  clear: jest.fn().mockReturnValue(undefined),
  has: jest.fn().mockReturnValue(false),
};

// Mock Notification Service
export const mockNotificationService = {
  send: jest.fn().mockResolvedValue(undefined),
  sendSuccess: jest.fn().mockResolvedValue(undefined),
  sendError: jest.fn().mockResolvedValue(undefined),
  sendWarning: jest.fn().mockResolvedValue(undefined),
  sendInfo: jest.fn().mockResolvedValue(undefined),
};

// Mock Event Bus Service
export const mockEventBus = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  once: jest.fn(),
};

// Mock Search Service
export const mockSearchService = {
  search: jest.fn().mockResolvedValue([]),
  index: jest.fn().mockResolvedValue(undefined),
  remove: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
};

// Mock Sync Engine
export const mockSyncEngine = {
  sync: jest.fn().mockResolvedValue(undefined),
  startAutoSync: jest.fn().mockReturnValue(undefined),
  stopAutoSync: jest.fn().mockReturnValue(undefined),
  getStatus: jest.fn().mockReturnValue({ syncing: false, lastSync: null }),
};

// Helper to reset all service mocks
export const resetServiceMocks = () => {
  Object.values(mockApiService).forEach((fn) => typeof fn === 'function' && fn.mockClear?.());
  Object.values(mockAuthService).forEach((fn) => typeof fn === 'function' && fn.mockClear?.());
  Object.values(mockDataService).forEach((fn) => typeof fn === 'function' && fn.mockClear?.());
  Object.values(mockCacheService).forEach((fn) => typeof fn === 'function' && fn.mockClear?.());
  Object.values(mockNotificationService).forEach((fn) => typeof fn === 'function' && fn.mockClear?.());
  Object.values(mockEventBus).forEach((fn) => typeof fn === 'function' && fn.mockClear?.());
  Object.values(mockSearchService).forEach((fn) => typeof fn === 'function' && fn.mockClear?.());
  Object.values(mockSyncEngine).forEach((fn) => typeof fn === 'function' && fn.mockClear?.());
};
