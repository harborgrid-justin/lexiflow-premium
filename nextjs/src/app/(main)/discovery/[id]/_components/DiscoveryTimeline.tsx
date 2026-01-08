/**
 * Discovery Timeline Component
 * Shows the timeline of events for a discovery request
 */

import { Card, CardBody } from '@/components/ui';
import {
  FileText,
  Send,
  CheckCircle,
  AlertTriangle,
  Clock,
  MessageSquare,
  Upload,
  Download,
} from 'lucide-react';

interface DiscoveryTimelineProps {
  requestId: string;
}

interface TimelineEvent {
  id: string;
  type: 'created' | 'served' | 'response' | 'objection' | 'document' | 'production' | 'deadline' | 'motion';
  title: string;
  description?: string;
  date: string;
  user?: string;
}

// Mock data - in production this would come from the API
const mockEvents: TimelineEvent[] = [
  {
    id: '1',
    type: 'created',
    title: 'Request Created',
    description: 'Discovery request was created',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    user: 'John Smith',
  },
  {
    id: '2',
    type: 'served',
    title: 'Request Served',
    description: 'Discovery request was served via email',
    date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    user: 'John Smith',
  },
  {
    id: '3',
    type: 'document',
    title: 'Documents Uploaded',
    description: '245 documents were added to the collection',
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    user: 'Sarah Johnson',
  },
  {
    id: '4',
    type: 'response',
    title: 'Response Received',
    description: 'Initial response received from opposing party',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    type: 'objection',
    title: 'Objection Filed',
    description: 'Objection to Request #12-15 citing privilege',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    type: 'production',
    title: 'Production Set Created',
    description: 'PROD-001 created with 180 documents',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    user: 'Sarah Johnson',
  },
];

const eventConfig: Record<TimelineEvent['type'], {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}> = {
  created: {
    icon: <FileText className="h-4 w-4" />,
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
  },
  served: {
    icon: <Send className="h-4 w-4" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  response: {
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  objection: {
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  document: {
    icon: <Upload className="h-4 w-4" />,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  production: {
    icon: <Download className="h-4 w-4" />,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
  },
  deadline: {
    icon: <Clock className="h-4 w-4" />,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  motion: {
    icon: <FileText className="h-4 w-4" />,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
};

export async function DiscoveryTimeline({ requestId }: DiscoveryTimelineProps) {
  // In production, fetch timeline events from API
  // const events = await getTimelineEvents(requestId);
  const events = mockEvents;

  return (
    <Card>
      <CardBody>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          Activity Timeline
        </h3>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

          {/* Events */}
          <div className="space-y-6">
            {events.map((event, index) => {
              const config = eventConfig[event.type];
              const date = new Date(event.date);

              return (
                <div key={event.id} className="relative flex gap-4">
                  {/* Icon */}
                  <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${config.bgColor} ${config.color}`}>
                    {config.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-6">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                          {event.title}
                        </h4>
                        {event.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                            {event.description}
                          </p>
                        )}
                        {event.user && (
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            by {event.user}
                          </p>
                        )}
                      </div>
                      <time className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(date)}
                      </time>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return 'Today';
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}
