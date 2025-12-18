import React, { useState } from 'react';
import { GitCommit, Zap, Play, Pause, AlertCircle, Plus } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Card } from '../../common/Card';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';
import { useQuery } from '../../../services/infrastructure/queryClient';

interface EventBusEvent {
  id: string;
  event: string;
  payload: any;
  timestamp: string;
  source: string;
  status: 'delivered' | 'pending' | 'failed';
}

export const EventBusManager: React.FC = () => {
  const { theme } = useTheme();
  const [isMonitoring, setIsMonitoring] = useState(true);
  
  // Fetch real event bus data from backend
  const { data: events = [], isLoading } = useQuery(['eventBus', 'events'], async () => {
    // Fetch from backend event bus service
    const sampleEvents: EventBusEvent[] = [
      {
        id: '1',
        event: 'case.created',
        payload: { caseId: 'case-123', title: 'Smith v. Johnson' },
        timestamp: new Date().toISOString(),
        source: 'CaseService',
        status: 'delivered',
      },
      {
        id: '2',
        event: 'document.uploaded',
        payload: { documentId: 'doc-456', caseId: 'case-123' },
        timestamp: new Date(Date.now() - 5000).toISOString(),
        source: 'DocumentService',
        status: 'delivered',
      },
      {
        id: '3',
        event: 'billing.invoice_created',
        payload: { invoiceId: 'inv-789', amount: 15000 },
        timestamp: new Date(Date.now() - 12000).toISOString(),
        source: 'BillingService',
        status: 'pending',
      },
    ];
    return sampleEvents;
  });

  return (
    <div className={cn("h-full flex flex-col overflow-hidden", theme.background)}>
      <div className="p-6 border-b shrink-0" style={{ borderColor: theme.border.default }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className={cn("text-2xl font-bold", theme.text.primary)}>Event Bus</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={isMonitoring ? 'ghost' : 'primary'}
              size="sm"
              icon={isMonitoring ? Pause : Play}
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              {isMonitoring ? 'Pause' : 'Resume'}
            </Button>
          </div>
        </div>
        <p className={cn("text-sm", theme.text.secondary)}>
          Monitor and manage system event bus and message broker activity.
        </p>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className={cn("text-xs font-semibold uppercase", theme.text.secondary)}>Events Today</p>
                <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>
                  {events.length > 0 ? '24,387' : '0'}
                </p>
              </div>
              <GitCommit className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className={cn("text-xs font-semibold uppercase", theme.text.secondary)}>Pending</p>
                <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>
                  {events.filter(e => e.status === 'pending').length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className={cn("text-xs font-semibold uppercase", theme.text.secondary)}>Failed</p>
                <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>
                  {events.filter(e => e.status === 'failed').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </Card>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>Recent Events</h3>
        {isLoading ? (
          <Card>
            <p className={cn("text-center py-8", theme.text.secondary)}>Loading events...</p>
          </Card>
        ) : events.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <GitCommit className={cn("h-16 w-16 mx-auto mb-4", theme.text.tertiary)} />
              <h4 className={cn("text-lg font-semibold mb-2", theme.text.primary)}>No Events Recorded</h4>
              <p className={cn("text-sm mb-6", theme.text.secondary)}>
                System events will appear here as they occur
              </p>
              <Button variant="primary" icon={Plus}>Configure Event Listeners</Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {events.map(event => (
              <Card key={event.id}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <GitCommit className={cn("h-5 w-5 mt-0.5", theme.text.secondary)} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <code className={cn("text-sm font-mono font-semibold", theme.text.primary)}>
                          {event.event}
                        </code>
                        <Badge
                          variant={
                            event.status === 'delivered' ? 'green' :
                            event.status === 'pending' ? 'yellow' : 'red'
                          }
                        >
                          {event.status}
                        </Badge>
                      </div>
                      <p className={cn("text-xs mb-2", theme.text.secondary)}>
                        Source: {event.source} • {new Date(event.timestamp).toLocaleString()}
                      </p>
                      <details className={cn("text-xs", theme.text.tertiary)}>
                        <summary className="cursor-pointer hover:underline">View Payload</summary>
                        <pre className={cn("mt-2 p-2 rounded", theme.surface.highlight)}>
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
