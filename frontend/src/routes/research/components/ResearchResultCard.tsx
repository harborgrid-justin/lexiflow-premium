import { useTheme } from '@/theme';
import { useReadAnalytics } from '@/hooks/useReadAnalytics';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/atoms/Badge/Badge';
import { SearchResult } from '@/types';
import { ExternalLink } from 'lucide-react';
interface ResearchResultCardProps {
    source: SearchResult;
    onView: () => void;
}

export function ResearchResultCard({ source, onView }: ResearchResultCardProps) {
    const { theme } = useTheme();
    const { ref, isRead, duration: _duration } = useReadAnalytics(source.id, {
        thresholdMs: 2000, // Mark as "read" after 2 seconds
        onRead: (id, readDuration) => console.log(`[Analytics] User read search result ${id} for ${readDuration}ms`)
    });

    return (
        <div
            ref={ref}
            className={cn(
                "p-4 rounded-lg border transition-all shadow-sm flex flex-col group cursor-pointer",
                theme.surface.default,
                theme.border.default,
                `hover:${theme.primary.border}`,
                isRead && 'border-green-200 dark:border-green-800'
            )}
            onClick={onView}
        >
            <div className="flex justify-between items-start">
                <div className={cn("text-sm font-bold hover:underline line-clamp-1 flex items-center", theme.primary.text)}>
                    {source.title} <ExternalLink className="h-3 w-3 ml-2 opacity-50" />
                </div>
                <div className="flex items-center gap-2">
                    {isRead && <Badge variant="success">Viewed</Badge>}
                    <Badge variant="neutral">Web Source</Badge>
                </div>
            </div>
            <p className={cn("text-xs mt-1 line-clamp-1 font-mono", theme.text.tertiary)}>{source.url}</p>
            <p className={cn("text-xs mt-2 line-clamp-2", theme.text.secondary)}>{source.snippet}</p>
        </div>
    );
};
