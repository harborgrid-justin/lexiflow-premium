/**
 * Mock custom hooks for testing
 * Provides mock implementations of application hooks
 */

// Mock useAsync hook
export const mockUseAsync = jest.fn().mockReturnValue({
  data: null,
  error: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  execute: jest.fn().mockResolvedValue(undefined),
  reset: jest.fn(),
});

// Mock useDebounce hook
export const mockUseDebounce = jest.fn((value) => value);

// Mock useLocalStorage hook
export const mockUseLocalStorage = jest.fn().mockReturnValue([
  null,
  jest.fn(),
  jest.fn(),
]);

// Mock useMediaQuery hook
export const mockUseMediaQuery = jest.fn().mockReturnValue(false);

// Mock useTheme hook
export const mockUseTheme = jest.fn().mockReturnValue({
  theme: 'light',
  toggleTheme: jest.fn(),
  setTheme: jest.fn(),
});

// Mock usePagination hook
export const mockUsePagination = jest.fn().mockReturnValue({
  page: 1,
  pageSize: 10,
  totalPages: 1,
  totalItems: 0,
  nextPage: jest.fn(),
  prevPage: jest.fn(),
  goToPage: jest.fn(),
  setPageSize: jest.fn(),
});

// Mock useForm hook
export const mockUseForm = jest.fn().mockReturnValue({
  values: {},
  errors: {},
  touched: {},
  isSubmitting: false,
  isValid: true,
  handleChange: jest.fn(),
  handleBlur: jest.fn(),
  handleSubmit: jest.fn(),
  setFieldValue: jest.fn(),
  setFieldError: jest.fn(),
  setFieldTouched: jest.fn(),
  resetForm: jest.fn(),
});

// Mock useAuth hook
export const mockUseAuth = jest.fn().mockReturnValue({
  user: { id: '1', email: 'test@example.com', name: 'Test User' },
  isAuthenticated: true,
  isLoading: false,
  login: jest.fn().mockResolvedValue(undefined),
  logout: jest.fn().mockResolvedValue(undefined),
  register: jest.fn().mockResolvedValue(undefined),
});

// Mock useNotification hook
export const mockUseNotification = jest.fn().mockReturnValue({
  notify: jest.fn(),
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
  info: jest.fn(),
});

// Mock useQuery hook (React Query style)
export const mockUseQuery = jest.fn().mockReturnValue({
  data: undefined,
  error: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  refetch: jest.fn().mockResolvedValue(undefined),
});

// Mock useMutation hook (React Query style)
export const mockUseMutation = jest.fn().mockReturnValue({
  mutate: jest.fn(),
  mutateAsync: jest.fn().mockResolvedValue(undefined),
  isLoading: false,
  isError: false,
  isSuccess: false,
  error: null,
  data: undefined,
  reset: jest.fn(),
});

// Helper to reset all hook mocks
export const resetHookMocks = () => {
  mockUseAsync.mockClear();
  mockUseDebounce.mockClear();
  mockUseLocalStorage.mockClear();
  mockUseMediaQuery.mockClear();
  mockUseTheme.mockClear();
  mockUsePagination.mockClear();
  mockUseForm.mockClear();
  mockUseAuth.mockClear();
  mockUseNotification.mockClear();
  mockUseQuery.mockClear();
  mockUseMutation.mockClear();
};
