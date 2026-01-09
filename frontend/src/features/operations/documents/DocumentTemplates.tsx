import { Button } from '@/shared/ui/atoms/Button/Button';
import { AdaptiveLoader } from '@/shared/ui/molecules/AdaptiveLoader/AdaptiveLoader';
import { useQuery } from '@/hooks/useQueryHooks';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { DataService } from '@/services/data/dataService';
import { cn } from '@/shared/lib/cn';
import { ArrowRight, FileText, Wand2 } from 'lucide-react';
// ✅ Migrated to backend API (2025-12-21)

interface Template {
    id: string;
    title: string;
    category: string;
    popular: boolean;
}

export function DocumentTemplates() {
    const { theme } = useTheme();

    // Performance Engine: useQuery
    const { data: templates = [], isLoading } = useQuery<Template[]>(
        ['templates', 'docs'],
        () => DataService.documents.getTemplates()
    );

    if (isLoading) return <AdaptiveLoader contentType="dashboard" itemCount={6} shimmer />;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className={cn("p-6 rounded-lg shadow-sm border flex justify-between items-center", theme.surface.default, theme.border.default)}>
                <div>
                    <h3 className={cn("text-lg font-bold flex items-center", theme.text.primary)}>
                        <Wand2 className="h-5 w-5 mr-2 text-purple-600" /> Automated Drafting
                    </h3>
                    <p className={cn("text-sm", theme.text.secondary)}>Select a template to launch the AI-assisted document assembly wizard.</p>
                </div>
                <Button variant="primary">Create New Template</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(tpl => (
                    <div
                        key={tpl.id}
                        className={cn(
                            "group p-5 rounded-xl border shadow-sm transition-all cursor-pointer hover:shadow-md",
                            theme.surface.default,
                            theme.border.default,
                            `hover:${theme.primary.border}`
                        )}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className={cn("p-2 rounded-lg", theme.surface.highlight)}>
                                <FileText className={cn("h-6 w-6", theme.primary.text)} />
                            </div>
                            {tpl.popular && (
                                <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full uppercase", theme.status.success.bg, theme.status.success.text)}>Popular</span>
                            )}
                        </div>
                        <h4 className={cn("font-bold text-sm mb-1", theme.text.primary)}>{tpl.title}</h4>
                        <p className={cn("text-xs mb-4", theme.text.secondary)}>{tpl.category}</p>

                        <div className={cn("pt-3 border-t flex justify-between items-center", theme.border.default)}>
                            <span className={cn("text-xs font-medium", theme.text.tertiary)}>v2.4</span>
                            <span className={cn("text-xs font-bold flex items-center transition-colors", theme.primary.text, "group-hover:translate-x-1")}>
                                Start Draft <ArrowRight className="h-3 w-3 ml-1" />
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
