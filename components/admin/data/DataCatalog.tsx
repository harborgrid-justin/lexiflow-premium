
import React, { useState, useEffect } from 'react';
import { Search, Tag, Folder, Database, ChevronRight, ArrowLeft, Table, FileText, Key, BookOpen, Info, Maximize2, Loader2 } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../utils/cn';
import { Tabs } from '../../common/Tabs';
import { VirtualList } from '../../common/VirtualList';
import { SearchToolbar } from '../../common/SearchToolbar';
import { useWindow } from '../../../../context/WindowContext';
import { Button } from '../../common/Button';
import { AccessRequestManager } from './catalog/AccessRequestManager';
import { DataService } from '../../../../services/dataService';
import { useQuery } from '../../../../services/queryClient';

interface DataCatalogProps {
    initialTab?: string;
    isOrbital?: boolean;
}

export const DataCatalog: React.FC<DataCatalogProps> = ({ initialTab = 'browse', isOrbital = false }) => {
  const { theme } = useTheme();
  const { openWindow } = useWindow();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Integrated Data Query
  const { data: domains = [], isLoading } = useQuery<any[]>(
      ['admin', 'catalog_domains'],
      DataService.admin.getDataDomains as any
  );

  const dictionaryItems = Array.from({ length: 50 }, (_, i) => ({
      id: `field-${i}`,
      table: i % 2 === 0 ? 'public.cases' : 'public.clients',
      column: i % 2 === 0 ? `field_${i}` : `attr_${i}`,
      type: i % 3 === 0 ? 'VARCHAR(255)' : 'UUID',
      desc: 'Standard field description for enterprise data model.',
      classification: i % 5 === 0 ? 'Confidential' : 'Internal'
  }));

  const handlePopOut = () => {
      openWindow(
          'data-catalog-orbital',
          'Enterprise Data Catalog',
          <DataCatalog isOrbital={true} />
      );
  };

  const renderDictionaryRow = (item: any) => (
      <div key={item.id} className={cn("flex items-center border-b h-16 px-6 transition-colors", theme.border.light, `hover:${theme.surfaceHighlight}`)}>
          <div className={cn("w-[20%] font-mono text-sm font-medium", theme.text.secondary)}>{item.table}</div>
          <div className={cn("w-[20%] font-bold text-sm", theme.text.primary)}>{item.column}</div>
          <div className={cn("w-[15%] text-xs font-mono", theme.text.tertiary)}>{item.type}</div>
          <div className={cn("flex-1 text-sm truncate pr-4", theme.text.secondary)}>{item.desc}</div>
          <div className="w-[15%]">
              <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded border", item.classification === 'Confidential' ? cn(theme.status.error.bg, theme.status.error.text, theme.status.error.border) : cn(theme.surfaceHighlight, theme.border.default, theme.text.secondary))}>
                  {item.classification}
              </span>
          </div>
      </div>
  );

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className={cn("flex flex-col h-full", isOrbital ? cn(theme.surface) : "")}>
        <div className={cn("px-6 pt-6 border-b shrink-0", theme.border.default)}>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className={cn("text-xl font-bold", theme.text.primary)}>Enterprise Data Catalog</h3>
                    <p className={cn("text-sm", theme.text.secondary)}>Discover, understand, and govern your firm's data.</p>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="relative w-64 hidden md:block">
                        <SearchToolbar value={searchTerm} onChange={setSearchTerm} placeholder="Search assets..." className="border-none shadow-none p-0 bg-transparent"/>
                    </div>
                    {!isOrbital && (
                        <Button variant="ghost" size="icon" onClick={handlePopOut} title="Open in Window">
                            <Maximize2 className="h-4 w-4"/>
                        </Button>
                    )}
                </div>
            </div>
            <Tabs 
                tabs={['browse', 'dictionary', 'requests']}
                activeTab={activeTab}
                onChange={(t) => setActiveTab(t as any)}
            />
        </div>

        <div className={cn("flex-1 overflow-hidden flex flex-col min-h-0", theme.surfaceHighlight)}>
            {activeTab === 'browse' && (
                <div className="p-6 h-full overflow-y-auto">
                    {!selectedDomain ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                            {domains.map((domain, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => setSelectedDomain(domain.name)}
                                    className={cn(
                                        "p-5 rounded-lg border transition-all cursor-pointer group relative overflow-hidden hover:shadow-md",
                                        theme.surface,
                                        theme.border.default,
                                        `hover:${theme.primary.border}`
                                    )}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={cn("p-2 rounded-lg transition-colors", theme.primary.light, theme.primary.text)}>
                                            <Database className="h-6 w-6"/>
                                        </div>
                                        <h4 className={cn("font-bold text-lg", theme.text.primary)}>{domain.name}</h4>
                                    </div>
                                    <p className={cn("text-sm mb-4", theme.text.secondary)}>{domain.desc}</p>
                                    <div className="flex gap-2 text-xs">
                                        <span className={cn("px-2 py-1 rounded flex items-center border", theme.surfaceHighlight, theme.border.default, theme.text.secondary)}>
                                            <Tag className="h-3 w-3 mr-1"/> {domain.count} Tables
                                        </span>
                                    </div>
                                    <div className={cn("absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity", theme.text.tertiary)}>
                                        <ChevronRight className="h-6 w-6"/>
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
                            <div className={cn("rounded-lg border shadow-sm p-8 text-center", theme.surface, theme.border.default, theme.text.secondary)}>
                                Table listing for {selectedDomain} would appear here.
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'dictionary' && (
                <div className={cn("flex flex-col h-full", theme.surface)}>
                    <div className={cn("flex items-center px-6 py-3 border-b font-bold text-xs uppercase tracking-wider shrink-0", theme.surfaceHighlight, theme.border.default, theme.text.secondary)}>
                        <div className="w-[20%]">Table</div>
                        <div className="w-[20%]">Column</div>
                        <div className="w-[15%]">Type</div>
                        <div className="flex-1">Description</div>
                        <div className="w-[15%]">Class</div>
                    </div>
                    <div className="flex-1 relative min-h-0">
                        <VirtualList 
                            items={dictionaryItems}
                            height="100%"
                            itemHeight={64}
                            renderItem={renderDictionaryRow}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'requests' && (
                <AccessRequestManager />
            )}
        </div>
    </div>
  );
};
