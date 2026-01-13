import { AdaptiveLoader } from '@/shared/ui/molecules/AdaptiveLoader/AdaptiveLoader';
import { useTheme } from '@/features/theme';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { cn } from '@/shared/lib/cn';
import { queryKeys } from '@/utils/queryKeys';
import { CheckSquare, Lock } from 'lucide-react';
// ✅ Migrated to backend API (2025-12-21)

export const TaskDependencyManager = () => {
    const { theme } = useTheme();

    // Performance Engine: useQuery
    const { data: tasks = [], isLoading } = useQuery(
        queryKeys.tasks.all(),
        () => DataService.tasks.getAll()
    );

    // Real dependency derivation
    const dependencies = React.useMemo(() => {
        // Ensure tasks is always an array (conditional moved inside useMemo)
        const tasksArray = Array.isArray(tasks) ? tasks : [];

        // Filter tasks that have dependencies or are dependencies of others
        // For visualization, we'll just take a chain of tasks if they exist,
        // or create a synthetic chain from tasks sorted by due date if no explicit dependencies exist (fallback for demo data)

        const tasksWithDeps = tasksArray.filter(t => t.dependencies && t.dependencies.length > 0);

        if (tasksWithDeps.length > 0) {
            // If we have real dependencies, use them.
            // For this simple list view, we'll just show the first few tasks with dependencies.
            return tasksWithDeps.slice(0, 5).map(t => {
                const isCompleted = t.status === 'Done' || t.status === 'Completed';
                const isActive = t.status === 'In Progress';
                return {
                    ...t,
                    type: isCompleted ? 'completed' : isActive ? 'active' : 'locked'
                };
            });
        }

        // Fallback: Sort by due date and show as a sequence
        const sortedTasks = [...tasksArray]
            .filter(t => t.status !== 'Done' && t.status !== 'Completed')
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 5);

        return sortedTasks.map((t, idx) => {
            const isCompleted = t.status === 'Done' || t.status === 'Completed';
            const isActive = idx === 0; // First one is active
            return {
                ...t,
                type: isCompleted ? 'completed' : isActive ? 'active' : 'locked'
            };
        });
    }, [tasks]);

    if (isLoading) return <AdaptiveLoader contentType="list" shimmer itemCount={4} />;

    return (
        <div className="space-y-4 max-w-lg mx-auto py-4">
            <h3 className={cn("font-bold text-center mb-6", theme.text.primary)}>Task Dependency Chain</h3>

            <div className="relative">
                <div className={cn("absolute left-6 top-8 bottom-8 w-0.5 -z-10", theme.border.default)}></div>

                {dependencies.map((task, idx) => (
                    <div key={task.id} className="flex items-center gap-4 mb-6 last:mb-0">
                        <div className={cn(
                            "w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 z-10",
                            task.type === 'completed' ? "bg-green-100 border-green-500" :
                                task.type === 'active' ? "bg-blue-100 border-blue-500" :
                                    "bg-slate-50 border-slate-300"
                        )}>
                            {task.type === 'completed' && <CheckSquare className="h-6 w-6 text-green-600" />}
                            {task.type === 'active' && <span className="font-bold text-blue-700">{idx + 1}</span>}
                            {task.type === 'locked' && <Lock className="h-5 w-5 text-slate-400" />}
                        </div>
                        <div className={cn(
                            "p-3 rounded-lg border shadow-sm flex-1",
                            theme.surface.default,
                            theme.border.default,
                            task.type === 'active' ? "ring-2 ring-blue-100" : task.type === 'locked' ? "opacity-75" : ""
                        )}>
                            <p className={cn("font-bold text-sm", task.type === 'completed' ? "line-through opacity-50" : theme.text.primary)}>{task.title}</p>
                            <p className={cn("text-xs font-medium",
                                task.type === 'completed' ? "text-green-600" :
                                    task.type === 'active' ? "text-blue-600" :
                                        theme.text.tertiary
                            )}>
                                {task.type === 'completed' ? 'Completed' : task.type === 'active' ? 'In Progress' : `Blocked by Task ${idx}`}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
