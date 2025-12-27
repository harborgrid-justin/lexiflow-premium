
import React, { useState } from 'react';
import { Users, GitMerge, XCircle, CheckCircle, ArrowRight, Layers } from 'lucide-react';
import { Card } from '@/components/molecules/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { DataService } from '@/services/data/dataService';
import { useQuery, useMutation, queryClient } from '@/hooks/useQueryHooks';
import { queryKeys } from '@/utils/queryKeys';
import { DedupeCluster } from '@/types';
import { useNotify } from '@/hooks/useNotify';

/**
 * DeduplicationManager - React 18 optimized with React.memo
 */
export const DeduplicationManager = React.memo(() => {
    const { theme } = useTheme();
    const notify = useNotify();

    const { data: clusters = [] } = useQuery<DedupeCluster[]>(
        ['quality', 'dedupe'],
        DataService.quality.getDedupeClusters
    );

    const { mutate: mergeCluster } = useMutation(
        async ({ clusterId, masterId }: { clusterId: string, masterId: string }) => {
            return DataService.quality.mergeCluster(clusterId, masterId);
        },
        {
            onSuccess: () => {
                queryClient.invalidate(queryKeys.quality.dedupe());
                notify.success("Records merged successfully.");
            }
        }
    );

    const { mutate: ignoreCluster } = useMutation(
        DataService.quality.ignoreCluster,
        {
            onSuccess: () => {
                queryClient.invalidate(queryKeys.quality.dedupe());
                notify.info("Cluster ignored.");
            }
        }
    );

    const activeClusters = clusters.filter(c => c.status === 'Pending');

    return (
        <div className="space-y-6 animate-fade-in">
            <div className={cn("p-4 rounded-lg border flex justify-between items-center", theme.status.warning.bg, theme.status.warning.border, theme.status.warning.text)}>
                <div className="flex items-center gap-3">
                    <Layers className="h-5 w-5"/>
                    <div>
                        <h3 className="font-bold text-sm">Duplicate Detection Active</h3>
                        <p className="text-xs">{activeClusters.length} clusters require manual review.</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" className="bg-white/50 border-amber-300 text-amber-900 hover:bg-white">Re-scan</Button>
            </div>

            <div className="space-y-6">
                {activeClusters.map(cluster => (
                    <Card key={cluster.id} noPadding className="overflow-hidden">
                        <div className={cn("p-4 border-b flex justify-between items-center", theme.surface.default, theme.border.default)}>
                            <h4 className={cn("font-bold text-sm", theme.text.primary)}>Potential Duplicate Group #{cluster.id}</h4>
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => ignoreCluster(cluster.id)}>Ignore</Button>
                                <Button size="sm" variant="primary" icon={GitMerge} onClick={() => mergeCluster({ clusterId: cluster.id, masterId: cluster.masterId })}>Merge All</Button>
                            </div>
                        </div>
                        
                        <div className={cn("divide-y border-b", theme.border.default)}>
                            {cluster.duplicates.map(record => (
                                <div key={record.id} className={cn("p-4 flex items-center justify-between transition-colors", record.id === cluster.masterId ? theme.primary.light : "", `hover:${theme.surface.highlight}`)}>
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border", record.id === cluster.masterId ? cn(theme.primary.text, theme.primary.border) : cn(theme.text.tertiary, theme.border.default, theme.surface.default))}>
                                            {record.similarityScore}%
                                        </div>
                                        <div>
                                            <p className={cn("text-sm font-medium", theme.text.primary)}>
                                                {record.name} 
                                                {record.id === cluster.masterId && <Badge variant="info" className="ml-2">Master</Badge>}
                                            </p>
                                            <p className={cn("text-xs font-mono", theme.text.tertiary)}>{record.id}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <span className={cn("text-xs px-2 py-1 rounded border", theme.surface.default, theme.border.default, theme.text.secondary)}>Match: {record.fieldMatch}</span>
                                        {record.id !== cluster.masterId && (
                                            <ArrowRight className="h-4 w-4 text-slate-300"/>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
                
                {activeClusters.length === 0 && (
                    <div className={cn("text-center py-12", theme.text.tertiary)}>
                        <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-20 text-green-500"/>
                        <p>No duplicates found. Your data is clean.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
