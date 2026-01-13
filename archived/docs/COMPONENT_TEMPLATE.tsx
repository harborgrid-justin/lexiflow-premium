/**
 * ComponentName.tsx
 * 
 * Brief description of what this component does and its role in the application.
 * 
 * @module components/[domain]/ComponentName
 * @category [Domain] - e.g., Case Management, Discovery, Compliance
 * 
 * THEME SYSTEM USAGE:
 * This component uses the LexiFlow theme provider for consistent styling across light/dark modes.
 * 
 * Key patterns:
 * - useTheme() hook provides: theme, isDark, mode, toggleTheme, setTheme
 * - theme.text.primary/secondary/tertiary for text colors
 * - theme.surface.default/raised/overlay for backgrounds
 * - theme.border.default/focused/error for borders
 * - theme.action.primary/secondary/ghost/danger for buttons
 * - theme.status.success/warning/error/info for status indicators
 * 
 * Convention: Use semantic tokens from theme, NOT raw Tailwind colors
 * ✅ className={theme.text.primary}
 * ❌ className="text-slate-900 dark:text-white"
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Icon1, 
  Icon2, 
  Icon3 
} from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '@/services/dataService';
import { queryClient } from '@/services/queryClient';
import { IntegrationOrchestrator } from '@/services/integrationOrchestrator';

// Hooks & Context
import { useQuery } from '@/services/queryClient';
import { useTheme } from '@/providers/ThemeContext';
import { useToast } from '@providers/ToastContext';

// Theme
import { tokens } from '../../theme/tokens';

// Components
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Modal } from '../common/Modal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorBoundary } from '../common/ErrorBoundary';

// Utils & Constants
import { PATHS } from '../../config/paths.config';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { errorHandler } from '../../utils/errorHandler';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import type { 
  Case, 
  DocketEntry, 
  BaseEntity,
  UserId 
} from '../../types';

/**
 * Props interface for ComponentName
 */
interface ComponentNameProps {
  /** Primary identifier for the entity */
  id: string;
  
  /** Display mode: 'view' | 'edit' | 'create' */
  mode?: 'view' | 'edit' | 'create';
  
  /** Optional callback fired when action completes */
  onComplete?: (data: Case) => void;
  
  /** Optional callback for cancellation */
  onCancel?: () => void;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Child components */
  children?: React.ReactNode;
}

/**
 * Internal state shape
 */
interface ComponentState {
  selectedId: string | null;
  isLoading: boolean;
  error: Error | null;
  activeTab: string;
}

/**
 * Form data shape
 */
interface FormData {
  title: string;
  description: string;
  status: string;
  assignee: UserId;
}

// ============================================================================
// CONSTANTS
// ============================================================================
const DEFAULT_PAGE_SIZE = 25;
const DEBOUNCE_DELAY = 300;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const TABS = [
  { id: 'overview', label: 'Overview', icon: Icon1 },
  { id: 'details', label: 'Details', icon: Icon2 },
  { id: 'activity', label: 'Activity', icon: Icon3 },
] as const;

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
] as const;

// ============================================================================
// HELPER FUNCTIONS (Outside Component)
// ============================================================================

/**
 * Validates form data before submission
 */
const validateFormData = (data: Partial<FormData>): string[] => {
  const errors: string[] = [];
  
  if (!data.title?.trim()) {
    errors.push('Title is required');
  }
  
  if (data.title && data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }
  
  return errors;
};

/**
 * Transforms API data to display format
 */
const transformDataForDisplay = (rawData: any): any => {
  return {
    ...rawData,
    displayDate: formatDate(rawData.createdAt),
    displayAmount: formatCurrency(rawData.amount),
  };
};

/**
 * Debounce utility for search and input handlers
 */
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * ComponentName - Brief one-line description
 * 
 * Detailed description of what this component does, its responsibilities,
 * and how it fits into the larger application architecture.
 * 
 * @example
 * ```tsx
 * <ComponentName 
 *   id="case-123" 
 *   mode="edit"
 *   onComplete={(data) => console.log('Saved:', data)}
 * />
 * ```
 */
export const ComponentName: React.FC<ComponentNameProps> = ({
  id,
  mode = 'view',
  onComplete,
  onCancel,
  className = '',
  children,
}) => {
  // ==========================================================================
  // HOOKS - Context & Navigation
  // ==========================================================================
  const navigate = useNavigate();
  const { mode: themeMode, theme, isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();

  // ==========================================================================
  // HOOKS - Refs
  // ==========================================================================
  const abortControllerRef = useRef<AbortController | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ==========================================================================
  // HOOKS - State
  // ==========================================================================
  const [state, setState] = useState<ComponentState>({
    selectedId: null,
    isLoading: false,
    error: null,
    activeTab: 'overview',
  });

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    status: 'active',
    assignee: '' as UserId,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // ==========================================================================
  // HOOKS - Data Fetching (React Query Pattern)
  // ==========================================================================
  const {
    data: mainData,
    isLoading: isMainLoading,
    error: mainError,
    refetch: refetchMainData,
  } = useQuery<Case>(
    ['component-data', id],
    async () => {
      const data = await DataService.cases.getById(id);
      return data;
    },
    {
      enabled: !!id && mode !== 'create',
      staleTime: CACHE_TTL,
      onSuccess: (data) => {
        // Auto-populate form in edit mode
        if (mode === 'edit' && data) {
          setFormData({
            title: data.title || '',
            description: data.description || '',
            status: data.status || 'active',
            assignee: data.assignedTo || ('' as UserId),
          });
        }
      },
      onError: (error) => {
        errorHandler(error, 'Failed to load data');
        showToast('error', 'Failed to load data');
      },
    }
  );

  // Secondary data query
  const {
    data: relatedData,
    isLoading: isRelatedLoading,
  } = useQuery<DocketEntry[]>(
    ['related-data', id],
    async () => {
      return await DataService.docket.getByCase(id);
    },
    {
      enabled: !!id && !!mainData,
      staleTime: CACHE_TTL,
    }
  );

  // ==========================================================================
  // HOOKS - Derived State (useMemo)
  // ==========================================================================
  const filteredData = useMemo(() => {
    if (!relatedData) return [];
    
    if (!debouncedSearchQuery.trim()) return relatedData;
    
    return relatedData.filter((item) =>
      item.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [relatedData, debouncedSearchQuery]);

  const hasUnsavedChanges = useMemo(() => {
    if (!mainData || mode !== 'edit') return false;
    
    return (
      formData.title !== mainData.title ||
      formData.description !== mainData.description ||
      formData.status !== mainData.status
    );
  }, [formData, mainData, mode]);

  const isFormValid = useMemo(() => {
    const errors = validateFormData(formData);
    return errors.length === 0;
  }, [formData]);

  // ==========================================================================
  // CALLBACKS - Event Handlers
  // ==========================================================================
  
  /**
   * Handles search input with debouncing
   */
  const handleSearchChange = useMemo(
    () => debounce((value: string) => {
      setDebouncedSearchQuery(value);
    }, DEBOUNCE_DELAY),
    []
  );

  const onSearchInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearchChange(value);
  }, [handleSearchChange]);

  /**
   * Handles form field changes
   */
  const handleFieldChange = useCallback(
    (field: keyof FormData, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  /**
   * Handles form submission
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      const errors = validateFormData(formData);
      if (errors.length > 0) {
        showToast('error', errors.join(', '));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        let result;
        
        if (mode === 'create') {
          result = await DataService.cases.add({
            id: crypto.randomUUID(),
            ...formData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: 'current-user-id' as UserId,
          } as Case);
        } else if (mode === 'edit' && mainData) {
          result = await DataService.cases.update(id, {
            ...mainData,
            ...formData,
            updatedAt: new Date().toISOString(),
          });
        }

        // Invalidate queries to refresh data
        queryClient.invalidate(['component-data', id]);
        queryClient.invalidate(['related-data', id]);

        showToast('success', `Successfully ${mode === 'create' ? 'created' : 'updated'}`);
        
        if (onComplete) {
          onComplete(result);
        }
        
        if (mode === 'create') {
          navigate(`${PATHS.CASES}/${result?.id}`);
        }
      } catch (error) {
        errorHandler(error, 'Failed to save data');
        showToast('error', 'Failed to save data');
        setState((prev) => ({ 
          ...prev, 
          error: error instanceof Error ? error : new Error('Unknown error') 
        }));
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [formData, mode, id, mainData, onComplete, navigate, showToast]
  );

  /**
   * Handles tab changes
   */
  const handleTabChange = useCallback((tabId: string) => {
    setState((prev) => ({ ...prev, activeTab: tabId }));
  }, []);

  /**
   * Opens delete confirmation modal
   */
  const handleDeleteClick = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, []);

  /**
   * Handles delete action after confirmation
   */
  const handleDeleteConfirm = useCallback(async () => {
    setIsDeleteModalOpen(false);
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await DataService.cases.delete(id);
      showToast('success', 'Successfully deleted');
      navigate(PATHS.CASES);
    } catch (error) {
      errorHandler(error, 'Failed to delete');
      showToast('error', 'Failed to delete');
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [id, navigate, showToast]);

  // ==========================================================================
  // EFFECTS
  // ==========================================================================
  
  /**
   * Initialize component and subscribe to events
   */
  useEffect(() => {
    // Setup abort controller for cleanup
    abortControllerRef.current = new AbortController();

    // Subscribe to integration events if needed
    const unsubscribe = IntegrationOrchestrator.subscribe(
      'CASE_UPDATED' as const,
      (payload: { caseId: string; caseData?: Case }) => {
        if (payload.caseId === id) {
          refetchMainData();
        }
      }
    );

    return () => {
      // Cleanup
      abortControllerRef.current?.abort();
      unsubscribe?.();
    };
  }, [id, refetchMainData]);

  /**
   * Warn user about unsaved changes
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [hasUnsavedChanges]);

  /**
   * Add keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's' && (mode === 'edit' || mode === 'create')) {
        e.preventDefault();
        if (isFormValid && !state.isLoading) {
          handleSubmit(e as any);
        }
      }
      
      // Esc to close modal or cancel
      if (e.key === 'Escape') {
        if (isModalOpen) {
          setIsModalOpen(false);
        } else if (isDeleteModalOpen) {
          setIsDeleteModalOpen(false);
        } else if ((mode === 'edit' || mode === 'create') && onCancel) {
          onCancel();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, isFormValid, state.isLoading, handleSubmit, isModalOpen, isDeleteModalOpen, onCancel]);

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================
  
  /**
   * Renders loading state
   */
  const renderLoading = () => (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  );

  /**
   * Renders error state
   */
  const renderError = (error: Error) => (
    <div className={`p-4 rounded-lg ${theme.status.error.bg} ${theme.status.error.border} border`}>
      <p className={`${theme.status.error.text} font-medium`}>
        Error: {error.message}
      </p>
      <button
        onClick={() => refetchMainData()}
        className={`mt-4 px-3 py-1.5 rounded text-sm ${theme.action.secondary.bg} ${theme.action.secondary.text} ${theme.action.secondary.hover} ${theme.border.default} border`}
      >
        Try Again
      </button>
    </div>
  );

  /**
   * Renders tab content
   */
  const renderTabContent = () => {
    switch (state.activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${theme.surface.raised}`}>
              <h3 className={`text-lg font-semibold ${theme.text.primary} mb-2`}>Overview</h3>
              <p className={theme.text.secondary}>Current theme mode: {themeMode}</p>
              
              {/* Example: Theme toggle button demonstrating theme provider usage */}
              <button
                onClick={toggleTheme}
                className={`mt-4 px-3 py-1.5 rounded text-sm ${theme.action.secondary.bg} ${theme.action.secondary.text} ${theme.action.secondary.hover} ${theme.border.default} border transition-colors`}
              >
                {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            </div>
          </div>
        );
      case 'details':
        return <div>Details content here</div>;
      case 'activity':
        return <div>Activity content here</div>;
      default:
        return null;
    }
  };

  // ==========================================================================
  // EARLY RETURNS
  // ==========================================================================
  
  if (isMainLoading && mode !== 'create') {
    return renderLoading();
  }

  if (mainError && mode !== 'create') {
    return renderError(mainError);
  }

  if (!mainData && mode !== 'create' && !isMainLoading) {
    return (
      <div className="p-4 text-center">
        <p className={theme.text.secondary}>No data found</p>
      </div>
    );
  }

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================
  
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <div className={`component-name ${className}`}>
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${theme.text.primary}`}>
              {mode === 'create' ? 'Create New' : mainData?.title}
            </h1>
            {mainData?.description && (
              <p className={`${theme.text.secondary} mt-1`}>
                {mainData.description}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {mode === 'view' && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => navigate(`${PATHS.CASES}/${id}/edit`)}
                >
                  <Icon1 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteClick}
                >
                  Delete
                </Button>
              </>
            )}
            {(mode === 'edit' || mode === 'create') && (
              <>
                <Button
                  variant="secondary"
                  onClick={onCancel || (() => navigate(-1))}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={!isFormValid || state.isLoading}
                  isLoading={state.isLoading}
                >
                  {mode === 'create' ? 'Create' : 'Save Changes'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        {mode === 'view' && (
          <div className={`flex border-b ${theme.border.default} mb-6`}>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = state.activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 border-b-2 transition-colors
                    ${
                      isActive
                        ? `border-blue-500 ${theme.text.link}`
                        : `border-transparent ${theme.text.secondary} ${isDark ? 'hover:text-white' : 'hover:text-slate-900'}`
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {mode === 'view' ? (
            // View Mode - Tab Content
            <AnimatePresence mode="wait">
              <motion.div
                key={state.activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          ) : (
            // Edit/Create Mode - Form
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <Card>
                <div className="space-y-4">
                  {/* Form Fields - Using Theme Tokens */}
                  <div>
                    <label 
                      htmlFor="title-input"
                      className={`block text-sm font-medium ${theme.text.primary} mb-1`}
                    >
                      Title *
                    </label>
                    <input
                      id="title-input"
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg ${theme.surface.input} ${theme.border.default} border ${theme.text.primary} focus:outline-none ${theme.border.focused}`}
                      placeholder="Enter title"
                      required
                      aria-required="true"
                      aria-invalid={!formData.title.trim() ? "true" : "false"}
                    />
                  </div>

                  <div>
                    <label 
                      htmlFor="description-input"
                      className={`block text-sm font-medium ${theme.text.primary} mb-1`}
                    >
                      Description
                    </label>
                    <textarea
                      id="description-input"
                      value={formData.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg ${theme.surface.input} ${theme.border.default} border ${theme.text.primary} focus:outline-none ${theme.border.focused}`}
                      placeholder="Enter description"
                      rows={4}
                      aria-label="Case description"
                    />
                  </div>

                  <div>
                    <label 
                      htmlFor="status-select"
                      className={`block text-sm font-medium ${theme.text.primary} mb-1`}
                    >
                      Status
                    </label>
                    <select
                      id="status-select"
                      value={formData.status}
                      onChange={(e) => handleFieldChange('status', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg ${theme.surface.input} ${theme.border.default} border ${theme.text.primary} focus:outline-none ${theme.border.focused}`}
                      aria-label="Case status"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Card>

              {/* Form Actions (if needed inline) */}
              {hasUnsavedChanges && (
                <div className={`flex items-center gap-2 text-sm ${theme.status.warning.text}`}>
                  <Icon2 className="w-4 h-4" />
                  You have unsaved changes
                </div>
              )}
            </form>
          )}

          {/* Additional Content Sections */}
          {children}
        </div>

        {/* Modal Example */}
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Modal Title"
          >
            <div className="p-4">Modal content here</div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Confirm Deletion"
          >
            <div className="p-4 space-y-4">
              <p className={theme.text.primary}>
                Are you sure you want to delete this item? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteConfirm}
                  isLoading={state.isLoading}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Display state error if it exists and is different from query error */}
        {state.error && state.error !== mainError && (
          <div className={`mt-4 p-4 rounded-lg ${theme.status.error.bg} ${theme.status.error.border} border`}>
            <p className={`${theme.status.error.text} text-sm`}>
              {state.error.message}
            </p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================
export default ComponentName;

// Named exports for testing or alternative imports
export { type ComponentNameProps, type FormData };
