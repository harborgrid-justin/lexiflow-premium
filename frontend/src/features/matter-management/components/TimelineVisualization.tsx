import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Clock,
  FileText,
  Gavel,
  AlertTriangle,
  CheckCircle,
  Circle,
} from 'lucide-react';
import { TimelineEvent, CasePhase } from '../types';

interface TimelineVisualizationProps {
  caseId: string;
}

export const TimelineVisualization: React.FC<TimelineVisualizationProps> = ({
  caseId,
}) => {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [phases, setPhases] = useState<CasePhase[]>([]);
  const [viewMode, setViewMode] = useState<'timeline' | 'gantt'>('timeline');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
    loadPhases();
  }, [caseId]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      // API call would go here
      // const response = await fetch(`/api/cases/${caseId}/timeline`);
      // const data = await response.json();
      // setTimeline(data);

      // Mock data for demonstration
      setTimeline([
        {
          id: '1',
          type: 'filing',
          date: new Date('2026-01-01'),
          title: 'Case Filed',
          description: 'Initial complaint filed in Superior Court',
          status: 'completed',
        },
        {
          id: '2',
          type: 'deadline',
          date: new Date('2026-01-15'),
          title: 'Response Due',
          description: 'Deadline to file answer to complaint',
          status: 'completed',
          priority: 'high',
        },
        {
          id: '3',
          type: 'discovery',
          date: new Date('2026-02-01'),
          title: 'Discovery Begins',
          description: 'Initial disclosures exchanged',
          status: 'completed',
        },
        {
          id: '4',
          type: 'deadline',
          date: new Date('2026-03-15'),
          title: 'Expert Disclosure Deadline',
          description: 'Deadline to disclose expert witnesses',
          status: 'upcoming',
          priority: 'critical',
        },
        {
          id: '5',
          type: 'hearing',
          date: new Date('2026-04-01'),
          title: 'Motion Hearing',
          description: 'Hearing on motion for summary judgment',
          status: 'upcoming',
          priority: 'high',
        },
      ]);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPhases = async () => {
    try {
      // API call would go here
      setPhases([
        {
          id: 'phase-1',
          name: 'Pleadings',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-01-31'),
          status: 'completed',
          progress: 100,
          milestones: [],
          deadlines: [],
        },
        {
          id: 'phase-2',
          name: 'Discovery',
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-05-01'),
          status: 'active',
          progress: 45,
          milestones: [],
          deadlines: [],
        },
        {
          id: 'phase-3',
          name: 'Pre-Trial',
          startDate: new Date('2026-05-01'),
          endDate: new Date('2026-06-15'),
          status: 'upcoming',
          progress: 0,
          milestones: [],
          deadlines: [],
        },
      ]);
    } catch (error) {
      console.error('Failed to load phases:', error);
    }
  };

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'filing':
        return <FileText className="h-4 w-4" />;
      case 'deadline':
        return <Clock className="h-4 w-4" />;
      case 'hearing':
        return <Gavel className="h-4 w-4" />;
      case 'motion':
        return <FileText className="h-4 w-4" />;
      case 'discovery':
        return <FileText className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'upcoming':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderTimeline = () => (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

      {/* Timeline Events */}
      <div className="space-y-6">
        {timeline.map((event, index) => (
          <div key={event.id} className="relative flex gap-4">
            {/* Icon */}
            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-background bg-card">
              {getEventIcon(event.type)}
            </div>

            {/* Content */}
            <Card className="flex-1">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription>
                      {new Date(event.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {event.priority && (
                      <Badge className={getPriorityColor(event.priority)}>
                        {event.priority}
                      </Badge>
                    )}
                    {getStatusIcon(event.status)}
                  </div>
                </div>
              </CardHeader>
              {event.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                </CardContent>
              )}
            </Card>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGanttChart = () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Gantt chart visualization showing case phases and progress
      </div>
      {phases.map((phase) => (
        <Card key={phase.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{phase.name}</CardTitle>
                <CardDescription>
                  {new Date(phase.startDate).toLocaleDateString()} -{' '}
                  {phase.endDate
                    ? new Date(phase.endDate).toLocaleDateString()
                    : 'Ongoing'}
                </CardDescription>
              </div>
              <Badge
                className={
                  phase.status === 'completed'
                    ? 'bg-green-500'
                    : phase.status === 'active'
                    ? 'bg-blue-500'
                    : 'bg-gray-500'
                }
              >
                {phase.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">{phase.progress}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${phase.progress}%` }}
                />
              </div>
              {phase.milestones.length > 0 && (
                <div className="text-xs text-muted-foreground mt-2">
                  {phase.milestones.length} milestone(s), {phase.deadlines.length}{' '}
                  deadline(s)
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Case Timeline</CardTitle>
            <CardDescription>
              Visual timeline of case events and milestones
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timeline">Timeline View</SelectItem>
                <SelectItem value="gantt">Gantt Chart</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading timeline...</div>
        ) : viewMode === 'timeline' ? (
          renderTimeline()
        ) : (
          renderGanttChart()
        )}
      </CardContent>
    </Card>
  );
};

export default TimelineVisualization;
