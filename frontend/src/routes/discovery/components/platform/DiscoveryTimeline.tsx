/**
 * DiscoveryTimeline.tsx
 * Visual Timeline of Discovery Events and Deadlines
 */

import { Badge } from '@/shared/ui/atoms/Badge';
import { Button } from '@/shared/ui/atoms/Button';
import { useTheme } from '@/theme';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/data-service.service';
import { DiscoveryRepository } from '@/services/data/repositories/DiscoveryRepository';
import type { DiscoveryTimelineEvent } from '@/types/discovery-enhanced';
import { cn } from '@/shared/lib/cn';
import { AlertCircle, Calendar, CheckCircle, Clock, FileText, Flag } from 'lucide-react';


interface DiscoveryTimelineProps {
  caseId?: string;
}

export function DiscoveryTimeline({ caseId }: DiscoveryTimelineProps) {
  const { theme } = useTheme();

  const { data: events = [], isLoading } = useQuery<DiscoveryTimelineEvent[]>(
    caseId ? ['discovery', 'timeline', caseId] : ['discovery', 'timeline', 'all'],
    () => (DataService.discovery as unknown as DiscoveryRepository).getTimelineEvents(caseId)
  );

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading timeline...</div>;
  }

  const getEventIcon = (eventType: DiscoveryTimelineEvent['eventType']) => {
    switch (eventType) {
      case 'deadline': return <Clock className="h-5 w-5" />;
      case 'production': return <FileText className="h-5 w-5" />;
      case 'hold_issued': return <Flag className="h-5 w-5" />;
      case 'hold_released': return <CheckCircle className="h-5 w-5" />;
      case 'collection': return <Calendar className="h-5 w-5" />;
      case 'review_started': return <FileText className="h-5 w-5" />;
      case 'review_completed': return <CheckCircle className="h-5 w-5" />;
      case 'motion_filed': return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: DiscoveryTimelineEvent['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 border-green-300';
      case 'upcoming': return 'text-blue-600 bg-blue-100 border-blue-300';
      case 'overdue': return 'text-red-600 bg-red-100 border-red-300';
      case 'cancelled': return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const getPriorityBadge = (priority?: DiscoveryTimelineEvent['priority']) => {
    switch (priority) {
      case 'critical': return <Badge variant="danger" size="sm">Critical</Badge>;
      case 'high': return <Badge variant="warning" size="sm">High</Badge>;
      case 'normal': return <Badge variant="info" size="sm">Normal</Badge>;
      case 'low': return <Badge variant="neutral" size="sm">Low</Badge>;
      default: return null;
    }
  };

  const sortedEvents = [...events].sort((a, b) =>
    new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className={cn("font-bold text-lg", theme.text.primary)}>Discovery Timeline</h3>
            <p className={cn("text-sm", theme.text.secondary)}>Track discovery events, deadlines, and milestones</p>
          </div>
          <Button variant="secondary">Filter Events</Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className={cn("absolute left-6 top-0 bottom-0 w-0.5", theme.surface.highlight)} />

        <div className="space-y-6">
          {sortedEvents.map((event, _index) => (
            <div key={event.id} className="relative pl-16">
              {/* Timeline dot */}
              <div
                className={cn(
                  "absolute left-3 w-6 h-6 rounded-full border-4 flex items-center justify-center",
                  getStatusColor(event.status)
                )}
              >
                {getEventIcon(event.eventType)}
              </div>

              {/* Event card */}
              <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={cn("font-bold", theme.text.primary)}>{event.title}</h4>
                      {getPriorityBadge(event.priority)}
                      <Badge variant={event.status === 'completed' ? 'success' : 'info'} size="sm">
                        {event.status}
                      </Badge>
                    </div>
                    <p className={cn("text-sm", theme.text.secondary)}>{event.description}</p>
                  </div>
                  <div className={cn("text-sm font-medium whitespace-nowrap ml-4", theme.text.primary)}>
                    {event.eventDate}
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 text-xs">
                  {event.dueDate && (
                    <div className={cn("flex items-center gap-1", theme.text.secondary)}>
                      <Clock className="h-3 w-3" />
                      <span>Due: {event.dueDate}</span>
                    </div>
                  )}
                  {event.assignedTo && event.assignedTo.length > 0 && (
                    <div className={cn("flex items-center gap-1", theme.text.secondary)}>
                      <span>Assigned: {event.assignedTo.join(', ')}</span>
                    </div>
                  )}
                  {event.completedAt && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span>Completed: {new Date(event.completedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DiscoveryTimeline;
