'use client';

import { useState } from 'react';

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
  const [announcements] = useState<Announcement[]>(initialAnnouncements);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Announcements</h1>
      </div>
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No announcements
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="p-5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {announcement.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>By {announcement.author}</span>
                    <span>•</span>
                    <span>{new Date(announcement.publishDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${announcement.priority === 'urgent'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : announcement.priority === 'high'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        : announcement.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}
                >
                  {announcement.priority}
                </span>
              </div>
              <div className="mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {announcement.targetAudience}
                </span>
              </div>
              {announcement.content && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {announcement.content}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
