import { cn } from '@/lib/cn';
import { LegalRule } from '@/types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface RuleTreeViewerProps {
  nodes: LegalRule[];
  currentExpandedIds: Set<string>;
  selectedRuleId: string | null;
  toggleExpand: (id: string) => void;
  setSelectedRuleId: (id: string) => void;
  searchTerm: string;
  theme: unknown;
}

export function RuleTreeViewer({
  nodes,
  currentExpandedIds,
  selectedRuleId,
  toggleExpand,
  setSelectedRuleId,
  searchTerm,
  theme,
}: RuleTreeViewerProps) {
  if (nodes.length === 0 && searchTerm.trim()) {
    return (
      <div className={cn("p-4 text-xs italic text-center", (theme as { text: { tertiary: string } }).text.tertiary)}>No rules found matching "{searchTerm}"</div>
    );
  } else if (nodes.length === 0) {
    return <div className={cn("p-4 text-xs italic text-center", (theme as { text: { tertiary: string } }).text.tertiary)}>No rules available.</div>;
  }

  return (
    <ul className="pl-2 space-y-1">
      {nodes.map(node => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = currentExpandedIds.has(node.id);
        const isSelected = selectedRuleId === node.id;

        return (
          <li key={node.id}>
            <button
              onClick={() => {
                if (hasChildren) toggleExpand(node.id);
                else setSelectedRuleId(node.id);
              }}
              className={cn(
                "w-full flex items-center py-1.5 px-2 rounded cursor-pointer transition-colors text-sm text-left",
                isSelected
                  ? cn((theme as { primary: { light: string; text: string } }).primary.light, (theme as { primary: { light: string; text: string } }).primary.text, "font-medium")
                  : cn((theme as { text: { secondary: string }; surface: { highlight: string } }).text.secondary, `hover:${(theme as { text: { secondary: string }; surface: { highlight: string } }).surface.highlight}`)
              )}
            >
              {hasChildren && (
                <span className="mr-1 text-slate-400 shrink-0">
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </span>
              )}
              {!hasChildren && <span className="w-4 shrink-0"></span>} {/* Spacer for alignment */}
              <span className="truncate flex-1">
                <span className="font-bold mr-2">{node.code}</span>
                {node.name}
              </span>
            </button>
            {hasChildren && isExpanded && (
              <RuleTreeViewer
                nodes={node.children!}
                currentExpandedIds={currentExpandedIds}
                selectedRuleId={selectedRuleId}
                toggleExpand={toggleExpand}
                setSelectedRuleId={setSelectedRuleId}
                searchTerm={searchTerm}
                theme={theme}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
};
