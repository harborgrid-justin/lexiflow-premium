
import React from 'react';
import { X, User, Building, Fingerprint, ExternalLink } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { Button } from '../common/Button';
import { Party, EvidenceItem, Case, NexusNodeData } from '../../types';

interface NexusInspectorProps {
  item: NexusNodeData | null;
  onClose: () => void;
}

export const NexusInspector: React.FC<NexusInspectorProps> = ({ item, onClose }) => {
  const { theme } = useTheme();

  if (!item) return null;

  const getIcon = () => {
    switch (item.type) {
        case 'party': return <User className="h-6 w-6 text-blue-600"/>;
        case 'org': return <Building className="h-6 w-6 text-purple-600"/>;
        case 'evidence': return <Fingerprint className="h-6 w-6 text-amber-600"/>;
        default: return null;
    }
  };

  const original = item.original;
  
  return (
    <div className={cn("h-full flex flex-col border-l shadow-xl bg-white animate-in slide-in-from-right duration-300", theme.border.default)}>
        <div className={cn("p-4 border-b flex justify-between items-center", theme.surfaceHighlight, theme.border.default)}>
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
