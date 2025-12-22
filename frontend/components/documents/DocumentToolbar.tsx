
import React from 'react';
import { Search, Split, Wand2, MoreHorizontal, List, Grid, Filter, Layout } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useWindow } from '../../context/WindowContext';
import { DiffViewer } from '../common/DiffViewer';

interface DocumentToolbarProps {
  selectedDocsCount: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
  isDetailsOpen: boolean;
  setIsDetailsOpen: (isOpen: boolean) => void;
  isProcessingAI: boolean;
  onBulkSummarize: () => void;
  onClearSelection: () => void;
}

export const DocumentToolbar: React.FC<DocumentToolbarProps> = ({
  selectedDocsCount,
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  isDetailsOpen,
  setIsDetailsOpen,
  isProcessingAI,
  onBulkSummarize,
  onClearSelection
}) => {
  const { theme } = useTheme();
  const { openWindow } = useWindow();

  const handleCompare = () => {
      const winId = `compare-${Date.now()}`;
      openWindow(
          winId,
          'Document Comparison',
          <div className="p-6 h-full bg-white">
             <DiffViewer 
                oldText="Please select two documents to compare."
                newText="Comparison engine requires source selection."
             />
          </div>
      );
  };

  return (
    <div className={cn("h-14 px-4 border-b flex justify-between items-center shrink-0", theme.surface.default, theme.border.default)}>
        <div className="flex items-center gap-2 flex-1">
            {selectedDocsCount > 0 ? (
                <div className={cn("flex items-center px-3 py-1.5 rounded-md border animate-fade-in w-full", theme.primary.light, theme.primary.border)}>
                    <span className={cn("text-sm font-bold mr-4", theme.primary.text)}>{selectedDocsCount} Selected</span>
                    <div className="flex items-center gap-2">
                        <button className={cn("p-1 rounded", theme.primary.text, `hover:${theme.surface.default}`)} title="Compare" onClick={handleCompare}><Split className="h-4 w-4"/></button>
                        <button className={cn("p-1 rounded", theme.primary.text, `hover:${theme.surface.default}`)} title="Summarize" onClick={onBulkSummarize}>
                            {isProcessingAI ? <span className="animate-spin">...</span> : <Wand2 className="h-4 w-4"/>}
                        </button>
                        <button className={cn("p-1 rounded", theme.primary.text, `hover:${theme.surface.default}`)} title="Tag"><MoreHorizontal className="h-4 w-4"/></button>
                    </div>
                    <div className="flex-1"></div>
                    <button onClick={onClearSelection} className={cn("text-xs hover:underline", theme.primary.text)}>Clear</button>
                </div>
            ) : (
                <div className="relative w-full max-w-md group">
                    <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors group-focus-within:text-blue-500", theme.text.tertiary)} />
                    <input 
                        value={searchTerm} 
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSearchTerm(e.target.value)} 
                        placeholder="Search by name, tag, or content..." 
                        className={cn(
                            "w-full pl-10 pr-4 py-2 border rounded-md text-sm outline-none transition-all",
                            theme.surface.highlight,
                            theme.border.default,
                            theme.text.primary,
                            "focus:ring-2 focus:ring-blue-500 focus:bg-white"
                        )} 
                    />
                </div>
            )}
        </div>
        
        <div className={cn("flex gap-2 items-center ml-4 border-l pl-4", theme.border.default)}>
            <div className={cn("flex p-0.5 rounded-lg border", theme.surface.highlight, theme.border.default)}>
                <button 
                    onClick={() => setViewMode('list')}
                    className={cn(
                        "p-1.5 rounded-md transition-all",
                        viewMode === 'list' 
                            ? cn(theme.surface.default, "shadow", theme.primary.text) 
                            : cn(theme.text.secondary, `hover:${theme.text.primary}`)
                    )}
                >
                    <List className="h-4 w-4"/>
                </button>
                <button 
                    onClick={() => setViewMode('grid')}
                    className={cn(
                        "p-1.5 rounded-md transition-all",
                        viewMode === 'grid' 
                            ? cn(theme.surface.default, "shadow", theme.primary.text) 
                            : cn(theme.text.secondary, `hover:${theme.text.primary}`)
                    )}
                >
                    <Grid className="h-4 w-4"/>
                </button>
            </div>
            <button className={cn("p-2 rounded transition-colors", theme.text.secondary, `hover:${theme.text.primary}`, `hover:${theme.surface.highlight}`)}><Filter className="h-4 w-4"/></button>
            <button 
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                className={cn(
                    "p-2 rounded transition-colors",
                    isDetailsOpen 
                        ? cn(theme.primary.text, theme.primary.light)
                        : cn(theme.text.secondary, `hover:${theme.text.primary}`, `hover:${theme.surface.highlight}`)
                )}
                title="Toggle Inspector"
            >
                <Layout className="h-4 w-4"/>
            </button>
        </div>
    </div>
  );
};
