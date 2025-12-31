import { Card } from '@/components/ui/molecules/Card/Card';
import { useQuery } from '@/hooks/useQueryHooks';
import { useTheme } from '@/providers/ThemeContext';
import { DataService } from '@/services/data/dataService';
import { cn } from '@/utils/cn';
import { JurisdictionGeoMap } from '@features/knowledge/jurisdiction';
import { Book, Loader2, MapPin } from 'lucide-react';
import React, { useMemo } from 'react';
import { CourtLevel, groupJurisdictionsByState, StateGroup } from './localRulesMap.utils';
// ✅ Migrated to backend API (2025-12-21)

export const LocalRulesMap: React.FC = () => {
    const { theme } = useTheme();

    // Fetch state jurisdictions dynamically
    const { data: jurisdictions = [], isLoading } = useQuery<unknown[]>(
        ['jurisdictions', 'state'],
        DataService.jurisdiction.getState
    );

    // Transform flat list into grouped state structure dynamically
    const stateGroups = useMemo(() => groupJurisdictionsByState(jurisdictions as any[]), [jurisdictions]);

    return (
        <div className="h-full flex flex-col space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                <div className="lg:col-span-2 h-full min-h-[500px] border rounded-lg shadow-sm overflow-hidden relative">
                    <JurisdictionGeoMap />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-4 rounded-lg shadow-lg max-w-xs">
                        <h4 className="font-bold text-sm mb-2">Interactive Map</h4>
                        <p className="text-xs text-slate-600">Select a jurisdiction node to view local rules, fee schedules, and e-filing requirements.</p>
                    </div>
                </div>

                <div className="flex flex-col gap-6 overflow-hidden">
                    <Card title="Active Jurisdictions" className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" /></div>
                        ) : (
                            <div className="space-y-4">
                                {stateGroups.map((state: StateGroup) => (
                                    <div key={state.id} className="border rounded-lg p-3 hover:shadow-md transition-all cursor-pointer group">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-green-100 rounded-full text-green-700"><MapPin className="h-4 w-4" /></div>
                                            <h4 className={cn("font-bold", theme.text.primary)}>{state.name}</h4>
                                        </div>
                                        <div className="pl-11 space-y-1">
                                            {state.levels.slice(0, 2).map((lvl: CourtLevel, i: number) => (
                                                <div key={i} className="text-xs text-slate-600 flex items-center gap-2">
                                                    <Book className="h-3 w-3 opacity-50" />
                                                    {lvl.name} Rules
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <div className="border rounded-lg p-3 hover:shadow-md transition-all cursor-pointer group border-blue-200 bg-blue-50">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-100 rounded-full text-blue-700"><MapPin className="h-4 w-4" /></div>
                                        <h4 className={cn("font-bold", theme.text.primary)}>Federal: 9th Circuit</h4>
                                    </div>
                                    <div className="pl-11 space-y-1">
                                        <div className="text-xs text-slate-600 flex items-center gap-2">
                                            <Book className="h-3 w-3 opacity-50" />
                                            Local Rules (N.D. Cal)
                                        </div>
                                        <div className="text-xs text-slate-600 flex items-center gap-2">
                                            <Book className="h-3 w-3 opacity-50" />
                                            Local Rules (C.D. Cal)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};
