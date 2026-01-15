/**
 * CaseOverviewStats.tsx
 *
 * Key performance metrics dashboard with revenue, time, and task completion stats.
 * Now includes real-time Strategy Health metrics.
 *
 * @module components/case-detail/overview/CaseOverviewStats
 * @category Case Management - Overview
 */

// External Dependencies
import { CheckCircle, DollarSign, ExternalLink, ShieldAlert, TrendingUp } from 'lucide-react';
// Internal Dependencies - Hooks & Context
import { useQuery } from '@/hooks/useQueryHooks';
import { useWindow } from '@/providers';
import { useTheme } from "@/hooks/useTheme";

// Internal Dependencies - Services & Utils
import { DataService } from '@/services/data/data-service.service';
import { cn } from '@/lib/cn';

interface CaseOverviewStatsProps {
    caseId?: string;
}

export const CaseOverviewStats: React.FC<CaseOverviewStatsProps> = ({ caseId }) => {
    const { theme } = useTheme();
    const { openWindow, closeWindow } = useWindow();

    // Fetch Strategy Health Data
    const { data: strategyData } = useQuery(
        ['case-strategy', caseId],
        () => caseId ? DataService.strategy.getCaseStrategy(caseId) : Promise.resolve(null),
        { enabled: !!caseId }
    );

    const data = strategyData as { arguments?: unknown[]; defenses?: unknown[]; citations?: unknown[] } | null;
    const argsCount = data?.arguments?.length || 0;
    const defsCount = data?.defenses?.length || 0;
    const citesCount = data?.citations?.length || 0;
    const healthValue = `${argsCount} / ${defsCount} / ${citesCount}`;

    const handleDetail = (title: string) => {
        const winId = `stat-${title.toLowerCase().replace(' ', '-')}`;
        openWindow(
            winId,
            `Detail: ${title}`,
            <div className={cn("p-6 flex flex-col items-center justify-center h-full text-center", theme.text.primary)}>
                <h3 className="text-xl font-bold mb-2">{title} Breakdown</h3>
                <p className={theme.text.secondary}>Detailed analytics and historical data for this metric would appear here.</p>
                <button className={cn("mt-4 underline", theme.primary.text)} onClick={() => closeWindow(winId)}>Close</button>
            </div>
        );
    };

    const stats = [
        { label: "Total Billed", value: "124,500", icon: DollarSign, color: theme.status.success.text },
        { label: "Strategy Health", value: healthValue, icon: ShieldAlert, color: theme.chart.colors.blue },
        { label: "Open Tasks", value: "12", icon: CheckCircle, color: theme.chart.colors.purple },
        { label: "Risk Score", value: "Low", icon: TrendingUp, color: theme.status.warning.text }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
                <div
                    key={i}
                    onClick={() => handleDetail(stat.label)}
                    className={cn(
                        "p-4 rounded-lg border shadow-sm flex flex-col justify-center cursor-pointer group relative overflow-hidden",
                        theme.surface.default, theme.border.default,
                        `hover:${theme.surface.highlight}`,
                        `hover:${theme.primary.border} transition-all`
                    )}
                >
                    <p className={cn("text-xs font-bold uppercase mb-1", theme.text.secondary)}>{stat.label}</p>
                    <div className={cn("flex items-center font-bold text-lg", theme.text.primary)}>
                        <stat.icon className={cn("h-4 w-4 mr-1", stat.color)} />
                        <span className="truncate" title={stat.value}>{stat.value}</span>
                    </div>
                    {stat.label === "Strategy Health" && (
                        <div className={cn("text-[10px] mt-1 opacity-70", theme.text.secondary)}>
                            Args / Defs / Cites
                        </div>
                    )}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className={cn("h-3 w-3", theme.text.tertiary)} />
                    </div>
                </div>
            ))}
        </div>
    );
};
