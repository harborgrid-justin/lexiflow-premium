/**
 * Review.tsx
 * Document Review Interface for E-Discovery
 * Full-featured document review with coding panel
 * 
 * REACT V18 CONCURRENT-SAFE:
 * - G21: Renders interruptible, no side effects during render
 * - G22: Context (theme) immutable throughout
 * - G23: State updates immutable (spread operators)
 * - G24: Effects idempotent for StrictMode
 * - G25: Already uses useTransition for concurrent updates
 * - G28: Pure function of props and context
 * - G33: Explicit loading/pending states exposed
 * - G34: Query reads side-effect free
 */

import { Button } from '@/shared/ui/atoms/Button';
import { Input } from '@/shared/ui/atoms/Input';
import { TextArea } from '@/shared/ui/atoms/TextArea';
import { useTheme } from '@/theme';
import { useNotify } from '@/hooks/useNotify';
import { queryClient, useMutation, useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { DiscoveryRepository } from '@/services/data/repositories/DiscoveryRepository';
import type { DocumentCoding, ReviewDocument } from '@/types/discovery-enhanced';
import { cn } from '@/shared/lib/cn';
import { ChevronLeft, ChevronRight, Download, Eye, FileText, Filter, Flag, MessageSquare, Search, Tag } from 'lucide-react';
import { useCallback, useMemo, useState, useTransition } from 'react';

interface ReviewProps {
  caseId?: string;
}

export function Review({ caseId }: ReviewProps) {
  const { theme } = useTheme();
  const notify = useNotify();

  // Access Discovery Repository
  const discoveryRepo = DataService.discovery as unknown as DiscoveryRepository;

  // Fetch Review Documents
  const { data: documents = [], isLoading } = useQuery<ReviewDocument[]>(
    caseId ? ['discovery', 'review', 'documents', caseId] : ['discovery', 'review', 'documents'],
    async () => discoveryRepo.getReviewDocuments(caseId ? { caseId } : undefined)
  );

  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [currentCoding, setCurrentCoding] = useState<DocumentCoding>({
    responsive: 'not_coded',
    privileged: 'not_coded',
    confidential: 'not_coded',
    hotDocument: false,
    redactionRequired: false
  });
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [, startTransition] = useTransition();

  const currentDoc = documents[currentDocIndex];

  // Fetch content for current document
  const { data: docContent, isLoading: isLoadingContent } = useQuery(
    currentDoc ? ['documents', currentDoc.id || currentDoc.documentId, 'content'] : ['documents', 'unknown', 'content'],
    () => (currentDoc ? DataService.documents.getContent(currentDoc.id || currentDoc.documentId) : Promise.resolve(null)),
    { enabled: !!currentDoc }
  );

  // Update coding when document changes
  React.useEffect(() => {
    if (documents[currentDocIndex]) {
      setCurrentCoding(documents[currentDocIndex].coding || {
        responsive: 'not_coded',
        privileged: 'not_coded',
        confidential: 'not_coded',
        hotDocument: false,
        redactionRequired: false
      });
      // Reset notes or fetch them if they exist on the document
      setNotes('');
    }
  }, [currentDocIndex, documents]);

  const handleSearchChange = useCallback((value: string) => {
    startTransition(() => {
      setSearchQuery(value);
    });
  }, []);
  const [showFilters, setShowFilters] = useState(false);

  const handleNextDocument = () => {
    if (currentDocIndex < documents.length - 1) {
      setCurrentDocIndex(currentDocIndex + 1);
    }
  };

  const handlePreviousDocument = () => {
    if (currentDocIndex > 0) {
      setCurrentDocIndex(currentDocIndex - 1);
    }
  };

  // Update Coding Mutation
  const { mutate: saveCoding } = useMutation(
    async ({ id, coding, notes }: { id: string; coding: DocumentCoding; notes?: string }) => {
      return discoveryRepo.updateDocumentCoding(id, coding, notes);
    },
    {
      onSuccess: () => {
        queryClient.invalidate(['discovery', 'review', 'documents']);
        notify.success('Document coding saved successfully');
        handleNextDocument();
      },
      onError: (error) => {
        console.error('Failed to save coding:', error);
        notify.error('Failed to save document coding');
      }
    }
  );

  const handleSaveCoding = () => {
    if (currentDoc) {
      saveCoding({ id: currentDoc.id, coding: currentCoding, notes });
    }
  };

  const handleCodingChange = (field: keyof DocumentCoding, value: DocumentCoding[keyof DocumentCoding]) => {
    setCurrentCoding(prev => ({ ...prev, [field]: value }));
  };

  const stats = useMemo(() => ({
    total: documents.length,
    reviewed: documents.filter(d => d.reviewStatus === 'reviewed').length,
    responsive: documents.filter(d => d.coding?.responsive === 'yes').length,
    privileged: documents.filter(d => d.coding?.privileged === 'yes').length,
    flagged: documents.filter(d => d.coding?.hotDocument).length
  }), [documents]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading documents...</div>;
  }

  if (documents.length === 0) {
    return <div className="p-8 text-center">No documents found for review.</div>;
  }

  return (
    <div className="h-full flex flex-col space-y-4 animate-fade-in">
      {/* Header with Search and Stats */}
      <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={cn("font-bold text-lg", theme.text.primary)}>Document Review</h3>
          <div className="flex gap-2">
            <Button variant="secondary" icon={Filter} onClick={() => setShowFilters(!showFilters)}>
              Filters
            </Button>
            <Button variant="secondary" icon={Download}>Export Results</Button>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.tertiary)} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={cn("w-full pl-10 pr-4 py-2 border rounded-lg text-sm", theme.surface.default, theme.border.default)}
            />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <div className={cn("p-3 rounded border", theme.surface.highlight, theme.border.default)}>
            <div className={cn("text-xs uppercase font-bold", theme.text.secondary)}>Total</div>
            <div className={cn("text-xl font-bold", theme.text.primary)}>{stats.total}</div>
          </div>
          <div className={cn("p-3 rounded border", theme.surface.highlight, theme.border.default)}>
            <div className={cn("text-xs uppercase font-bold", theme.text.secondary)}>Reviewed</div>
            <div className={cn("text-xl font-bold", theme.text.primary)}>{stats.reviewed}</div>
          </div>
          <div className={cn("p-3 rounded border", theme.surface.highlight, theme.border.default)}>
            <div className={cn("text-xs uppercase font-bold", theme.text.secondary)}>Responsive</div>
            <div className="text-xl font-bold text-green-600">{stats.responsive}</div>
          </div>
          <div className={cn("p-3 rounded border", theme.surface.highlight, theme.border.default)}>
            <div className={cn("text-xs uppercase font-bold", theme.text.secondary)}>Privileged</div>
            <div className="text-xl font-bold text-amber-600">{stats.privileged}</div>
          </div>
          <div className={cn("p-3 rounded border", theme.surface.highlight, theme.border.default)}>
            <div className={cn("text-xs uppercase font-bold", theme.text.secondary)}>Flagged</div>
            <div className="text-xl font-bold text-red-600">{stats.flagged}</div>
          </div>
        </div>
      </div>

      {/* Main Review Interface */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Document Viewer */}
        <div className={cn("col-span-8 rounded-lg border flex flex-col", theme.surface.default, theme.border.default)}>
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className={cn("h-5 w-5", theme.text.tertiary)} />
              <div>
                <div className={cn("font-medium", theme.text.primary)}>{currentDoc?.fileName}</div>
                <div className={cn("text-xs", theme.text.tertiary)}>
                  Bates: {currentDoc?.batesNumber} | Custodian: {currentDoc?.custodian}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={ChevronLeft}
                onClick={handlePreviousDocument}
                disabled={currentDocIndex === 0}
              >
                Previous
              </Button>
              <span className={cn("text-sm px-3", theme.text.secondary)}>
                {currentDocIndex + 1} of {documents.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                icon={ChevronRight}
                onClick={handleNextDocument}
                disabled={currentDocIndex === documents.length - 1}
              >
                Next
              </Button>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {/* Document Preview Area */}
            <div className={cn("p-8 rounded border min-h-full", theme.surface.highlight, theme.border.default)}>
              <div className="mb-4">
                <h4 className={cn("font-bold text-lg mb-2", theme.text.primary)}>
                  {currentDoc?.subject || currentDoc?.fileName}
                </h4>
                <div className={cn("text-sm space-y-1", theme.text.secondary)}>
                  <div><strong>From:</strong> {currentDoc?.author}</div>
                  {currentDoc?.recipients && <div><strong>To:</strong> {currentDoc?.recipients.join(', ')}</div>}
                  <div><strong>Date:</strong> {currentDoc?.dateCreated}</div>
                </div>
              </div>
              <div className={cn("prose max-w-none whitespace-pre-wrap font-serif", theme.text.primary)}>
                {isLoadingContent ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  (docContent || currentDoc?.content || "No content available for this document.") as React.ReactNode
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Coding Panel */}
        <div className={cn("col-span-4 rounded-lg border flex flex-col", theme.surface.default, theme.border.default)}>
          <div className="p-4 border-b">
            <h4 className={cn("font-bold", theme.text.primary)}>Document Coding</h4>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Responsive Coding */}
            <div>
              <label className={cn("block text-xs font-bold uppercase mb-2", theme.text.secondary)}>
                Responsive
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['yes', 'no', 'maybe'] as const).map(option => (
                  <button
                    key={option}
                    onClick={() => handleCodingChange('responsive', option)}
                    className={cn(
                      "px-3 py-2 rounded border text-sm font-medium transition-colors",
                      currentCoding.responsive === option
                        ? 'bg-blue-600 text-white border-blue-600'
                        : cn(theme.surface.default, theme.border.default, theme.text.primary)
                    )}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Privilege Coding */}
            <div>
              <label className={cn("block text-xs font-bold uppercase mb-2", theme.text.secondary)}>
                Privileged
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['yes', 'no'] as const).map(option => (
                  <button
                    key={option}
                    onClick={() => handleCodingChange('privileged', option)}
                    className={cn(
                      "px-3 py-2 rounded border text-sm font-medium transition-colors",
                      currentCoding.privileged === option
                        ? 'bg-amber-600 text-white border-amber-600'
                        : cn(theme.surface.default, theme.border.default, theme.text.primary)
                    )}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Privilege Type (if privileged) */}
            {currentCoding.privileged === 'yes' && (
              <div>
                <label className={cn("block text-xs font-bold uppercase mb-2", theme.text.secondary)}>
                  Privilege Type
                </label>
                <select
                  title="Select privilege type"
                  className={cn("w-full p-2 border rounded text-sm", theme.surface.default, theme.border.default)}
                  value={currentCoding.privilegeType || ''}
                  onChange={(e) => handleCodingChange('privilegeType', (e.target.value || undefined) as "attorney-client" | "work-product" | "both" | undefined)}
                >
                  <option value="">Select...</option>
                  <option value="attorney-client">Attorney-Client</option>
                  <option value="work-product">Work Product</option>
                  <option value="both">Both</option>
                </select>
              </div>
            )}

            {/* Confidential */}
            <div>
              <label className={cn("block text-xs font-bold uppercase mb-2", theme.text.secondary)}>
                Confidential
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['yes', 'no'] as const).map(option => (
                  <button
                    key={option}
                    onClick={() => handleCodingChange('confidential', option)}
                    className={cn(
                      "px-3 py-2 rounded border text-sm font-medium transition-colors",
                      currentCoding.confidential === option
                        ? 'bg-red-600 text-white border-red-600'
                        : cn(theme.surface.default, theme.border.default, theme.text.primary)
                    )}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Flags */}
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentCoding.hotDocument || false}
                  onChange={(e) => handleCodingChange('hotDocument', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Flag className="h-4 w-4 text-red-600" />
                <span className={cn("text-sm", theme.text.primary)}>Hot Document</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentCoding.redactionRequired || false}
                  onChange={(e) => handleCodingChange('redactionRequired', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Eye className="h-4 w-4 text-yellow-600" />
                <span className={cn("text-sm", theme.text.primary)}>Redaction Required</span>
              </label>
            </div>

            {/* Issues/Tags */}
            <div>
              <label className={cn("block text-xs font-bold uppercase mb-2", theme.text.secondary)}>
                <Tag className="h-3 w-3 inline mr-1" />
                Issues/Tags
              </label>
              <Input
                placeholder="Add tags (comma-separated)"
                value={currentCoding.issues?.join(', ') || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleCodingChange('issues', e.target.value.split(',').map(t => t.trim()).filter(Boolean))
                }
              />
            </div>

            {/* Notes */}
            <div>
              <label className={cn("block text-xs font-bold uppercase mb-2", theme.text.secondary)}>
                <MessageSquare className="h-3 w-3 inline mr-1" />
                Review Notes
              </label>
              <TextArea
                placeholder="Add review notes..."
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* Save Button  */}
          <div className="p-4 border-t">
            <Button variant="primary" className="w-full" onClick={handleSaveCoding}>
              Save Coding & Next Document
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
