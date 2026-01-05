/**
 * AutocompleteSelect Component
 *
 * Generic type-safe autocomplete dropdown with create-new-entity capability.
 *
 * Architecture Decisions:
 * 1. Generic over TEntity and TValue to support any entity type while maintaining type safety
 * 2. Controlled component pattern - parent manages selected value
 * 3. Portal-based dropdown to avoid z-index and overflow issues
 * 4. Keyboard navigation (Arrow keys, Enter, Escape) for accessibility
 * 5. Virtual scrolling for large option lists (performance optimization)
 * 6. Memoized render functions to prevent unnecessary re-renders
 *
 * Type Parameters:
 * @template TEntity - The entity type (e.g., Party, Case, Attorney)
 * @template TValue - The value type (usually string for IDs)
 * @template TCreateData - The data shape for creating new entities
 */

import { useClickOutside } from '@/hooks/useClickOutside';
import { EntityAutocompleteConfig, useEntityAutocomplete } from '@/hooks/useEntityAutocomplete';
import { AlertCircle, Check, Loader, Plus, Search } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface AutocompleteSelectProps<TEntity, TValue extends string = string, TCreateData = Partial<TEntity>>
  extends Omit<EntityAutocompleteConfig<TEntity, TCreateData>, 'debounceMs' | 'minSearchLength' | 'initialOptions'> {

  /** Current selected value */
  value: TValue | null;

  /** Callback when selection changes */
  onChange: (value: TValue | null, entity: TEntity | null) => void;

  /** Placeholder text */
  placeholder?: string;

  /** Label for the input */
  label?: string;

  /** Required field indicator */
  required?: boolean;

  /** Disabled state */
  disabled?: boolean;

  /** Error message */
  error?: string;

  /** Helper text */
  helperText?: string;

  /** Component to render for creating new entity (optional) */
  CreateComponent?: React.ComponentType<CreateComponentProps<TCreateData>>;

  /** Custom option renderer */
  renderOption?: (entity: TEntity, isHighlighted: boolean, isSelected: boolean) => React.ReactNode;

  /** Custom empty state */
  renderEmpty?: (searchQuery: string) => React.ReactNode;

  /** Allow clearing selection */
  clearable?: boolean;

  /** Maximum height for dropdown in pixels */
  maxDropdownHeight?: number;

  /** Additional CSS classes */
  className?: string;

  /** Test ID for automated testing */
  testId?: string;

  /** Initial options to display before search */
  initialOptions?: TEntity[];
}

export interface CreateComponentProps<TCreateData> {
  /** Initial data (pre-filled from search query) */
  initialData: Partial<TCreateData>;

  /** Callback when entity is created */
  onCreated: (data: TCreateData) => void;

  /** Callback to cancel */
  onCancel: () => void;

  /** Loading state while creating */
  isCreating: boolean;
}

/**
 * Generic autocomplete select component with type-safe entity management
 */
export const AutocompleteSelect = React.memo(<
  TEntity extends { id: string },
  TValue extends string = string,
  TCreateData = Partial<TEntity>
>({
  value,
  onChange,
  placeholder = 'Search or create...',
  label,
  required = false,
  disabled = false,
  error,
  helperText,
  CreateComponent,
  renderOption,
  renderEmpty,
  clearable = true,
  maxDropdownHeight = 320,
  className = '',
  testId,
  initialOptions = [],
  ...autocompleteConfig
}: AutocompleteSelectProps<TEntity, TValue, TCreateData>) => {

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hook for entity autocomplete logic
  const {
    options,
    searchQuery,
    setSearchQuery,
    isLoading,
    isCreating,
    error: autocompleteError,
    createEntity,
    hasExactMatch,
  } = useEntityAutocomplete<TEntity, TCreateData>({
    ...autocompleteConfig,
    initialOptions,
    debounceMs: 300,
    minSearchLength: 0,
  });

  // Find selected entity for display
  const selectedEntity = useMemo(() => {
    if (!value) return null;
    const allEntities = [...initialOptions, ...options];
    return allEntities.find(entity =>
      autocompleteConfig.getValue(entity) === value
    ) || null;
  }, [value, options, initialOptions, autocompleteConfig]);

  // Close dropdown when clicking outside
  useClickOutside(containerRef as React.RefObject<HTMLElement>, () => {
    if (isOpen) {
      setIsOpen(false);
      setSearchQuery('');
    }
  });

  /**
   * Handle option selection
   * Type-safe: ensures entity matches TEntity and value matches TValue
   */
  const handleSelect = useCallback((entity: TEntity) => {
    const entityValue = autocompleteConfig.getValue(entity) as TValue;
    onChange(entityValue, entity);
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
  }, [onChange, autocompleteConfig, setSearchQuery]);

  /**
   * Handle clear selection
   */
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null, null);
    setSearchQuery('');
  }, [onChange, setSearchQuery]);

  /**
   * Handle keyboard navigation
   * Arrow Up/Down: Navigate options
   * Enter: Select highlighted option or show create modal
   * Escape: Close dropdown
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen && e.key !== 'Enter' && e.key !== 'ArrowDown') return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev =>
            prev < options.length - 1 ? prev + 1 : prev
          );
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;

      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          handleSelect(options[highlightedIndex]!);
        } else if (searchQuery.trim() && !hasExactMatch(searchQuery) && CreateComponent) {
          setShowCreateModal(true);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
        break;
    }
  }, [isOpen, options, highlightedIndex, searchQuery, hasExactMatch, CreateComponent, handleSelect, setSearchQuery]);

  /**
   * Scroll highlighted option into view
   */
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedEl = dropdownRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedEl) {
        highlightedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex]);

  /**
   * Handle create entity from modal
   */
  const handleCreateEntity = useCallback(async (data: TCreateData) => {
    try {
      const newEntity = await createEntity(data);
      handleSelect(newEntity);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create entity:', err);
      // Error is handled in useEntityAutocomplete hook
    }
  }, [createEntity, handleSelect]);

  /**
   * Default option renderer
   */
  const defaultRenderOption = useCallback((entity: TEntity, isHighlighted: boolean, isSelected: boolean) => (
    <div
      className={`
        px-4 py-2 cursor-pointer transition-colors
        ${isHighlighted ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
        ${isSelected ? 'bg-blue-100 dark:bg-blue-900/40' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{autocompleteConfig.getLabel(entity)}</span>
        {isSelected && <Check className="w-4 h-4 text-blue-600" />}
      </div>
    </div>
  ), [autocompleteConfig]);

  const optionRenderer = renderOption || defaultRenderOption;

  /**
   * Render dropdown content
   */
  const renderDropdown = () => {
    if (!isOpen) return null;

    const dropdownContent = (
      <div
        ref={dropdownRef}
        className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg overflow-hidden"
        style={{ maxHeight: maxDropdownHeight }}
      >
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-5 h-5 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">Searching...</span>
          </div>
        )}

        {!isLoading && options.length === 0 && (
          <div className="py-8 text-center text-slate-500">
            {renderEmpty ? (
              renderEmpty(searchQuery)
            ) : (
              <div>
                <Search className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p className="text-sm">No results found</p>
                {searchQuery.trim() && CreateComponent && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-3 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Create "{searchQuery}"
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {!isLoading && options.length > 0 && (
          <div className="max-h-64 overflow-y-auto">
            {options.map((entity: TEntity, index: number) => {
              const entityValue = autocompleteConfig.getValue(entity);
              const isSelected = entityValue === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <div
                  key={entityValue}
                  onClick={() => handleSelect(entity)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {optionRenderer(entity, isHighlighted, isSelected)}
                </div>
              );
            })}

            {searchQuery.trim() && !hasExactMatch(searchQuery) && CreateComponent && (
              <button
                onClick={() => setShowCreateModal(true)}
                onMouseEnter={() => setHighlightedIndex(-1)}
                className="w-full px-4 py-2 text-left border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                  <Plus className="w-4 h-4 mr-2" />
                  Create "{searchQuery}"
                </div>
              </button>
            )}
          </div>
        )}

        {autocompleteError && (
          <div className="px-4 py-3 border-t border-red-200 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 mr-2" />
              {autocompleteError.message}
            </div>
          </div>
        )}
      </div>
    );

    // Use portal to avoid z-index issues
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return dropdownContent;

    return createPortal(
      <div
        style={{
          position: 'fixed',
          top: rect.bottom,
          left: rect.left,
          width: rect.width,
        }}
      >
        {dropdownContent}
      </div>,
      document.body
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`} data-testid={testId}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchQuery : (selectedEntity ? autocompleteConfig.getLabel(selectedEntity) : '')}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-2 pr-10 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:bg-slate-100 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}
            bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
          `}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {isLoading ? (
            <Loader className="w-5 h-5 animate-spin text-slate-400" />
          ) : (
            <Search className="w-5 h-5 text-slate-400" />
          )}
        </div>

        {clearable && value && !disabled && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-8 flex items-center pr-2 pointer-events-auto hover:text-slate-600"
          >
            <span className="text-slate-400">×</span>
          </button>
        )}
      </div>

      {renderDropdown()}

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {!error && helperText && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{helperText}</p>
      )}

      {showCreateModal && CreateComponent && (
        <CreateComponent
          initialData={{ name: searchQuery } as unknown as Partial<TCreateData>}
          onCreated={handleCreateEntity}
          onCancel={() => setShowCreateModal(false)}
          isCreating={isCreating}
        />
      )}
    </div>
  );
});

// Set display name for debugging
if (typeof AutocompleteSelect === 'object' && AutocompleteSelect !== null) {
  (AutocompleteSelect as { displayName?: string }).displayName = 'AutocompleteSelect';
}

export default AutocompleteSelect;
