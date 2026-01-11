/**
 * DiscoveryTimeline.tsx
 * Visual Timeline of Discovery Events and Deadlines
 */

import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, FileText, Flag } from 'lucide-react';
import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { useTheme } from '@/providers';
import { cn } from '@/utils/cn';
import type { DiscoveryTimelineEvent } from '@/types/discovery-enhanced';

export const DiscoveryTimeline: React.FC = () => {
  const { theme } = useTheme();

  const [events] = useState<DiscoveryTimelineEvent[]>([
    {
      id: 'EVT-001',
      caseId: 'C-2024-001',
      eventType: 'hold_issued',
      title: 'Legal Hold Issued',
      description: 'Executive Communications Hold issued to 15 custodians',
      eventDate: '2024-01-10',
      status: 'completed',
      relatedEntityType: 'hold',
      relatedEntityId: 'LH-001',
      completedAt: '2024-01-10T09:00:00Z',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-10'
    },
    {
      id: 'EVT-002',
      caseId: 'C-2024-001',
      eventType: 'collection',
      title: 'Email Collection Started',
      description: 'Collection of executive email accounts initiated',
      eventDate: '2024-01-15',
      status: 'completed',
      relatedEntityType: 'collection',
      relatedEntityId: 'COL-001',
      completedAt: '2024-01-15T14:30:00Z',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 'EVT-003',
      caseId: 'C-2024-001',
      eventType: 'deadline',
      title: 'Initial Disclosures Due',
      description: 'FRCP 26(a)(1) initial disclosures deadline',
      eventDate: '2024-02-01',
      dueDate: '2024-02-01',
      status: 'upcoming',
      priority: 'high',
      assignedTo: ['Legal Team'],
      createdAt: '2024-01-10',
      updatedAt: '2024-01-10'
    },
    {
      id: 'EVT-004',
      caseId: 'C-2024-001',
      eventType: 'review_started',
      title: 'Document Review Phase Begins',
      description: 'First-pass review of 15,420 collected documents',
      eventDate: '2024-01-20',
      status: 'completed',
      completedAt: '2024-01-20T08:00:00Z',
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20'
    },
    {
      id: 'EVT-005',
      caseId: 'C-2024-001',
      eventType: 'production',
      title: 'Production 001 Due',
      description: 'Initial document production to plaintiff',
      eventDate: '2024-02-15',
      dueDate: '2024-02-15',
      status: 'upcoming',
      priority: 'critical',
      relatedEntityType: 'production',
      relatedEntityId: 'PROD-001',
      assignedTo: ['Discovery Team'],
      createdAt: '2024-01-10',
      updatedAt: '2024-01-10'
    },
    {
      id: 'EVT-006',
      caseId: 'C-2024-001',
      eventType: 'deadline',
      title: 'Fact Discovery Cutoff',
      description: 'All fact discovery must be completed',
      eventDate: '2024-04-30',
      dueDate: '2024-04-30',
      status: 'upcoming',
      priority: 'critical',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-10'
    }
  ]);

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
          {sortedEvents.map((event) => (
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
};

export default DiscoveryTimeline;
