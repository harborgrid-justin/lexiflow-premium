import { useTheme } from '@/theme';
import { useClickOutside } from '@/shared/hooks/useClickOutside'; // Assuming shared hook
import { Command, Search, X } from 'lucide-react';
import * as styles from './EnhancedSearch.styles';
import { getCategoryIcon, sanitizeHtml } from './helpers';
import type { EnhancedSearchProps } from './types';

// New Imports
import { SEARCH_CATEGORIES } from '@/config/search.config';
import { useEnhancedSearch } from '../../hooks/useEnhancedSearch';

/**
 * EnhancedSearch - React 18 optimized with useId
 */
export const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  placeholder = "Search everything...",
  onSearch,
  suggestions = [],
  onSuggestionSelect,
  showCategories = true,
  showSyntaxHints = true,
  autoFocus = false,
  className,
  debounceDelay = 300
}) => {
  const { theme } = useTheme();

  const {
    query,
    category,
    setCategory,
    isOpen,
    setIsOpen,
    selectedIndex,
    setSelectedIndex,
    inputRef,
    containerRef,
    dropdownRef,
    displayItems,
    handleInputChange,
    handleSuggestionClick,
    handleClear,
    handleKeyDown
  } = useEnhancedSearch({
    onSearch,
    onSuggestionSelect,
    suggestions,
    debounceDelay
  });

  useClickOutside(containerRef as React.RefObject<HTMLElement>, () => setIsOpen(false));

  return (
    <div ref={containerRef} className={styles.searchContainer(className)}>
      {/* Search Input */}
      <div className={styles.getInputContainer(theme, isOpen)}>
        <Search className={styles.getSearchIcon(theme)} />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={(e) => handleKeyDown(e, selectedIndex, setSelectedIndex, setIsOpen)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={styles.getSearchInput(theme)}
        />

        {query && (
          <button
            onClick={handleClear}
            className={styles.getClearButton(theme)}
            title="Clear"
          >
            <X className={styles.clearIcon} />
          </button>
        )}

        {showSyntaxHints && !query && (
          <div className={styles.syntaxHintsContainer}>
            <Command className={styles.commandIcon} />
            <span>K</span>
          </div>
        )}
      </div>

      {/* Categories */}
      {showCategories && (
        <div className={styles.categoriesContainer}>
          {SEARCH_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={styles.getCategoryButton(theme, category === cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {isOpen && displayItems.length > 0 && (
        <div
          ref={dropdownRef}
          className={styles.getDropdownContainer(theme)}
        >
          <div className={styles.dropdownScrollContainer}>
            {displayItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => handleSuggestionClick(item)}
                className={styles.getSuggestionButton(theme, selectedIndex === idx)}
              >
                <div className={styles.getSuggestionIcon(theme, selectedIndex === idx)}>
                  {item.icon || getCategoryIcon(item.category)}
                </div>

                <div className={styles.suggestionContentContainer}>
                  <p
                    className={styles.getSuggestionText(theme, selectedIndex === idx)}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(('highlightedText' in item ? item.highlightedText : undefined) || item.text) }}
                  />
                  {'metadata' in item && item.metadata && (
                    <p className={styles.getSuggestionMetadata(theme, selectedIndex === idx)}>
                      {String(item.metadata.description || '')}
                    </p>
                  )}
                </div>

                <span className={styles.getSuggestionCategory(theme, selectedIndex === idx)}>
                  {item.category}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
