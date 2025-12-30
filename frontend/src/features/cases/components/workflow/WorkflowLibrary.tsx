/**
 * @module components/workflow/WorkflowLibrary
 * @category Workflow
 * @description Workflow template library with preview and creation.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Search, Shield, Plus } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '@/services';
import { useQuery } from '@/hooks/useQueryHooks';
import { queryKeys } from '@/utils/queryKeys';

// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';
import { useFilterAndSearch } from '@/hooks/useFilterAndSearch';

// Components
import { TemplatePreview } from './TemplatePreview';
import { ErrorState } from '@/components/molecules';
import { AdaptiveLoader } from '@/components/molecules';

// Utils & Constants
import { cn } from '@/utils/cn';

// Types
import { WorkflowTemplateData } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface WorkflowLibraryProps {
  /** Callback when creating a new workflow. */
  onCreate: (template?: WorkflowTemplateData) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const WorkflowLibrary: React.FC<WorkflowLibraryProps> = ({ onCreate }) => {
  const { theme } = useTheme();

  const { data: templatesData = [], isLoading, isError, refetch } = useQuery<WorkflowTemplateData[]>(
    queryKeys.workflows.templates(),
    () => DataService.workflow.getTemplates()
  );

  // Ensure templates is always an array (defensive check)
  const templates = Array.isArray(templatesData) ? templatesData : [];

  // Use useFilterAndSearch hook for unified filtering
  const { filteredItems: filteredTemplates, searchQuery, setSearchQuery, category, setCategory, categories } = useFilterAndSearch({
    items: templates as unknown as Record<string, unknown>[],
    config: {
      categoryField: 'category',
      searchFields: ['title'],
      arrayFields: ['tags']
    },
    initialCategory: 'All'
  });

  if (isLoading) {
    return <AdaptiveLoader contentType="dashboard" itemCount={8} shimmer />;
  }

  if (isError) {
    return <ErrorState message="Failed to load workflow templates" onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <div className={cn("border rounded-lg p-4 flex items-start gap-4", theme.status.info.bg, theme.status.info.border)}>
        <Shield className={cn("h-6 w-6 mt-1", theme.status.info.text)}/>
        <div>
          <h4 className={cn("font-bold", theme.text.primary)}>Audit-Ready Process Architecture</h4>
          <p className={cn("text-sm", theme.text.secondary)}>Templates are pre-configured to log activity to the immutable Audit Log.</p>
        </div>
      </div>

      <div className={cn("flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-lg border shadow-sm sticky top-0 z-10", theme.surface.default, theme.border.default)}>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                category === cat
                  ? cn(theme.primary.DEFAULT, theme.text.inverse)
                  : cn(theme.surface.highlight, theme.text.secondary, `hover:${theme.border.default}`)
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.tertiary)}/>
          <input
            className={cn(
              "w-full pl-9 pr-4 py-2 border rounded-lg text-sm outline-none transition-all",
              theme.surface.highlight,
              theme.border.default,
              theme.text.primary,
              "focus:ring-2 focus:ring-blue-500"
            )}
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {(filteredTemplates as unknown as WorkflowTemplateData[]).map((tpl) => (
          <TemplatePreview key={tpl.id} data={tpl} onClick={() => onCreate(tpl)} />
        ))}

        <button
          onClick={() => onCreate()}
          className={cn(
            "border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-all h-full min-h-[280px]",
            theme.border.default,
            theme.text.tertiary,
            `hover:${theme.primary.border}`,
            `hover:${theme.primary.text}`,
            `hover:${theme.surface.highlight}`
          )}
        >
          <div className={cn("p-4 rounded-full shadow-sm mb-4", theme.surface.default)}>
            <Plus className="h-8 w-8" />
          </div>
          <span className="font-bold">Design New Workflow</span>
          <span className="text-xs mt-2">Start from scratch</span>
        </button>
      </div>
    </div>
  );
};

