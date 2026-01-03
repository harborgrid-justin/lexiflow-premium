import { Button } from '@/components/ui/atoms/Button/Button';
import { Tabs } from '@/components/ui/molecules/Tabs/Tabs';
import { useQuery } from '@/hooks/backend';
import { useTheme } from '@/providers';
import { useWindow } from '@/providers';
import { DataService } from '@/services/data/dataService';
import { cn } from '@/utils/cn';
import { ArrowLeft, ChevronRight, Database, Loader2, Maximize2, Tag } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AccessRequestManager } from './catalog/AccessRequestManager';
import { DataDictionary } from './catalog/DataDictionary';

interface DataDomain {
    name: string;
    count: number;
    desc: string;
}

interface DataCatalogProps {
    initialTab?: string;
    isOrbital?: boolean;
}

export const DataCatalog: React.FC<DataCatalogProps> = ({ initialTab = 'browse', isOrbital = false }) => {
    const { theme } = useTheme();
    const { openWindow } = useWindow();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

    // Sync initialTab prop to state
    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    // Integrated Data Query
    const { data: domains = [], isLoading } = useQuery<DataDomain[]>(
        ['admin', 'catalog_domains'],
        async () => {
            const result = await DataService.catalog.getDataDomains();
            return result as DataDomain[];
        }
    );

    const handlePopOut = () => {
        openWindow(
            'data-catalog-orbital',
            'Enterprise Data Catalog',
            <DataCatalog isOrbital={true} />
        );
    };

    if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className={cn("animate-spin", theme.primary.text)} /></div>;

    return (
        <div className="flex flex-col h-full">
            <div className={cn("px-6 pt-6 border-b shrink-0", theme.border.default)}>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className={cn("text-xl font-bold", theme.text.primary)}>Enterprise Data Catalog</h3>
                        <p className={cn("text-sm", theme.text.secondary)}>Discover, understand, and govern your firm's data.</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        {!isOrbital && (
                            <Button variant="ghost" size="icon" onClick={handlePopOut} title="Open in Window">
                                <Maximize2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
                <Tabs
                    tabs={['browse', 'dictionary', 'requests']}
                    activeTab={activeTab}
                    onChange={(t) => setActiveTab(t as string)}
                />
            </div>

            <div className={cn("flex-1 overflow-hidden flex flex-col min-h-0", theme.surface.highlight)}>
                {activeTab === 'browse' && (
                    <div className="p-6 h-full overflow-y-auto">
                        {!selectedDomain ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                                {domains.map((domain, i) => (
                                    <div
                                        key={`domain-${domain.name}-${i}`}
                                        onClick={() => setSelectedDomain(domain.name)}
                                        className={cn(
                                            "p-5 rounded-lg border transition-all cursor-pointer group relative overflow-hidden hover:shadow-md",
                                            theme.surface.default,
                                            theme.border.default,
                                            `hover:${theme.primary.border}`
                                        )}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={cn("p-2 rounded-lg transition-colors", theme.primary.light, theme.primary.text)}>
                                                <Database className="h-6 w-6" />
                                            </div>
                                            <h4 className={cn("font-bold text-lg", theme.text.primary)}>{domain.name}</h4>
                                        </div>
                                        <p className={cn("text-sm mb-4", theme.text.secondary)}>{domain.desc}</p>
                                        <div className="flex gap-2 text-xs">
                                            <span className={cn("px-2 py-1 rounded flex items-center border", theme.surface.highlight, theme.border.default, theme.text.secondary)}>
                                                <Tag className="h-3 w-3 mr-1" /> {domain.count} Tables
                                            </span>
                                        </div>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                                            <ChevronRight className="h-6 w-6" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="animate-in slide-in-from-right duration-200 space-y-6">
                                <div className="flex items-center gap-4">
                                    <Button variant="ghost" onClick={() => setSelectedDomain(null)} icon={ArrowLeft}>Back</Button>
                                    <h2 className={cn("text-2xl font-bold", theme.text.primary)}>{selectedDomain} <span className={cn("font-normal text-lg", theme.text.tertiary)}>/ Tables</span></h2>
                                </div>
                                {/* In a real implementation, this would drill down into specific tables of the domain */}
                                <div className={cn("rounded-lg border shadow-sm p-8 text-center", theme.surface.default, theme.border.default, theme.text.secondary)}>
                                    <p>Domain-specific table view coming soon. Use the Dictionary tab for full listing.</p>
                                    <Button className="mt-4" onClick={() => setActiveTab('dictionary')}>Go to Dictionary</Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'dictionary' && (
                    <DataDictionary />
                )}

                {activeTab === 'requests' && (
                    <AccessRequestManager />
                )}
            </div>
        </div>
    );
};

export default DataCatalog;
