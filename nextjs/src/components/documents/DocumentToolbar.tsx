import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { cn } from '@/lib/utils';
import { Grid, Layout, List, MoreHorizontal, Search, Split, Wand2 } from 'lucide-react';
import React from 'react';

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

export function DocumentToolbar({
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
}: DocumentToolbarProps) {

  const handleCompare = () => {
    console.log('Compare clicked');
  };

  return (
    <div className="h-14 px-4 border-b flex justify-between items-center shrink-0 bg-background">
      <div className="flex items-center gap-2 flex-1">
        {selectedDocsCount > 0 ? (
          <div className="flex items-center px-3 py-1.5 rounded-md border bg-accent/50 w-full animate-in fade-in duration-200">
            <span className="text-sm font-medium mr-4 text-primary">{selectedDocsCount} Selected</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" title="Compare" onClick={handleCompare}><Split className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" title="Summarize" onClick={onBulkSummarize}>
                {isProcessingAI ? <span className="animate-spin">...</span> : <Wand2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" title="Tag"><MoreHorizontal className="h-4 w-4" /></Button>
            </div>
            <div className="flex-1"></div>
            <Button variant="link" size="sm" onClick={onClearSelection} className="text-xs h-auto py-0">Clear</Button>
          </div>
        ) : (
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors text-muted-foreground group-focus-within:text-primary" />
            <Input
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              placeholder="Search by name, tag, or content..."
              className="pl-10"
            />
          </div>
        )}
      </div>

      <div className="flex gap-2 items-center ml-4 border-l pl-4">
        <div className="flex items-center border rounded-md p-0.5">
          <Button variant="ghost" size="sm" onClick={() => setViewMode('list')} className={cn("h-7 w-7 p-0 rounded-sm", viewMode === 'list' && "bg-secondary")}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setViewMode('grid')} className={cn("h-7 w-7 p-0 rounded-sm", viewMode === 'grid' && "bg-secondary")}>
            <Grid className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant={isDetailsOpen ? "secondary" : "ghost"}
          size="icon"
          className="h-9 w-9 border"
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          title="Toggle Details"
        >
          <Layout className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
