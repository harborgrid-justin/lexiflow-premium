import { useState, useCallback } from 'react';

/**
 * Type for error state - maps field names to error messages
 */
export type FormErrors = Record<string, string>;

/**
 * Return type for useFormError hook
 */
export interface UseFormErrorReturn {
  /**
   * Current error state - maps field names to error messages
   */
  errors: FormErrors;
  
  /**
   * Set an error message for a specific field
   * @param field - Field name or '__global__' for form-level errors
   * @param message - Error message to display
   */
  setError: (field: string, message: string) => void;
  
  /**
   * Clear the error for a specific field
   * @param field - Field name to clear
   */
  clearError: (field: string) => void;
  
  /**
   * Clear all errors
   */
  clearAll: () => void;
  
  /**
   * Check if a specific field has an error
   * @param field - Field name to check
   * @returns True if the field has an error
   */
  hasError: (field: string) => boolean;
  
  /**
   * Set multiple errors at once
   * @param errorMap - Object mapping field names to error messages
   */
  setErrors: (errorMap: FormErrors) => void;
}

/**
 * Hook for managing form field-level error states.
 * Provides a clean API for setting, clearing, and checking errors.
 * Eliminates repetitive error state management in form components.
 * 
 * @param initialErrors - Initial error state (optional)
 * @returns Object with error state and management functions
 * 
 * @example
 * // Basic usage
 * const { errors, setError, clearError, clearAll, hasError } = useFormError();
 * 
 * const handleSubmit = async (values) => {
 *   clearAll();
 *   
 *   if (!values.name) {
 *     setError('name', 'Name is required');
 *     return;
 *   }
 *   
 *   try {
 *     await api.save(values);
 *   } catch (err) {
 *     setError('__global__', 'Failed to save');
 *   }
 * };
 * 
 * return (
 *   <div>
 *     <input name="name" onChange={() => clearError('name')} />
 *     {errors.name && <span>{errors.name}</span>}
 *   </div>
 * );
 * 
 * @example
 * // With validation
 * const { errors, setError, hasError, clearAll } = useFormError();
 * 
 * const validate = (values) => {
 *   clearAll();
 *   let isValid = true;
 *   
 *   if (!values.email) {
 *     setError('email', 'Email is required');
 *     isValid = false;
 *   } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
 *     setError('email', 'Invalid email format');
 *     isValid = false;
 *   }
 *   
 *   if (!values.password || values.password.length < 8) {
 *     setError('password', 'Password must be at least 8 characters');
 *     isValid = false;
 *   }
 *   
 *   return isValid;
 * };
 * 
 * @example
 * // With API error handling
 * const { errors, setError, setErrors, clearAll } = useFormError();
 * 
 * const handleSubmit = async (values) => {
 *   try {
 *     await api.users.create(values);
 *   } catch (err) {
 *     if (err.response?.data?.errors) {
 *       // Set multiple errors from API response
 *       setErrors(err.response.data.errors);
 *     } else {
 *       setError('__global__', 'An unexpected error occurred');
 *     }
 *   }
 * };
 * 
 * @example
 * // Clear error on field change
 * const { errors, setError, clearError } = useFormError();
 * 
 * return (
 *   <div>
 *     <input
 *       name="username"
 *       onChange={(e) => {
 *         clearError('username');
 *         handleChange(e);
 *       }}
 *     />
 *     {errors.username && (
 *       <span className="error">{errors.username}</span>
 *     )}
 *   </div>
 * );
 * 
 * @example
 * // Global form errors
 * const { errors, setError, hasError } = useFormError();
 * 
 * return (
 *   <form onSubmit={handleSubmit}>
 *     {hasError('__global__') && (
 *       <div className="alert alert-danger">
 *         {errors.__global__}
 *       </div>
 *     )}
 *     
 *   </form>
 * );
 */
export function useFormError(
  initialErrors: FormErrors = {}
): UseFormErrorReturn {
  const [errors, setErrorsState] = useState<FormErrors>(initialErrors);

  const setError = useCallback((field: string, message: string) => {
    setErrorsState(prev => ({
      ...prev,
      [field]: message
    }));
  }, []);

  const clearError = useCallback((field: string) => {
    setErrorsState(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAll = useCallback(() => {
    setErrorsState({});
  }, []);

  const hasError = useCallback((field: string): boolean => {
    return field in errors && errors[field] !== '';
  }, [errors]);

  const setErrors = useCallback((errorMap: FormErrors) => {
    setErrorsState(prev => ({
      ...prev,
      ...errorMap
    }));
  }, []);

  return {
    errors,
    setError,
    clearError,
    clearAll,
    hasError,
    setErrors
  };
}
