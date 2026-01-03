/**
 * @module components/layout/NeuralCommandBar
 * @category Layout
 * @description AI-powered command bar with intent detection and search.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { AlertCircle, Command, CornerDownLeft, Sparkles, X, Zap } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { GeminiService, IntentResult } from '@/services/features/research/geminiService';
import { HolographicRouting } from '@/services/infrastructure/holographicRouting';
import { GlobalSearchResult, SearchService } from '@/services/search/searchService';

// Hooks & Context
import { useClickOutside } from '@/hooks/useClickOutside';
import { useDebounce } from '@/hooks/useDebounce';
import { useListNavigation } from '@/hooks/useListNavigation';
import { useTheme } from '@/contexts/theme/ThemeContext';

// Components
import { HighlightedText } from '@/components/ui/atoms/HighlightedText/HighlightedText';

// Utils & Constants
import { SEARCH_DEBOUNCE_MS, SEARCH_MIN_QUERY_LENGTH } from '@/config/features/search.config';
import { cn } from '@/utils/cn';

interface NeuralCommandBarProps {
    globalSearch: string;
    setGlobalSearch: (s: string) => void;
    onGlobalSearch: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onSearchResultClick?: (result: GlobalSearchResult) => void;
    onNeuralCommand?: (intent: IntentResult) => void;
}

/**
 * NeuralCommandBar - React 18 optimized with useId and useMemo
 */
export const NeuralCommandBar = React.memo<NeuralCommandBarProps>(({
    globalSearch, setGlobalSearch, onGlobalSearch, onSearchResultClick, onNeuralCommand
}) => {
    const { theme } = useTheme();
    const [showResults, setShowResults] = useState(false);
    const [isProcessingIntent, setIsProcessingIntent] = useState(false);
    const [results, setResults] = useState<GlobalSearchResult[]>([]);
    const debouncedSearch = useDebounce(globalSearch, SEARCH_DEBOUNCE_MS);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useClickOutside(searchRef as React.RefObject<HTMLElement>, () => setShowResults(false));

    useEffect(() => {
        const performSearch = async () => {
            if (debouncedSearch.length >= SEARCH_MIN_QUERY_LENGTH && !isProcessingIntent) {
                const serviceResults = await SearchService.search(debouncedSearch);
                setResults(serviceResults.slice(0, 10));
                setShowResults(true);
            } else {
                setResults([]);
                setShowResults(false);
            }
        };
        performSearch();
    }, [debouncedSearch, isProcessingIntent]);

    const handleResultSelect = useCallback((result: GlobalSearchResult) => {
        setGlobalSearch('');
        setShowResults(false);
        if (onSearchResultClick) onSearchResultClick(result);
    }, [onSearchResultClick, setGlobalSearch]);

    const handleNeuralSubmit = useCallback(async () => {
        if (globalSearch.length > 10 || /open|go to|draft|create|show/.test(globalSearch.toLowerCase())) {
            setIsProcessingIntent(true);
            const intent = await GeminiService.predictIntent(globalSearch);

            if (intent.action === 'NAVIGATE' && intent.targetModule) {
                const deepLink = HolographicRouting.resolveTab(intent.targetModule, intent.context);
                intent.context = deepLink || intent.context;
            }

            setIsProcessingIntent(false);

            if (intent.action !== 'UNKNOWN' && onNeuralCommand) {
                setGlobalSearch('');
                onNeuralCommand(intent);
            }
        }
    }, [globalSearch, onNeuralCommand, setGlobalSearch]);

    // Keyboard Navigation Hook (using unified useListNavigation with simple mode)
    const { focusedIndex: activeIndex, setFocusedIndex: setActiveIndex, handleKeyDown } = useListNavigation({
        items: results,
        mode: 'simple',
        isOpen: showResults,
        onSelect: handleResultSelect,
        onClose: () => setShowResults(false),
        circular: true
    });

    const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && activeIndex === -1) {
            handleNeuralSubmit();
            onGlobalSearch(e);
        } else {
            handleKeyDown(e);
        }
    };

    return (
        <div className="relative w-full hidden sm:block max-w-2xl" ref={searchRef}>
            <div className={cn("absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300", isProcessingIntent ? "scale-110 text-purple-600" : theme.text.tertiary)}>
                {isProcessingIntent ? <Sparkles className="h-5 w-5 animate-pulse" /> : <Command className="h-4 w-4" />}
            </div>

            <input
                ref={inputRef}
                type="text"
                placeholder={isProcessingIntent ? "Analyzing intent..." : "Search or type a command (e.g., 'Draft motion for Martinez')..."}
                className={cn(
                    "w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all border shadow-sm font-medium",
                    theme.surface.input,
                    theme.text.primary,
                    isProcessingIntent
                        ? "border-purple-500 ring-2 ring-purple-500/20"
                        : cn(theme.border.default, "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20")
                )}
                value={globalSearch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGlobalSearch(e.target.value)}
                onKeyDown={onInputKeyDown}
                onFocus={() => { if (globalSearch.length > 0) setShowResults(true); }}
                disabled={isProcessingIntent}
            />

            {globalSearch && !isProcessingIntent && (
                <button
                    onClick={() => { setGlobalSearch(''); setShowResults(false); }}
                    className={cn("absolute right-3 top-1/2 -translate-y-1/2", theme.text.tertiary, `hover:${theme.text.primary}`)}
                >
                    <X className="h-4 w-4" />
                </button>
            )}

            {showResults && (
                <div className={cn("absolute top-full left-0 right-0 mt-2 rounded-lg shadow-2xl border overflow-hidden max-h-96 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100", theme.surface.default, theme.border.default)}>
                    <div className={cn("bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-2 border-b flex justify-between items-center", theme.border.default)}>
                        <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider flex items-center">
                            <Sparkles className="h-3 w-3 mr-1" /> AI Command Ready
                        </span>
                        <span className={cn("text-[9px] flex items-center gap-1", theme.text.secondary)}>
                            <kbd className={cn("border rounded px-1 font-mono", theme.border.default)}>↵</kbd> to execute
                        </span>
                    </div>

                    {results.length > 0 ? (
                        <div className="py-1">
                            {/* Optional Quick Actions Header */}
                            {results.length > 0 && results[0].score && results[0].score > 80 && (
                                <div className={cn("px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider flex justify-between", theme.text.tertiary)}>
                                    <span>Top Matches</span>
                                    <span className="flex items-center gap-1"><Zap className="h-2 w-2" /> Instant</span>
                                </div>
                            )}

                            {results.map((result, index) => (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    onClick={() => handleResultSelect(result)}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    className={cn(
                                        "w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors border-b last:border-0",
                                        activeIndex === index
                                            ? cn(theme.surface.highlight, theme.border.default)
                                            : cn(theme.surface.default, theme.border.default)
                                    )}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("text-sm font-bold truncate", theme.text.primary)}>
                                            <HighlightedText text={result.title} query={globalSearch} highlightClassName="bg-yellow-200 dark:bg-yellow-900/50 text-slate-900 dark:text-yellow-100" />
                                        </p>
                                        <p className={cn("text-xs truncate", theme.text.secondary)}>
                                            <HighlightedText text={result.subtitle} query={globalSearch} highlightClassName="bg-yellow-200 dark:bg-yellow-900/50 text-slate-900 dark:text-yellow-100" />
                                        </p>
                                    </div>

                                    {activeIndex === index && (
                                        <div className="hidden sm:flex items-center gap-2 text-[10px] text-blue-600 font-medium animate-in fade-in slide-in-from-left-1">
                                            Open <CornerDownLeft className="h-3 w-3" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className={cn("p-8 text-center flex flex-col items-center justify-center", theme.text.secondary)}>
                            <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm font-medium">No direct matches found.</p>
                            <p className="text-xs mt-1 opacity-70">Try a natural language command like "Find cases about tax fraud".</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});
