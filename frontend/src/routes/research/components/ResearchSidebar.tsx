import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';
import { type ResearchSession } from '@/types';

interface ResearchSidebarProps {
    history: ResearchSession[];
    activeSessionId: string | null;
    onSelectSession: (id: string) => void;
}

export function ResearchSidebar({
    history, activeSessionId, onSelectSession
}: ResearchSidebarProps) {
    const { theme } = useTheme();

    return (
        <div className={cn("w-80 border-r hidden md:flex md:flex-col shrink-0", theme.surface.default, theme.border.default)}>
            <div className={cn("p-4 border-b font-bold text-xs uppercase tracking-wide", theme.border.default, theme.text.tertiary)}>
                Recent Sessions
            </div>
            <div className="flex-1 overflow-y-auto">
                {(!history || history.length === 0) && (
                    <div className={cn("p-6 text-center text-sm", theme.text.tertiary)}>No research history.</div>
                )}
                {history?.map(session => (
                    <div
                        key={session.id}
                        onClick={() => onSelectSession(session.id)}
                        className={cn(
                            "p-4 border-b cursor-pointer transition-colors border-l-4",
                            theme.border.default,
                            activeSessionId === session.id
                                ? cn("border-l-blue-600", theme.surface.highlight)
                                : cn("border-l-transparent", `hover:${theme.surface.highlight}`)
                        )}
                    >
                        <p className={cn("text-sm font-medium line-clamp-2", activeSessionId === session.id ? theme.primary.text : theme.text.primary)}>
                            {session.query}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                            <span className={cn("text-[10px]", theme.text.tertiary)}>{session.timestamp}</span>
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border", theme.surface.default, theme.border.default, theme.text.secondary)}>{session?.sources?.length || 0} Sources</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
