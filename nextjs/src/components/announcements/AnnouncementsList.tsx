'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/shadcn/card';
import { Badge } from '@/components/ui/shadcn/badge';

interface Announcement {
  id: string;
  title: string;
  author: string;
  publishDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: string;
  content?: string;
}

interface AnnouncementsListProps {
  initialAnnouncements: Announcement[];
}

export function AnnouncementsList({ initialAnnouncements }: AnnouncementsListProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge variant="destructive" className="bg-orange-600 hover:bg-orange-700">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-100">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-100">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
      </div>
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No announcements
          </div>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold">
                      {announcement.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span>By {announcement.author}</span>
                      <span>•</span>
                      <span>{new Date(announcement.publishDate).toLocaleDateString()}</span>
                    </CardDescription>
                  </div>
                  {getPriorityBadge(announcement.priority)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Badge variant="outline" className="font-normal">
                  {announcement.targetAudience}
                </Badge>
                {announcement.content && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {announcement.content}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
