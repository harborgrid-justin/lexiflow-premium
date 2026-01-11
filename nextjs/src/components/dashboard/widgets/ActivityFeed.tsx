'use client';

import { formatDistanceToNow } from 'date-fns';
import { Activity } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';

export interface FeedItem {
  id: string;
  description: string;
  timestamp: string;
  userId?: string;
}

interface ActivityFeedProps {
  activities: FeedItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" /> Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg h-full min-h-50">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
              <Activity className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((item) => (
              <div key={item.id} className="relative pl-4 border-l border-slate-200 dark:border-slate-700 pb-4 last:pb-0 last:border-0">
                <div className="absolute top-0 -left-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-950" />
                <p className="text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {isValidDate(item.timestamp) ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true }) : item.timestamp}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function isValidDate(dateString: string) {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
