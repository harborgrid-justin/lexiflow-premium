'use client';

import { Activity, ActivityType } from '@/types/dashboard';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  LucideIcon,
  MessageSquare,
  Upload,
  UserPlus,
} from 'lucide-react';
import React from 'react';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/shadcn/avatar';

export interface ActivityFeedProps {
  activities: Activity[];
  isLoading?: boolean;
  maxItems?: number;
  showAvatars?: boolean;
  onActivityClick?: (activity: Activity) => void;
  emptyMessage?: string;
  className?: string;
}

const activityConfig: Record<ActivityType, { icon: LucideIcon; color: string; bgColor: string }> = {
  case_created: {
    icon: Briefcase,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  case_updated: {
    icon: Briefcase,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
  },
  case_closed: {
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  document_uploaded: {
    icon: Upload,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  task_completed: {
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  deadline_approaching: {
    icon: Clock,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  payment_received: {
    icon: DollarSign,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  team_member_added: {
    icon: UserPlus,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  comment_added: {
    icon: MessageSquare,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
  },
  status_changed: {
    icon: AlertTriangle,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
};

const formatTimestamp = (timestamp: Date | string): string => {
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'recently';
  }
};

export function ActivityFeed({
  activities,
  maxItems = 10,
  showAvatars = true,
  onActivityClick,
  emptyMessage = 'No recent activity',
}: ActivityFeedProps) {

  const displayActivities = activities.slice(0, maxItems);

  if (displayActivities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayActivities.map((activity) => {
        const config = activityConfig[activity.type] || activityConfig.status_changed;
        const Icon = activity.icon || config.icon;

        return (
          <Card
            key={activity.id}
            className={`transition-colors hover:bg-muted/50 ${onActivityClick ? 'cursor-pointer' : ''}`}
            onClick={() => onActivityClick?.(activity)}
          >
            <CardContent className="p-4 flex gap-4 items-start">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.bgColor}`}>
                {showAvatars && activity.user?.avatar ? (
                  <Avatar>
                    <AvatarImage src={activity.user.avatar} />
                    <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <Icon className={`h-5 w-5 ${config.color}`} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium">
                    {activity.title}
                  </p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {activity.description}
                </p>
                {activity.user && (
                  <p className="text-xs text-muted-foreground">
                    by {activity.user.name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
