/**
 * @module components/visual/NexusInspector
 * @category Visual
 * @description Inspector panel for graph node details.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { X, User, Building, Fingerprint, ExternalLink } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers';

// Components
import { Button } from '@/components/ui/atoms/Button/Button';

// Utils & Constants
import { cn } from '@/utils/cn';

// Types
import { Party, EvidenceItem, NexusNodeData } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface NexusInspectorProps {
  /** Node data to inspect. */
  item: NexusNodeData | null;
  /** Callback when inspector is closed. */
  onClose: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const NexusInspector = ({ item, onClose }: NexusInspectorProps) => {
  const { theme } = useTheme();

  // LAYOUT-STABLE: Render empty state with same structure instead of null
  if (!item) {
    return (
      <div className={cn("w-80 border-l h-full flex flex-col", theme.surface.default, theme.border.default)}>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className={cn("text-center", theme.text.tertiary)}>
            <Fingerprint className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Select a node to inspect</p>
          </div>
        </div>
      </div>
    );
  }

  const getIcon = () => {
    switch (item.type) {
        case 'party': return <User className={cn("h-6 w-6", theme.text.link)}/>;
        case 'org': return <Building className="h-6 w-6 text-purple-600"/>;
        case 'evidence': return <Fingerprint className={cn("h-6 w-6", theme.status.warning.text)}/>;
        default: return null;
    }
  };

  const original = item.original;

  return (
    <div className={cn("h-full flex flex-col border-l shadow-xl bg-white animate-in slide-in-from-right duration-300", theme.border.default)}>
        <div className={cn("p-4 border-b flex justify-between items-center", theme.surface.highlight, theme.border.default)}>
            <h3 className={cn("font-bold text-sm flex items-center gap-2", theme.text.primary)}>
                {getIcon()} Inspector
            </h3>
            <button onClick={onClose} className={cn("p-1 rounded hover:bg-slate-200", theme.text.tertiary)}>
                <X className="h-4 w-4" />
            </button>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <h2 className={cn("text-lg font-bold", theme.text.primary)}>{item.label}</h2>

            {(item.type === 'party' || item.type === 'org') && (
                <div className="space-y-3 text-sm">
                    <p><strong>Role:</strong> {(original as Party).role}</p>
                    <p><strong>Counsel:</strong> {(original as Party).counsel || 'N/A'}</p>
                </div>
            )}

            {item.type === 'evidence' && (
                <div className="space-y-3 text-sm">
                    <p><strong>Type:</strong> {(original as EvidenceItem).type}</p>
                    <p><strong>Custodian:</strong> {(original as EvidenceItem).custodian}</p>
                    <p className="text-xs italic text-slate-500">"{(original as EvidenceItem).description}"</p>
                </div>
            )}

            <div className="pt-4 border-t">
                 <Button variant="outline" className="w-full" icon={ExternalLink}>View Full Record</Button>
            </div>
        </div>
    </div>
  );
};
