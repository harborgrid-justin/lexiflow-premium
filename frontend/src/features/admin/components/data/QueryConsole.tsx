import { dataPlatformApi } from '@/api/data-platform';
import { useTheme } from '@/features/theme';
import { useQuery } from '@/hooks/backend';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/atoms/Button/Button';
import { CopyButton } from '@/shared/ui/atoms/CopyButton/CopyButton';
import { Modal } from '@/shared/ui/molecules/Modal/Modal';
import { Tabs } from '@/shared/ui/molecules/Tabs/Tabs';
import { VirtualList } from '@/shared/ui/organisms/VirtualList/VirtualList';
import { SqlHelpers } from '@/utils/sqlHelpers';
import { AlignLeft, Bot, Download, Play } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { QuerySidebar } from './query/QuerySidebar';

interface QueryConsoleProps {
    initialTab?: string;
}

export function QueryConsole({ initialTab = 'editor' }: QueryConsoleProps) {
    const { theme } = useTheme();
    const [activeSidebarTab, setActiveSidebarTab] = useState<'schema' | 'history' | 'saved'>('schema');
    const [activeResultsTab, setActiveResultsTab] = useState<'results' | 'explain' | 'visualize'>('results');
    const [query, setQuery] = useState('SELECT id, title, status FROM cases\nWHERE status = \'Active\'\nLIMIT 10;');
    const [results, setResults] = useState<Record<string, unknown>[] | null>(null);
    const [executionTime, setExecutionTime] = useState<string | null>(null);

    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [explainPlan, setExplainPlan] = useState<unknown | null>(null);
    const [isFormatting, setIsFormatting] = useState(false);

    // Dynamic Schema Fetching from real backend
    const { data: schemaTables = [] } = useQuery(
        ['schema', 'tables'],
        () => dataPlatformApi.schemaManagement.getTables()
    );

    const formattedSchema = useMemo(() => {
        const schema: Record<string, { desc: string; columns: unknown }> = {};
        schemaTables.forEach(t => {
            schema[t.name] = {
                desc: `Table: ${t.name}`, // In a real app, description would come from API
                columns: t.columns
            };
        });
        return schema;
    }, [schemaTables]);

    useEffect(() => {
        if (initialTab === 'history') setActiveSidebarTab('history');
        else if (initialTab === 'saved') setActiveSidebarTab('saved');
        else setActiveSidebarTab('schema');
    }, [initialTab]);

    const handleRun = async () => {
        try {
            const result = await dataPlatformApi.queryWorkbench.executeQuery(query);

            if (result.success) {
                setResults(result.data);
                setExecutionTime(`${result.executionTimeMs}ms`);
                setActiveResultsTab('results');
            } else {
                setResults(null);
                setExecutionTime(null);
                // Show error to user
                console.error('Query execution failed:', result.error);
            }
        } catch (error) {
            console.error('Query execution error:', error);
            setResults(null);
            setExecutionTime(null);
        }
    };

    const handleFormat = () => {
        setIsFormatting(true);
        const formatted = SqlHelpers.formatQuery(query);
        setQuery(formatted);
        setTimeout(() => setIsFormatting(false), 200);
    };

    const handleExplain = async () => {
        try {
            const result = await dataPlatformApi.queryWorkbench.explainQuery(query);

            if (result.success) {
                setExplainPlan(result.plan);
                setActiveResultsTab('explain');
            } else {
                console.error('Query explain failed:', result.error);
            }
        } catch (error) {
            console.error('Query explain error:', error);
        }
    };

    const exportCsv = () => {
        if (!results || results.length === 0) return;
        const headers = Object.keys(results[0]!);
        const csvRows = [headers.join(",")];
        csvRows.push(...results.map(row => headers.map(h => JSON.stringify(row[h])).join(",")));
        const csvContent = csvRows.join("\n");

        // Memory Management: Use blob URL pattern with cleanup
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "query_results.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up blob URL immediately
    };

    const visualizableData = useMemo(() => {
        if (!results || results.length < 1) return null;
        const keys = Object.keys(results[0]!);
        const strKey = keys.find(k => typeof results[0]![k] === 'string');
        const numKey = keys.find(k => typeof results[0]![k] === 'number');
        if (strKey && numKey) return { data: results.slice(0, 50), strKey, numKey };
        return null;
    }, [results]);

    const renderResultRow = (row: unknown, index: number) => (
        <div key={`query-result-row-${index}`} className={cn("flex border-b transition-colors h-8", theme.border.default, `hover:${theme.surface.highlight}`)}>
            {Object.values(row as Record<string, unknown>).map((v: unknown, j) => (
                <div key={`query-result-cell-${index}-${j}`} className={cn("flex-1 px-4 py-1.5 font-mono text-xs whitespace-nowrap overflow-hidden text-ellipsis border-r last:border-r-0", theme.border.default)}>
                    {String(v)}
                </div>
            ))}
        </div>
    );

    return (
        <div className={cn("flex flex-col h-full", theme.background)}>
            {shareModalOpen && (
                <Modal isOpen={true} onClose={() => setShareModalOpen(false)} title="Share Query">
                    <div className="p-6 space-y-4">
                        <p className={cn("text-sm", theme.text.secondary)}>Share a secure link to this saved query with your team.</p>
                        <div className={cn("flex gap-2 p-2 rounded border", theme.surface.highlight, theme.border.default)}>
                            <span className="text-sm font-mono truncate">https://lexiflow.ai/query/sh_...</span>
                            <CopyButton text="https://lexiflow.ai/query/sh_..." />
                        </div>
                    </div>
                </Modal>
            )}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                <QuerySidebar activeTab={activeSidebarTab} setActiveTab={setActiveSidebarTab} schema={formattedSchema} />

                <div className="flex-1 flex flex-col min-w-0">
                    <div className={cn("h-[40%] flex flex-col", theme.surface.default)}>
                        <div className={cn("flex justify-between items-center p-2 border-b", theme.border.default, theme.surface.highlight)}>
                            <div className="flex gap-1">
                                <Button size="xs" variant="secondary" icon={AlignLeft} onClick={handleFormat} isLoading={isFormatting}>Format</Button>
                                <Button size="xs" variant="secondary" icon={Bot} onClick={handleExplain}>Explain</Button>
                            </div>
                            <div className="flex gap-2">
                                <Button size="xs" variant="primary" icon={Play} onClick={handleRun}>Run</Button>
                            </div>
                        </div>
                        <textarea
                            className={cn("flex-1 bg-transparent font-mono text-sm outline-none resize-none border-none p-4", theme.text.primary)}
                            value={query} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuery(e.target.value)} spellCheck={false}
                        />
                    </div>

                    <div className={cn("flex-1 overflow-hidden flex flex-col", theme.surface.default, "border-t", theme.border.default)}>
                        <div className={cn("p-2 border-b flex justify-between items-center", theme.surface.highlight, theme.border.default)}>
                            <Tabs
                                tabs={['results', 'explain', 'visualize']}
                                activeTab={activeResultsTab}
                                onChange={(t) => setActiveResultsTab(t as 'results' | 'explain' | 'visualize')}
                            />
                            {results && (
                                <div className="flex items-center gap-2">
                                    <span className={cn("text-xs font-mono", theme.text.secondary)}>{results.length} rows • {executionTime}</span>
                                    <div className="relative group">
                                        <Button size="xs" variant="secondary" icon={Download} onClick={exportCsv}>Export</Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-hidden relative">
                            {activeResultsTab === 'results' && results && results.length > 0 && (
                                <div className="flex flex-col h-full">
                                    <div className={cn("flex border-b font-bold text-xs", theme.surface.highlight, theme.border.default)}>
                                        {Object.keys(results[0]!).map(k => (
                                            <div key={k} className={cn("flex-1 px-4 py-2 border-r last:border-r-0 truncate", theme.border.default, theme.text.secondary)}>{k}</div>
                                        ))}
                                    </div>
                                    <div className="flex-1 relative">
                                        <VirtualList
                                            items={results}
                                            height="100%"
                                            itemHeight={32}
                                            renderItem={renderResultRow}
                                        />
                                    </div>
                                </div>
                            )}
                            {activeResultsTab === 'results' && (!results || results.length === 0) && <div className={cn("p-4 text-sm text-center", theme.text.tertiary)}>No results or query not executed.</div>}
                            {activeResultsTab === 'explain' && !!explainPlan && (
                                <div className={cn("p-4 text-xs font-mono whitespace-pre-wrap", theme.text.primary)}>
                                    {JSON.stringify(explainPlan, null, 2)}
                                </div>
                            )}
                            {activeResultsTab === 'visualize' && visualizableData && (
                                <div className="p-4 h-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={visualizableData.data}><XAxis dataKey={visualizableData.strKey} /><YAxis /><Tooltip /><Bar dataKey={visualizableData.numKey} fill="#8884d8" /></BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QueryConsole;
