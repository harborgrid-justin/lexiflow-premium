
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Sparkles, Command, ArrowRight, X, Zap, AlertCircle } from 'lucide-react';
import { GlobalSearchResult, SearchService } from '../../services/searchService';
import { GeminiService, IntentResult } from '../../services/geminiService';
import { useDebounce } from '../../hooks/useDebounce';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { HolographicRouting } from '../../services/holographicRouting';
import { Trie } from '../../utils/trie';
import { Scheduler } from '../../utils/scheduler';

interface NeuralCommandBarProps {
  globalSearch: string;
  setGlobalSearch: (s: string) => void;
  onGlobalSearch: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSearchResultClick?: (result: GlobalSearchResult) => void;
  onNeuralCommand?: (intent: IntentResult) => void;
}

export const NeuralCommandBar: React.FC<NeuralCommandBarProps> = ({
  globalSearch, setGlobalSearch, onGlobalSearch, onSearchResultClick, onNeuralCommand
}) => {
  const { theme } = useTheme();
  const [showResults, setShowResults] = useState(false);
  const [isProcessingIntent, setIsProcessingIntent] = useState(false);
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const debouncedSearch = useDebounce(globalSearch, 150); // Faster debounce due to Trie
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Trie
  const searchTrie = useMemo(() => new Trie(), []);
  const [isTrieReady, setIsTrieReady] = useState(false);

  // Preload Trie with non-blocking chunks
  useEffect(() => {
    const buildIndex = async () => {
        // Fetch base data for index
        const data = await SearchService.search(''); // Empty search returns top items/recent
        
        let i = 0;
        const CHUNK_SIZE = 50;

        const processChunk = () => {
            const chunkEnd = Math.min(i + CHUNK_SIZE, data.length);
            for (; i < chunkEnd; i++) {
                const item = data[i];
                searchTrie.insert(item.title, item);
                if (item.subtitle) searchTrie.insert(item.subtitle, item);
            }

            if (i < data.length) {
                Scheduler.defer(processChunk);
            } else {
                setIsTrieReady(true);
            }
        };

        Scheduler.defer(processChunk);
    };
    buildIndex();
  }, [searchTrie]);

  // Hybrid Search Logic: Trie -> Levenshtein -> Full Text
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearch.length >= 1 && !isProcessingIntent) {
        
        // 1. O(L) Trie Prefix Lookup (Instant)
        let matches = searchTrie.search(debouncedSearch);

        // 2. If few results, try Levenshtein (Fuzzy) on specific hot terms
        if (matches.length < 3 && debouncedSearch.length > 3) {
            // This would usually check against a cached list of all titles
            // For demo, we assume the SearchService.search handles the heavy lifting if Trie fails
            const fuzzyResults = await SearchService.search(debouncedSearch);
            // Dedupe
            const existingIds = new Set(matches.map(m => m.id));
            fuzzyResults.forEach(r => {
                if (!existingIds.has(r.id)) matches.push(r);
            });
        } else if (matches.length === 0) {
             // Fallback to full search service
             matches = await SearchService.search(debouncedSearch);
        }

        setResults(matches.slice(0, 8)); // Limit visual results
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    };
    performSearch();
  }, [debouncedSearch, isProcessingIntent, searchTrie]);

  // Outside Click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultSelect = (result: GlobalSearchResult) => {
    setGlobalSearch('');
    setShowResults(false);
    if (onSearchResultClick) onSearchResultClick(result);
  };

  const handleNeuralSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && globalSearch.trim().length > 0) {
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
          return;
        }
      }
      onGlobalSearch(e);
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
            placeholder={isProcessingIntent ? "Analyzing intent..." : "Search or type a command (e.g., 'Open Martinez case and draft motion')..."} 
            className={cn(
                "w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all border shadow-sm font-medium",
                theme.surface,
                theme.text.primary,
                isProcessingIntent ? "border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/10" : cn(theme.border.default, "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20")
            )} 
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            onKeyDown={handleNeuralSubmit}
            onFocus={() => { if(globalSearch.length > 0) setShowResults(true); }}
            disabled={isProcessingIntent}
        />

        {globalSearch && !isProcessingIntent && (
            <button 
            onClick={() => { setGlobalSearch(''); setShowResults(false); }}
            className={cn("absolute right-3 top-1/2 -translate-y-1/2 hover:text-slate-600", theme.text.tertiary)}
            >
            <X className="h-4 w-4" />
            </button>
        )}

        {showResults && (
            <div className={cn("absolute top-full left-0 right-0 mt-2 rounded-lg shadow-2xl border overflow-hidden max-h-96 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100", theme.surface, theme.border.default)}>
                <div className={cn("bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-3 border-b flex justify-between items-center", theme.border.default)}>
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider flex items-center">
                        <Sparkles className="h-3 w-3 mr-1"/> AI Command Ready
                    </span>
                    <span className={cn("text-[10px]", theme.text.secondary)}>Press Enter to execute</span>
                </div>

                {results.length > 0 ? (
                    <div className="py-2">
                        <div className={cn("px-3 py-2 text-xs font-semibold uppercase tracking-wider flex justify-between", theme.text.tertiary)}>
                            <span>Direct Matches</span>
                            {results.length > 0 && <span className="text-[9px] border px-1 rounded flex items-center gap-1"><Zap className="h-2 w-2"/> Instant</span>}
                        </div>
                        {results.map((result) => (
                            <button
                                key={`${result.type}-${result.id}`}
                                onClick={() => handleResultSelect(result)}
                                className={cn("w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b last:border-0", theme.border.light, `hover:${theme.surfaceHighlight}`)}
                            >
                                <div>
                                    <p className={cn("text-sm font-bold", theme.text.primary)}>{result.title}</p>
                                    <p className={cn("text-xs", theme.text.secondary)}>{result.subtitle}</p>
                                </div>
                                <ArrowRight className={cn("h-4 w-4 ml-auto opacity-0 group-hover:opacity-100", theme.text.tertiary)}/>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className={cn("p-8 text-center flex flex-col items-center justify-center", theme.text.secondary)}>
                         <AlertCircle className="h-8 w-8 mb-2 opacity-50"/>
                        <p className="text-sm font-medium">No direct matches found.</p>
                        <p className="text-xs mt-1 opacity-70">Try a natural language command like "Find cases about tax fraud".</p>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};
