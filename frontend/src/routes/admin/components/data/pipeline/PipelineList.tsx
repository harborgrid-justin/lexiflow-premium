import { Pipeline } from '@/lib/frontend-api';
import { useTheme } from '@/theme';
import { cn } from '@/shared/lib/cn';
import { Activity, ChevronRight, Clock, GitMerge, XCircle } from 'lucide-react';

interface PipelineListProps {
    pipelines: Pipeline[];
    selectedJob: Pipeline | null;
    onSelectJob: (job: Pipeline) => void;
}

export function PipelineList({ pipelines, selectedJob, onSelectJob }: PipelineListProps) {
    const { theme } = useTheme();

    // Ensure pipelines is always an array
    const pipelinesArray = Array.isArray(pipelines) ? pipelines : [];

    return (
        <div className={cn(
            "flex-1 p-6 overflow-y-auto space-y-4 w-full lg:w-1/2 lg:border-r transition-all duration-300",
            theme.border.default,
            selectedJob ? "hidden lg:block" : "block"
        )}>
            {pipelinesArray.map((p: Pipeline) => (
                <div
                    key={p.id}
                    onClick={() => onSelectJob(p)}
                    className={cn(
                        "flex items-center justify-between p-4 rounded-lg border shadow-sm cursor-pointer transition-all hover:shadow-md",
                        selectedJob?.id === p.id
                            ? cn(theme.primary.light, theme.primary.border, "ring-1 ring-blue-300")
                            : cn(theme.surface.default, theme.border.default)
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-full",
                            p.status === 'Running' ? "bg-blue-100 text-blue-600 animate-pulse" :
                                p.status === 'Failed' ? "bg-red-100 text-red-600" :
                                    p.status === 'Success' ? "bg-green-100 text-green-600" :
                                        cn(theme.surface.highlight, theme.text.secondary)
                        )}>
                            {p.status === 'Running' ? <Activity className="h-5 w-5" /> : p.status === 'Failed' ? <XCircle className="h-5 w-5" /> : <GitMerge className="h-5 w-5" />}
                        </div>
                        <div>
                            <h4 className={cn("font-bold text-sm", theme.text.primary)}>{p.name}</h4>
                            <div className={cn("flex items-center gap-3 text-xs mt-1", theme.text.secondary)}>
                                <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {p.lastRun}</span>
                                <span>{p.schedule}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={cn("px-3 py-1 rounded-full text-xs font-bold border",
                            p.status === 'Running' ? "bg-blue-50 border-blue-200 text-blue-700" :
                                p.status === 'Failed' ? "bg-red-50 border-red-200 text-red-700" :
                                    p.status === 'Success' ? "bg-green-50 border-green-200 text-green-700" :
                                        cn(theme.surface.highlight, theme.border.default, theme.text.secondary)
                        )}>{p.status}</span>
                        <ChevronRight className={cn("h-4 w-4", theme.text.tertiary)} />
                    </div>
                </div>
            ))}
        </div>
    );
};
