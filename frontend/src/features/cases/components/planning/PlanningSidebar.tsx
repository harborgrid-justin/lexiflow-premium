import { DataService } from '@/services/data/dataService';
import { cn } from '@/utils/cn';
import { Calendar, CheckSquare, Clock, Flag, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface PlanningSidebarProps {
  className?: string;
}

interface CaseStats {
  timelineEvents: number;
  activeTasks: number;
  teamMembers: number;
  milestones: number;
  upcomingDeadlines: number;
}

export const PlanningSidebar: React.FC<PlanningSidebarProps> = ({ className }) => {
  const [stats, setStats] = useState<CaseStats>({
    timelineEvents: 0,
    activeTasks: 0,
    teamMembers: 0,
    milestones: 0,
    upcomingDeadlines: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch real data from backend via DataService
        // Parallel execution for performance
        const [tasks, team, events] = await Promise.all([
          DataService.cases.getTasks({ status: 'IN_PROGRESS' }),
          DataService.cases.getTeam(),
          DataService.cases.getTimeline()
        ]);

        setStats({
          activeTasks: Array.isArray(tasks) ? tasks.length : 0,
          teamMembers: Array.isArray(team) ? team.length : 0,
          timelineEvents: Array.isArray(events) ? events.length : 0,
          // These would be filtered subsets in a real app
          milestones: Array.isArray(events) ? events.filter((e: any) => e.type === 'MILESTONE').length : 0,
          upcomingDeadlines: Array.isArray(tasks) ? tasks.filter((t: any) => t.dueDate && new Date(t.dueDate) > new Date()).length : 0,
        });
      } catch (error) {
        console.error("Failed to load planning stats", error);
      }
    };
    fetchData();
  }, []);

  const sections = [
    { title: 'Timeline', icon: Calendar, count: stats.timelineEvents },
    { title: 'Tasks', icon: CheckSquare, count: stats.activeTasks },
    { title: 'Team', icon: Users, count: stats.teamMembers },
    { title: 'Milestones', icon: Flag, count: stats.milestones },
    { title: 'Deadlines', icon: Clock, count: stats.upcomingDeadlines },
  ];

  return (
    <div className={cn("w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 h-full flex flex-col", className)}>
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Case Planning</h3>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {sections.map((section) => (
          <div
            key={section.title}
            className="px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <section.icon className="w-4 h-4 text-slate-500 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400" />

              <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100">{section.title}</span>
            </div>
            <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">{section.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
