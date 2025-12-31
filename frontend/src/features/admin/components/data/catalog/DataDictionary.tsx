
import { Badge } from '@/components/ui/atoms/Badge/Badge';
import { Button } from '@/components/ui/atoms/Button/Button';
import { ErrorState } from '@/components/ui/molecules/ErrorState/ErrorState';
import { SearchToolbar } from '@/components/organisms/SearchToolbar';
import { VirtualList } from '@/components/organisms/VirtualList/VirtualList';
import { useQuery } from '@/hooks/backend';
import { useSelection } from '@/hooks/core';
import { useTheme } from '@/providers/ThemeContext';
import { DataService } from '@/services/data/dataService';
import { DataDictionaryItem } from '@/types';
import { cn } from '@/utils/cn';
import { Eye, Filter, Loader2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { DictionaryItemDetail } from './DictionaryItemDetail';

export const DataDictionary: React.FC = () => {
    const { theme } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [activeDomain, setActiveDomain] = useState('All');
    const itemSelection = useSelection<DataDictionaryItem>();

    const { data: items = [], isLoading, error, refetch } = useQuery<DataDictionaryItem[]>(
        ['catalog', 'dictionary'],
        DataService.catalog.getDictionary
    );

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = item.column.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.table.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDomain = activeDomain === 'All' || item.domain === activeDomain;
            return matchesSearch && matchesDomain;
        });
    }, [items, searchTerm, activeDomain]);

    const getClassificationColor = (classification: string) => {
        switch (classification) {
            case 'Restricted': return 'error';
            case 'Confidential': return 'warning';
            case 'Internal': return 'info';
            default: return 'success';
        }
    };

    const handleSelect = (item: DataDictionaryItem) => {
        itemSelection.select(item);
    };

    const handleCloseDetail = () => {
        itemSelection.deselect();
        refetch(); // Refresh list on close to catch edits
    };

    const renderRow = (item: DataDictionaryItem) => (
        <div
            key={item.id}
            onClick={() => handleSelect(item)}
            className={cn("flex items-center border-b h-16 px-6 cursor-pointer transition-colors group", theme.border.default, `hover:${theme.surface.highlight}`)}
        >
            <div className={cn("w-[25%] font-mono text-sm font-medium truncate", theme.text.secondary)} title={item.table}>{item.table}</div>
            <div className={cn("w-[20%] font-bold text-sm truncate", theme.primary.text)} title={item.column}>{item.column}</div>
            <div className={cn("w-[15%] text-xs font-mono", theme.text.tertiary)}>{item.dataType}</div>
            <div className={cn("flex-1 text-sm truncate pr-4", theme.text.secondary)}>{item.description}</div>
            <div className="w-[15%]">
                <Badge variant={getClassificationColor(item.classification)}>{item.classification}</Badge>
            </div>
            <div className="w-10 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="ghost" icon={Eye} />
            </div>
        </div>
    );

    if (error) return <ErrorState message="Failed to load data dictionary" onRetry={refetch} />;
    if (itemSelection.selected) {
        return <DictionaryItemDetail item={itemSelection.selected} onClose={handleCloseDetail} />;
    }

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex justify-between items-center px-1">
                <div className="flex-1 max-w-xl">
                    <SearchToolbar
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search definitions, columns, or tables..."
                        className="border-none shadow-none p-0 bg-transparent"
                        actions={
                            <Button variant="secondary" icon={Filter} onClick={() => setShowFilters(!showFilters)}>
                                {activeDomain !== 'All' ? activeDomain : 'Filter'}
                            </Button>
                        }
                    />
                </div>
                <div className="flex gap-2">
                    {['All', 'Legal', 'Finance', 'HR', 'IT'].map(dom => (
                        <button
                            key={dom}
                            onClick={() => setActiveDomain(dom)}
                            className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-full transition-colors border",
                                activeDomain === dom
                                    ? cn(theme.primary.light, theme.primary.text, theme.primary.border)
                                    : cn(theme.surface.default, theme.text.secondary, theme.border.default, `hover:${theme.surface.highlight}`)
                            )}
                        >
                            {dom}
                        </button>
                    ))}
                </div>
            </div>

            <div className={cn("flex-1 border rounded-lg overflow-hidden flex flex-col", theme.surface.default, theme.border.default)}>
                <div className={cn("flex items-center px-6 py-3 border-b font-bold text-xs uppercase tracking-wider shrink-0", theme.border.default, theme.surface.highlight, theme.text.secondary)}>
                    <div className="w-[25%]">Table Name</div>
                    <div className="w-[20%]">Column / Field</div>
                    <div className="w-[15%]">Data Type</div>
                    <div className="flex-1">Description</div>
                    <div className="w-[15%]">Class</div>
                    <div className="w-10"></div>
                </div>

                <div className="flex-1 relative">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-blue-600" /></div>
                    ) : filteredItems.length > 0 ? (
                        <VirtualList
                            items={filteredItems}
                            height="100%"
                            itemHeight={64}
                            renderItem={renderRow}
                        />
                    ) : (
                        <div className={cn("flex items-center justify-center h-full", theme.text.tertiary)}>No definitions found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};
