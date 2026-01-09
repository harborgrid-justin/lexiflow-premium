'use client';

import { DataService } from '@/services/data/dataService';
import { formatDistanceToNow } from 'date-fns';
import { Activity, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';

interface FeedItem {
  id: string;
  description: string;
  timestamp: string;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Use DataService.cases to simulate activity feed
        const cases = await DataService.cases.getAll();
        const feed = cases.map((c: unknown) => ({
          id: c.id,
          description: `Case updated: ${c.title}`,
          timestamp: c.updatedAt
        })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

        setActivities(feed);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>;

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Recent Activity</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map(item => (
            <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
              <div className="text-sm">
                <p className="font-medium">{item.description}</p>
                <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
