// components/admin/data/ApiGateway.tsx
import React, { useState } from 'react';
import { useQuery } from '../../../services/queryClient';
import { DataService } from '../../../services/dataService';
import { ApiServiceSpec, ApiMethod } from '../../../types';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Loader2, Server, ChevronRight } from 'lucide-react';
import { Badge } from '../../common/Badge';

// Internal CodeBlock component for syntax highlighting
const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
    const { theme, mode } = useTheme();
    
    // Simple regex highlighting for JSON
    const highlighted = code
        .replace(/"([^"]+)":/g, `<span class="${mode === 'dark' ? 'text-purple-300' : 'text-purple-600'}">"$1"</span>:`)
        .replace(/: "([^"]+)"/g, `: <span class="${mode === 'dark' ? 'text-amber-300' : 'text-amber-700'}">"$1"</span>`)
        .replace(/: (\d+\.?\d*)/g, `: <span class="${mode === 'dark' ? 'text-sky-300' : 'text-sky-600'}">$1</span>`)
        .replace(/: (true|false)/g, `: <span class="${mode === 'dark' ? 'text-rose-400' : 'text-rose-600'}">$1</span>`);
    
    return (
        <pre className={cn("bg-slate-800 text-slate-300 p-4 rounded-lg text-xs font-mono overflow-x-auto", theme.border.default)}>
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
    );
};

// Internal MethodCard component
const MethodCard: React.FC<{ method: ApiMethod }> = ({ method }) => {
    const { theme } = useTheme();
    const httpColors: Record<string, string> = {
        GET: 'bg-blue-100 text-blue-700',
        POST: 'bg-green-100 text-green-700',
        PUT: 'bg-amber-100 text-amber-700',
        DELETE: 'bg-red-100 text-red-700',
    };
    return (
        <div className={cn("p-6 rounded-lg border", theme.surface.default, theme.border.default)}>
            <div className="flex justify-between items-center mb-4">
                <h4 className={cn("text-lg font-mono font-bold", theme.text.primary)}>{method.name}</h4>
                <div className={cn("flex items-center gap-2", theme.text.secondary)}>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${httpColors[method.http]}`}>{method.http}</span>
                    <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{method.path}</span>
                </div>
            </div>
            <p className={cn("text-sm mb-6", theme.text.secondary)}>{method.description}</p>
            
            {method.params.length > 0 && (
                <div className="mb-6">
                    <h5 className={cn("text-xs font-bold uppercase mb-2", theme.text.tertiary)}>Parameters</h5>
                    <div className={cn("border rounded-lg overflow-hidden", theme.border.default)}>
                        {method.params.map((p, i) => (
                            <div key={i} className={cn("grid grid-cols-3 gap-4 p-3 border-b last:border-0", theme.border.light)}>
                                <code className={cn("font-bold", theme.text.primary)}>{p.name}</code>
                                <code className={cn("text-purple-600 dark:text-purple-400", theme.text.secondary)}>{p.type}</code>
                                <p className={cn("text-xs", theme.text.tertiary)}>{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
             <div>
                <h5 className={cn("text-xs font-bold uppercase mb-2", theme.text.tertiary)}>Example Response</h5>
                <CodeBlock code={method.response} />
             </div>
        </div>
    );
};

export const ApiGateway: React.FC = () => {
    const { theme } = useTheme();
    const [selectedService, setSelectedService] = useState<ApiServiceSpec | null>(null);

    const { data: apiSpec = [], isLoading } = useQuery<ApiServiceSpec[]>(
        ['admin', 'apiSpec'],
        DataService.admin.getApiSpec
    );

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;
    }

    return (
        <div className="h-full flex">
            {/* Sidebar */}
            <div className={cn("w-72 border-r flex flex-col", theme.surface.default, theme.border.default)}>
                <div className={cn("p-4 border-b", theme.border.default)}>
                    <h3 className={cn("font-bold text-sm", theme.text.primary)}>Data Services</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {apiSpec.map(service => (
                        <button 
                            key={service.name}
                            onClick={() => setSelectedService(service)}
                            className={cn(
                                "w-full text-left flex items-center justify-between p-3 rounded-md text-sm font-medium transition-colors",
                                selectedService?.name === service.name 
                                    ? cn(theme.primary.light, theme.primary.text) 
                                    : cn(theme.text.secondary, `hover:${theme.surfaceHighlight}`)
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <Server className="h-4 w-4"/>
                                <span className="capitalize">{service.name}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 opacity-50"/>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className={cn("flex-1 overflow-y-auto p-6 space-y-6", theme.surfaceHighlight)}>
                {selectedService ? (
                    <>
                        <div className="mb-4">
                            <h2 className={cn("text-2xl font-bold capitalize", theme.text.primary)}>{selectedService.name} API</h2>
                            <p className={cn("text-sm", theme.text.secondary)}>{selectedService.description}</p>
                        </div>
                        {selectedService.methods.map(method => (
                            <MethodCard key={method.name} method={method} />
                        ))}
                    </>
                ) : (
                    <div className={cn("flex h-full items-center justify-center text-center", theme.text.tertiary)}>
                        <div>
                            <Server className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                            <h3 className="font-bold">API Gateway</h3>
                            <p>Select a service from the left to view its endpoints.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApiGateway;