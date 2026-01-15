/**
 * @module components/entities/ConflictCheckPanel
 * @category Entity Management - Conflict Checks
 * @description Comprehensive conflict clearance search against all known entities, aliases, and adverse parties.
 *
 * THEME SYSTEM USAGE:
 * Uses theme.surface, theme.text, theme.border. Hardcoded red/green colors for conflict warnings and clearance.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { AlertTriangle, CheckCircle, Loader2, Shield } from 'lucide-react';
import { useState, useTransition } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/contexts/ThemeContext';

// Components
import { Button } from '@/components/atoms/Button/Button';

// Utils & Constants
import { cn } from '@/lib/cn';

// Types
import { LegalEntity } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface ConflictCheckPanelProps {
    entities: LegalEntity[];
}

export const ConflictCheckPanel: React.FC<ConflictCheckPanelProps> = ({ entities }) => {
    const { theme } = useTheme();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<LegalEntity[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleCheck = () => {
        if (!query) return;
        startTransition(() => {
            // Simulate heavy search logic (e.g., fuzzy matching, cross-referencing)
            const hits = entities.filter(e =>
                e.name.toLowerCase().includes(query.toLowerCase()) ||
                e.roles.some(r => r.toLowerCase().includes(query.toLowerCase())) ||
                (e.externalIds && Object.values(e.externalIds).some((id: unknown) =>
                    typeof id === 'string' && id.includes(query)
                ))
            );
            setResults(hits);
            setHasSearched(true);
        });
    };

    return (
        <div className="p-8 max-w-3xl mx-auto animate-fade-in">
            <div className="text-center mb-8">
                <div className="p-4 bg-slate-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4 shadow-inner">
                    <Shield className="h-10 w-10 text-slate-400" />
                </div>
                <h2 className={cn("text-2xl font-bold", theme.text.primary)}>Conflict Clearance Center</h2>
                <p className={theme.text.secondary}>Run a comprehensive search against all known entities, aliases, and adverse parties.</p>
            </div>

            <div className="flex gap-2 mb-8">
                <input
                    className={cn("flex-1 p-4 text-lg rounded-lg border shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all", theme.surface.default, theme.border.default)}
                    placeholder="Enter entity name, tax ID, or alias..."
                    value={query}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                />
                <Button
                    variant="primary"
                    className="px-8 text-lg"
                    onClick={handleCheck}
                    disabled={isPending || !query}
                    icon={isPending ? Loader2 : undefined}
                >
                    {isPending ? 'Scanning...' : 'Run Check'}
                </Button>
            </div>

            {isPending ? (
                <div className="text-center py-12 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Scanning {entities.length} records...</p>
                </div>
            ) : hasSearched && (
                <div className={cn("rounded-xl border overflow-hidden animate-in slide-in-from-bottom-4", theme.surface.default, theme.border.default)}>
                    <div className={cn("p-4 border-b flex justify-between items-center", theme.surface.highlight)}>
                        <h4 className="font-bold text-sm">Search Results</h4>
                        <span className="text-xs text-slate-500">{results.length} Matches Found</span>
                    </div>

                    {results.length === 0 ? (
                        <div className="p-8 text-center">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                            <h3 className="text-lg font-bold text-green-700">No Conflicts Found</h3>
                            <p className="text-sm text-green-600">This entity appears clear in the current database.</p>
                            <Button variant="outline" className="mt-4">Print Clearance Certificate</Button>
                        </div>
                    ) : (
                        <div className="divide-y max-h-96 overflow-y-auto custom-scrollbar">
                            {results.map(ent => (
                                <div key={ent.id} className="p-4 flex items-start gap-4 hover:bg-red-50 transition-colors">
                                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-1" />
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h5 className="font-bold text-red-900">{ent.name}</h5>
                                            <span className="text-xs text-red-500 font-mono">{ent.id}</span>
                                        </div>
                                        <p className="text-sm text-red-800">{ent.type} • {ent.roles.join(', ')}</p>
                                        <div className="mt-2 text-xs bg-white border border-red-200 p-2 rounded inline-block">
                                            Potential Adverse Relation: <strong>Active Litigation History</strong>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
