import { useEffect, useState } from 'react';

import { Loader2 } from 'lucide-react';
import { JSX } from 'react/jsx-runtime';

import { Tabs } from '@/shared/ui/molecules/Tabs/Tabs';
import { useQuery } from '@/hooks/backend';
import { useTheme } from '@/theme';
import { DataService } from '@/services/data/data-service.service';
import { LineageLink, LineageNode } from '@/types';
import { cn } from '@/shared/lib/cn';

import { ImpactAnalysis } from './lineage/ImpactAnalysis';
import { LineageCanvas } from './lineage/LineageCanvas';

interface LineageGraphProps {
    initialTab?: string;
}

export function LineageGraph({ initialTab = 'graph' }: LineageGraphProps): JSX.Element {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        if (initialTab !== '') { setActiveTab(initialTab); }
    }, [initialTab]);

    const { data: graphData, isLoading } = useQuery<{ nodes: LineageNode[], links: LineageLink[] }>(
        ['lineage', 'graph'],
        () => DataService.catalog.getLineageGraph() as Promise<{ nodes: LineageNode[], links: LineageLink[] }>
    );

    if (isLoading) { return <div className="flex h-full items-center justify-center"><Loader2 className={cn("animate-spin", theme.primary.text)} /></div>; }

    return (
        <div className="flex flex-col h-full">
            <div className={cn("px-6 pt-6 border-b shrink-0", theme.border.default)}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={cn("text-xl font-bold", theme.text.primary)}>Data Lineage Explorer</h3>
                </div>
                <Tabs
                    tabs={['graph', 'impact', 'history']}
                    activeTab={activeTab}
                    onChange={(t) => setActiveTab(t)}
                />
            </div>

            <div className={cn("flex-1 overflow-hidden relative", theme.surface.highlight)}>
                {activeTab === 'graph' && (
                    <LineageCanvas
                        data={graphData}
                    />
                )}

                {activeTab === 'impact' && (
                    <ImpactAnalysis />
                )}

                {activeTab === 'history' && (
                    <div className={cn("p-6 text-center italic", theme.text.tertiary)}>
                        No recent lineage changes detected.
                    </div>
                )}
            </div>
        </div>
    );
}

export default LineageGraph;
